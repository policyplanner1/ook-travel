import { router } from 'expo-router';
import { ArrowLeft, ChevronDown, ChevronUp, ExternalLink, ShieldCheck, Users } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { Alert, ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { createCashfreeOrder } from '@/services/static-quote.service';
import {
  clearPendingStaticPolicyPayment,
  setPendingStaticPolicyPayment,
} from '@/store/pending-static-policy-payment';
import { useAuth } from '@/store/auth';
import { clearLatestStaticQuoteResult, getLatestStaticQuoteResult } from '@/store/static-quote-result';
import type { StaticQuoteResponse } from '@/types/quote';
import { formatDate } from '@/utils/date';

const STATIC_FALLBACK_QUOTE: StaticQuoteResponse = {
  product: 'Bharat Bhraman',
  no_of_days: 10,
  details: {
    id: 10,
    no_of_days: 10,
    premium: 257,
    basic_coverage: 500000,
    loss_of_checked_baggage: 25000,
    personal_liability: 50000,
    trip_delay: 3000,
    hospitalization_daily_allowance: 1000,
    trip_cancellation: 30000,
    trip_curtailment: 20000,
    delay_of_checked_baggage: 20000,
    track_a_baggage_service: 'Included',
    home_burglary_insurance: 50000,
    bounced_hotel: 5000,
    loss_of_baggage: 10000,
    emergency_hotel_extension: 25000,
    accidental_hospitalization_expenses: 300000,
    emergency_medical_evacuation: 25000,
  },
  travellerDetails: {
    selectedDestination: 'Mumbai',
    startDate: '2026-04-28',
    endDate: '2026-05-07',
    travellers: {
      Adults: 1,
      Children: 0,
      Seniors: 0,
    },
    name: 'Demo Traveller',
    email: 'demo@example.com',
    phone: '9999999999',
    gender: 'Male',
    panNo: 'ABCDE1234F',
    dob: '01/01/1990',
    pinCode: '400001',
    streetName: 'Demo Street',
    city: 'Mumbai',
    state: 'Maharashtra',
    maritalStatus: 'Single',
    nomineeName: 'Demo Nominee',
  },
};

const BREAKUP_LABELS: Record<string, string> = {
  id: 'Plan ID',
  no_of_days: 'No. of days',
  premium: 'Premium',
  basic_coverage: 'Basic coverage',
  loss_of_checked_baggage: 'Loss of checked baggage',
  personal_liability: 'Personal liability',
  trip_delay: 'Trip delay',
  hospitalization_daily_allowance: 'Hospitalization daily allowance',
  trip_cancellation: 'Trip cancellation',
  trip_curtailment: 'Trip curtailment',
  delay_of_checked_baggage: 'Delay of checked baggage',
  track_a_baggage_service: 'Track a baggage service',
  home_burglary_insurance: 'Home burglary insurance',
  bounced_hotel: 'Bounced hotel',
  loss_of_baggage: 'Loss of baggage',
  emergency_hotel_extension: 'Emergency hotel extension',
  accidental_hospitalization_expenses: 'Accidental hospitalization expenses',
  emergency_medical_evacuation: 'Emergency medical evacuation',
};

export default function StaticQuoteScreen() {
  const [expandedSection, setExpandedSection] = useState<'premium' | 'traveller' | null>('premium');
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);
  const { user } = useAuth();
  const quoteResult = getLatestStaticQuoteResult() ?? STATIC_FALLBACK_QUOTE;

  if (!quoteResult) {
    return (
      <ImageBackground
        source={require('../../../assets/images/home-bg.png')}
        resizeMode="cover"
        className="flex-1"
        imageStyle={styles.backgroundImage}
      >
        <SafeAreaView className="flex-1">
          <View className="flex-1 items-center justify-center px-6">
            <View className="w-full rounded-[30px] bg-white/95 px-6 py-8" style={styles.cardShadow}>
              <Text className="text-center text-3xl font-extrabold text-sky-950">No Quote Found</Text>
              <Text className="mt-3 text-center text-base leading-6 text-slate-600">
                Submit the travel details form first to fetch your premium breakup.
              </Text>
              <Pressable
                className="mt-8 rounded-[22px] bg-orange-500 px-6 py-4"
                style={styles.buttonShadow}
                onPress={() => router.replace('/')}
              >
                <Text className="text-center text-base font-extrabold text-white">Back To Home</Text>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </ImageBackground>
    );
  }

  const breakupRows = Object.entries(quoteResult.details).filter(
    ([key]) => !['id', 'no_of_days', 'premium'].includes(key)
  );
  const travellerRows = buildTravellerRows(quoteResult);

  function startNewQuote() {
    clearLatestStaticQuoteResult();
    router.replace('/');
  }

  function toggleSection(section: 'premium' | 'traveller') {
    setExpandedSection((current) => (current === section ? null : section));
  }

  async function handleMakePayment() {
    if (!quoteResult.travellerDetails) {
      Alert.alert('Traveller details missing', 'Traveller details are required before starting payment.');
      return;
    }

    const travellerDetails = quoteResult.travellerDetails;
    const orderTimestamp = Date.now();
    const orderAmount = quoteResult.details.premium + 50;
    const sanitizedPhone = travellerDetails.phone.replace(/\D/g, '') || '9999999999';
    const sanitizedName = travellerDetails.name.trim() || 'Traveller';
    const sanitizedEmail = travellerDetails.email.trim() || 'traveller@example.com';
    const orderId = `travel_${orderTimestamp}`;
    const referenceId = `POLICY-${quoteResult.details.id}-${orderTimestamp}`;
    const customerId = `cust_${sanitizedPhone.slice(-10) || orderTimestamp}`;

    const payload = {
      order_id: orderId,
      order_amount: orderAmount,
      order_currency: 'INR',
      reference_id: referenceId,
      customer_details: {
        customer_id: customerId,
        customer_name: sanitizedName,
        customer_email: sanitizedEmail,
        customer_phone: sanitizedPhone,
      },
    };

    console.log('Cashfree order payload:', payload);

    try {
      setIsCreatingPayment(true);
      const policyPayload = {
        product: quoteResult.product,
        no_of_days: quoteResult.no_of_days,
        premium: quoteResult.details.premium,
        travellerDetails,
        quoteDetails: quoteResult.details,
        agent_id: user?.id,
        payment: {
          status: 'paid',
        },
      };

      const response = await createCashfreeOrder(payload);
      const paymentSessionId = getCashfreePaymentSessionId(response);

      console.log("paymentSessionId",paymentSessionId)

      if (!paymentSessionId) {
        clearPendingStaticPolicyPayment();
        Alert.alert(
          'Payment session missing',
          'The Cashfree order was created, but the API did not return a payment session ID.'
        );
        return;
      }

      setPendingStaticPolicyPayment({
        orderId: payload.order_id,
        policyPayload,
      });


      router.push({
        pathname: '/cashfree-checkout',
        params: {
          paymentSessionId,
          orderId: getCashfreeOrderId(response) ?? payload.order_id,
        },
      });
    } catch (error) {
      clearPendingStaticPolicyPayment();
      console.log('Cashfree payment start error:', error);

      const message =
        error instanceof Error ? error.message : 'Unable to start payment right now. Please try again.';

      Alert.alert('Payment failed', message);
    } finally {
      setIsCreatingPayment(false);
    }
  }

  return (
    <ImageBackground
      source={require('../../../assets/images/home-bg.png')}
      resizeMode="cover"
      className="flex-1"
      imageStyle={styles.backgroundImage}
    >
      <SafeAreaView className="flex-1">
        <View className="px-5 pt-4">
          <Pressable
            className="h-12 w-12 items-center justify-center rounded-2xl bg-white/90"
            style={styles.iconShadow}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#0C4A6E" strokeWidth={2.4} />
          </Pressable>

          <View className="mt-5">
            {/* <Text className="text-base font-bold uppercase tracking-[2px] text-sky-950">Static Quote</Text> */}
            <Text className="mt-1 text-4xl font-extrabold leading-[44px] text-white" style={styles.titleShadow}>
              Bharat Bhraman
            </Text>
          </View>

          <View className="mt-6 mb-6 overflow-hidden rounded-[30px] bg-white/95" style={styles.cardShadow}>
            <View className="bg-white px-6 pb-6 pt-5">
              <View className="flex-row items-start justify-between">
                <View className="mr-4 flex-1">
                  <Text className="text-sm font-bold uppercase tracking-[1.5px] text-slate-400">
                    Final Premium
                  </Text> 
                  <Text className="mt-2 text-5xl font-extrabold text-sky-950">
                    Rs. {quoteResult.details.premium + 50}
                  </Text>
                  <Text className="mt-3 text-sm font-medium text-slate-600">
                    Plan for {quoteResult.no_of_days} days
                  </Text>
                </View>

                <View className="rounded-[22px] bg-emerald-50 p-4">
                  <ShieldCheck size={30} color="#0F766E" strokeWidth={2.2} />
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.scrollPanel}>
          <ScrollView
            className="flex-1"
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator
            persistentScrollbar
            indicatorStyle="default"
          >
            <View className="mt-6 gap-4">
              <AccordionSection
                title="Premium Breakup"
                subtitle="Detailed premium and coverage values"
                icon={<ShieldCheck size={22} color="#0F766E" strokeWidth={2.2} />}
                isExpanded={expandedSection === 'premium'}
                onPress={() => toggleSection('premium')}
              >
                <View className="gap-4">
                  {breakupRows.map(([key, value]) => (
                    <DetailRow
                      key={key}
                      label={BREAKUP_LABELS[key] ?? key.replace(/_/g, ' ')}
                      value={formatBreakupValue(key, value)}
                    />
                  ))}
                </View>
              </AccordionSection>

              <AccordionSection
                title="Traveller Details"
                subtitle="Insured traveller and trip information"
                icon={<Users size={22} color="#1D4ED8" strokeWidth={2.2} />}
                isExpanded={expandedSection === 'traveller'}
                onPress={() => toggleSection('traveller')}
              >
                <View className="gap-4">
                  {travellerRows.map((row) => (
                    <DetailRow key={row.label} label={row.label} value={row.value} />
                  ))}
                </View>
              </AccordionSection>
            </View>
          </ScrollView>
        </View>

        <View className="px-5 pb-6 pt-4">
          <Pressable
            className="mb-4 h-14 flex-row items-center justify-center rounded-[22px]"
            style={[
              styles.buttonShadow,
              { backgroundColor: isCreatingPayment ? '#fdba74' : '#f97316' },
            ]}
            onPress={handleMakePayment}
            disabled={isCreatingPayment}
          >
            <ExternalLink size={20} color="#FFFFFF" strokeWidth={2.2} />
            <Text className="text-lg font-extrabold text-white">
              {isCreatingPayment ? ' Creating Order...' : ' Make Payment'}
            </Text>
          </Pressable>

          <Pressable
            className="h-14 items-center justify-center rounded-[22px] bg-orange-500"
            style={styles.buttonShadow}
            onPress={startNewQuote}
          >
            <Text className="text-lg font-extrabold text-white">Get Another Quote</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

function buildTravellerRows(quoteResult: StaticQuoteResponse) {
  const travellerDetails = quoteResult.travellerDetails;

  if (!travellerDetails) {
    return [
      {
        label: 'Traveller details',
        value: 'Traveller details were not available for this quote.',
      },
    ];
  }

  return [
    {
      label: 'Travel dates',
      value:
        travellerDetails.startDate && travellerDetails.endDate
          ? `${formatDate(travellerDetails.startDate)} - ${formatDate(travellerDetails.endDate)}`
          : 'Not available',
    },
    {
      label: 'Full name',
      value: travellerDetails.name || 'Not available',
    },
    {
      label: 'Email',
      value: travellerDetails.email || 'Not available',
    },
    {
      label: 'Phone',
      value: travellerDetails.phone || 'Not available',
    },
    {
      label: 'Gender',
      value: travellerDetails.gender || 'Not available',
    },
    {
      label: 'PAN',
      value: travellerDetails.panNo || 'Not available',
    },
    {
      label: 'Date of birth',
      value: travellerDetails.dob || 'Not available',
    },
    {
      label: 'Street',
      value: travellerDetails.streetName || 'Not available',
    },
    {
      label: 'City',
      value: travellerDetails.city || 'Not available',
    },
    {
      label: 'State',
      value: travellerDetails.state || 'Not available',
    },
    {
      label: 'Pincode',
      value: travellerDetails.pinCode || 'Not available',
    },
    {
      label: 'Marital status',
      value: travellerDetails.maritalStatus || 'Not available',
    },
    {
      label: 'Nominee name',
      value: travellerDetails.nomineeName || 'Not available',
    },
  ];
}

function formatBreakupValue(key: string, value: string | number) {
  if (typeof value === 'string') {
    return value;
  }

  if (key === 'id' || key === 'no_of_days') {
    return String(value);
  }

  return `Rs. ${value}`;
}

function getCashfreePaymentSessionId(response: Record<string, unknown>) {
  return findCashfreeStringField(response, ['payment_session_id', 'paymentSessionId', 'session_id', 'sessionId']);
}

function getCashfreeOrderId(response: Record<string, unknown>) {
  return findCashfreeStringField(response, ['order_id', 'orderId']);
}

function findCashfreeStringField(value: unknown, fieldNames: string[]): string | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const objectValue = value as Record<string, unknown>;

  for (const field of fieldNames) {
    const fieldValue = objectValue[field];
    if (typeof fieldValue === 'string' && fieldValue.trim()) {
      return fieldValue.trim();
    }
  }

  for (const nestedValue of Object.values(objectValue)) {
    const nestedFieldValue = findCashfreeStringField(nestedValue, fieldNames);
    if (nestedFieldValue) {
      return nestedFieldValue;
    }
  }

  return null;
}

