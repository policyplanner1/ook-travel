import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { UpdateModal } from '@/components/common/UpdateModal';
import { checkAppVersion } from '@/services/version.service';
import { AuthProvider, useAuth } from '@/store/auth';
import type { VersionCheckData } from '@/types/version';

import '../../global.css';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <RootNavigator />
        <AppUpdateGate />
        <StatusBar style="auto" />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

function AppUpdateGate() {
  const [versionInfo, setVersionInfo] = useState<VersionCheckData | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    checkAppVersion()
      .then((data) => {
        console.log('[version-check] response:', data);
        if (data.updateAvailable) setVersionInfo(data);
      })
      .catch((error) => {
        console.warn('[version-check] failed:', error?.message ?? error);
      });
  }, []);

  if (!versionInfo || (dismissed && !versionInfo.forceUpdate)) {
    return null;
  }

  return (
    <UpdateModal
      visible
      forceUpdate={versionInfo.forceUpdate}
      latestVersion={versionInfo.latestVersion}
      releaseNotes={versionInfo.releaseNotes}
      updateUrl={versionInfo.updateUrl}
      onDismiss={() => setDismissed(true)}
    />
  );
}

function RootNavigator() {
  const { isAuthenticated, isInitializing } = useAuth();

  if (isInitializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  // Single Stack instance kept alive across auth changes — swapping between two entirely
  // separate <Stack> trees (as this used to do) remounts the navigator and makes it fall back
  // to its first declared screen instead of the actual current route. Stack.Protected toggles
  // screen availability in place, so login/logout redirect correctly without hijacking the
  // current path.
  //
  // (tabs) (home quote form + my-policies/my-commission) and quote (premium/quote details) stay
  // unguarded — quote browsing is public per App Store 5.1.1(v). Login is only required at
  // checkout/payment (guarded in QuoteScreen) and for account-specific tabs (guarded via
  // Tabs.Protected in (tabs)/_layout.tsx).
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="quote" />
      <Stack.Screen name="terms-and-conditions" />
      <Stack.Screen name="privacy-policy" />

      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />
        <Stack.Screen name="forgot-password" />
      </Stack.Protected>

      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="gallery" />
        <Stack.Screen name="policy-issued" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="notifications" />
      </Stack.Protected>
    </Stack>
  );
}
