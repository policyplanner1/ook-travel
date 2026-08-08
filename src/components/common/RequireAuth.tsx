import { router, type Href } from 'expo-router';
import { useEffect, type ReactNode } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { setPendingRedirect } from '@/store/pending-redirect';
import { useAuth } from '@/store/auth';

export function RequireAuth({ redirectTo, children }: { redirectTo: Href; children: ReactNode }) {
  const { isAuthenticated, isInitializing } = useAuth();

  useEffect(() => {
    if (isInitializing || isAuthenticated) return;
    setPendingRedirect(redirectTo);
    router.replace('/login');
  }, [isAuthenticated, isInitializing, redirectTo]);

  if (isInitializing || !isAuthenticated) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return <>{children}</>;
}