function AccordionSection({
  title,
  subtitle,
  icon,
  isExpanded,
  onPress,
  children,
}: {
  title: string;
  subtitle: string;
  icon: ReactNode;
  isExpanded: boolean;
  onPress: () => void;
  children: ReactNode;
}) {
  return (
    <View className="overflow-hidden rounded-[30px] bg-white/95" style={styles.cardShadow}>
      <Pressable className="flex-row items-center px-6 py-5" onPress={onPress}>
        <View className="mr-4 rounded-[18px] bg-slate-100 p-3">{icon}</View>
        <View className="flex-1">
          <Text className="text-xl font-extrabold text-sky-950">{title}</Text>
          <Text className="mt-1 text-sm font-medium text-slate-500">{subtitle}</Text>
        </View>
        {isExpanded ? (
          <ChevronUp size={22} color="#0C4A6E" strokeWidth={2.4} />
        ) : (
          <ChevronDown size={22} color="#0C4A6E" strokeWidth={2.4} />
        )}
      </Pressable>

      {isExpanded ? <View className="px-6 pb-6">{children}</View> : null}
    </View>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View className="rounded-[22px] bg-slate-50 px-4 py-4">
      <Text className="text-xs font-bold uppercase tracking-[1.2px] text-slate-400">{label}</Text>
      <Text className="mt-1 text-base font-semibold text-slate-700">{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    height: '100%',
    width: '100%',
  },
  titleShadow: {
    textShadowColor: 'rgba(12, 74, 110, 0.22)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
  },
  cardShadow: {
    elevation: 12,
    shadowColor: '#1E6BA8',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
  },
  scrollPanel: {
    flex: 1,
    marginHorizontal: 20,
    borderRadius: 32,
    overflow: 'hidden',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  buttonShadow: {
    elevation: 6,
    shadowColor: '#B45309',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.24,
    shadowRadius: 10,
  },
  iconShadow: {
    elevation: 6,
    shadowColor: '#082F49',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
  },
});
