import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
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
  const { isAuthenticated, isInitializing } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isInitializing) return;

    const AUTH_ONLY_ROUTES = new Set(['login', 'signup', 'forgot-password']);
    const PUBLIC_ROUTES = new Set(['terms-and-conditions', 'privacy-policy']);
    const onAuthOnlyRoute = AUTH_ONLY_ROUTES.has(segments[0] as string);
    const onPublicRoute = PUBLIC_ROUTES.has(segments[0] as string);

    if (!isAuthenticated && !onAuthOnlyRoute && !onPublicRoute) {
      router.replace('/login');
    } else if (isAuthenticated && onAuthOnlyRoute) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isInitializing, segments]);

  if (isInitializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (isAuthenticated) {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
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
