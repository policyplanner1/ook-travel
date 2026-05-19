import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider, useAuth } from '@/store/auth';

import '../../global.css';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <RootNavigator />
        <StatusBar style="auto" />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

function RootNavigator() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="cashfree-checkout" />
        <Stack.Screen name="gallery" />
        <Stack.Screen name="policy-issued" />
        <Stack.Screen name="quote" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="terms-and-conditions" />
        <Stack.Screen name="privacy-policy" />
      </Stack>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="terms-and-conditions" />
      <Stack.Screen name="privacy-policy" />
    </Stack>
  );
}
