import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useMemo, useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import type { WebViewNavigation } from 'react-native-webview/lib/WebViewTypes';

import { cashfreeCheckoutURL } from '@/services/api';
import { issueBulkStaticPolicy, issueStaticPolicy, verifyCashfreePaymentStatus } from '@/services/static-quote.service';
import {
  clearPendingStaticPolicyPayment,
  getPendingStaticPolicyPayment,
} from '@/store/pending-static-policy-payment';

export default function CashfreeCheckoutScreen() {
  const params = useLocalSearchParams<{
    paymentSessionId?: string | string[];
    orderId?: string | string[];
  }>();
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('Opening Cashfree checkout...');
  const isProcessingPaymentRef = useRef(false);
  const didCompletePaymentRef = useRef(false);
  const lastHandledReturnUrlRef = useRef<string | null>(null);

  const paymentSessionId = getSingleParam(params.paymentSessionId);
  const orderId = getSingleParam(params.orderId);

  const checkoutHtml = useMemo(() => {
    if (!paymentSessionId) {
      return '';
    }

    return buildCashfreeCheckoutHtml(paymentSessionId);
  }, [paymentSessionId]);

  if (!paymentSessionId || !orderId) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Missing payment details</Text>
          <Text style={styles.errorText}>
            Cashfree checkout could not start because the required payment details were not found.
          </Text>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  function handleNavigationStateChange(navigationState: WebViewNavigation) {
    const currentUrl = navigationState.url || '';

    console.log('currentUrl', currentUrl);

    if (orderId && shouldVerifyCashfreeNavigation(currentUrl)) {
      if (lastHandledReturnUrlRef.current === currentUrl) {
        return;
      }

      lastHandledReturnUrlRef.current = currentUrl;
      void handleVerifiedPayment(orderId);
      return;
    }

    if (/return|success|failure|status|thankyou|process/i.test(currentUrl)) {
      console.log('Cashfree checkout navigation:', {
        orderId,
        currentUrl,
      });
    }
  }

  function handleWebViewError() {
    Alert.alert('Checkout failed', 'Unable to load the Cashfree checkout page. Please try again.');
    router.back();
  }

  async function handleVerifiedPayment(
    resolvedOrderId: string,
  ) {
    if (isProcessingPaymentRef.current || didCompletePaymentRef.current) {
      return;
    }

    const pendingPayment = getPendingStaticPolicyPayment();

    if (!pendingPayment || pendingPayment.orderId !== resolvedOrderId) {
      Alert.alert(
        'Payment details missing',
        'The payment was completed, but the app could not find the policy details to save.'
      );
      router.back();
      return;
    }

    isProcessingPaymentRef.current = true;
    setIsLoading(true);
    setStatusMessage('Verifying payment...');

    try {
      console.log('Cashfree checkout payment callback:', {
        orderId: resolvedOrderId,
      });

      const paymentStatus = await verifyCashfreePaymentStatus(resolvedOrderId);
      const statusText = getCashfreeStatusText(paymentStatus) ?? 'UNKNOWN';
      const isPaymentSuccessful = isSuccessfulCashfreePayment(paymentStatus);

      if (!isPaymentSuccessful) {
        if (isPendingCashfreePayment(statusText)) {
          setStatusMessage('Waiting for payment confirmation...');
          return;
        }

        Alert.alert('Payment not completed', `Payment status is ${statusText}.`);
        return;
      }

      setStatusMessage('Issuing policy...');
      if (pendingPayment.policyPayload.lead_type === 'bulk') {
        await issueBulkStaticPolicy(pendingPayment.policyPayload, pendingPayment.bulkFile);
      } else {
        await issueStaticPolicy(pendingPayment.policyPayload);
      }

      const issuedPolicyParams = buildIssuedPolicyParams(pendingPayment.policyPayload);

      didCompletePaymentRef.current = true;
      clearPendingStaticPolicyPayment();
      router.replace({
        pathname: '/policy-issued',
        params: issuedPolicyParams,
      });
    } catch (error) {
      console.log('Cashfree payment verification error:', error);
      const message =
        error instanceof Error ? error.message : 'Unable to verify payment right now. Please try again.';
      Alert.alert('Verification failed', message);
    } finally {
      if (!didCompletePaymentRef.current) {
        isProcessingPaymentRef.current = false;
        setIsLoading(false);
        setStatusMessage('Opening Cashfree checkout...');
      }
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.iconButton} onPress={() => router.back()}>
          <ArrowLeft size={22} color="#0C4A6E" strokeWidth={2.4} />
        </Pressable>
        <Text style={styles.headerTitle}>Secure Payment</Text>
        <View style={styles.headerSpacer} />
      </View>

      {isLoading ? (
        <View style={styles.loadingBanner}>
          <Text style={styles.loadingText}>{statusMessage}</Text>
        </View>
      ) : null}

      <WebView
        originWhitelist={['*']}
        source={{ html: checkoutHtml, baseUrl: cashfreeCheckoutURL }}
        onLoadEnd={() => {
          if (!isProcessingPaymentRef.current && !didCompletePaymentRef.current) {
            setIsLoading(false);
          }
        }}
        onError={handleWebViewError}
        onHttpError={handleWebViewError}
        onNavigationStateChange={handleNavigationStateChange}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
      />
    </SafeAreaView>
  );
}

function isSuccessfulCashfreePayment(response: Record<string, unknown>) {
  const statusText = getCashfreeStatusText(response);

  if (!statusText) {
    return false;
  }

  return ['SUCCESS', 'PAID', 'COMPLETED', 'CAPTURED', 'CHARGED'].includes(statusText);
}

function isPendingCashfreePayment(statusText: string) {
  return ['ACTIVE', 'PENDING', 'IN_PROGRESS', 'PROCESSING', 'NOT_ATTEMPTED'].includes(statusText);
}

function shouldVerifyCashfreeNavigation(currentUrl: string) {
  if (!currentUrl) {
    return false;
  }

  return [
    /\/gateway\/thankyou\/process\//i,
    /\/gateway\/process\//i,
    /\/payment-status(?:\?|$|\/)/i,
  ].some((pattern) => pattern.test(currentUrl));
}

function getCashfreeStatusText(value: unknown): string | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const record = value as Record<string, unknown>;
  const statusFields = ['payment_status', 'order_status', 'status', 'paymentStatus', 'orderStatus'];

  for (const field of statusFields) {
    const fieldValue = record[field];
    if (typeof fieldValue === 'string' && fieldValue.trim()) {
      return fieldValue.trim().toUpperCase();
    }
  }

  for (const nestedValue of Object.values(record)) {
    const nestedStatus = getCashfreeStatusText(nestedValue);
    if (nestedStatus) {
      return nestedStatus;
    }
  }

  return null;
}

function buildCashfreeCheckoutHtml(paymentSessionId: string) {
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
    <title>Cashfree Checkout</title>
    <style>
      body {
        margin: 0;
        font-family: sans-serif;
        background: #ffffff;
      }
    </style>
  </head>
  <body>
    <form id="cashfreeCheckoutForm" action="${cashfreeCheckoutURL}" method="post">
      <input type="hidden" name="payment_session_id" value="${escapeHtml(paymentSessionId)}" />
      <input type="hidden" name="platform" value="androidx-c-x-x-x-w-x-a-" />
    </form>
    <script>
      (function () {
        var form = document.getElementById('cashfreeCheckoutForm');
        var meta = { userAgent: window.navigator.userAgent };
        var sortedMeta = Object.entries(meta).sort().reduce(function (acc, entry) {
          acc[entry[0]] = entry[1];
          return acc;
        }, {});
        var browserMeta = btoa(JSON.stringify(sortedMeta));
        var hiddenField = document.createElement('input');
        hiddenField.setAttribute('type', 'hidden');
        hiddenField.setAttribute('name', 'browser_meta');
        hiddenField.setAttribute('value', browserMeta);
        form.appendChild(hiddenField);
        form.submit();
      })();
    </script>
  </body>
</html>`;
}

function buildIssuedPolicyParams(
  policyPayload: NonNullable<ReturnType<typeof getPendingStaticPolicyPayment>>['policyPayload']
) {
  const premiumAmount = policyPayload.premium;

  return {
    travellerName: policyPayload.travellerDetails.name || 'Traveller',
    startDate: policyPayload.travellerDetails.startDate || '',
    endDate: policyPayload.travellerDetails.endDate || '',
    premiumAmount: String(premiumAmount),
  };
}

function getSingleParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  iconButton: {
    height: 44,
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0C4A6E',
  },
  headerSpacer: {
    width: 44,
  },
  loadingBanner: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#E0F2FE',
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: '#075985',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
  },
  errorText: {
    marginTop: 12,
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 22,
    color: '#475569',
  },
  backButton: {
    marginTop: 24,
    borderRadius: 18,
    backgroundColor: '#F97316',
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
