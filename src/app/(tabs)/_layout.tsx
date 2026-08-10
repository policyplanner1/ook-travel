import { router, Tabs } from 'expo-router';
import { House, IndianRupee, ShieldCheck, UserRound } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/store/auth';
import { setPendingRedirect } from '@/store/pending-redirect';

const ACTIVE_COLOR = '#0C4A6E';
const INACTIVE_COLOR = '#94A3B8';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { isAuthenticated } = useAuth();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: ACTIVE_COLOR,
        tabBarInactiveTintColor: INACTIVE_COLOR,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700',
          marginBottom: 4,
        },
        tabBarStyle: {
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: 64 + insets.bottom,
          paddingTop: 6,
          paddingBottom: Math.max(insets.bottom, 10),
          borderTopWidth: 0,
          backgroundColor: 'rgba(255,255,255,0.96)',
          elevation: 12,
          shadowColor: '#0F172A',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <House color={color} size={size} strokeWidth={2.3} />,
        }}
      />
      <Tabs.Screen
        name="my-policies"
        options={{
          title: 'Business',
          tabBarIcon: ({ color, size }) => (
            <ShieldCheck color={color} size={size} strokeWidth={2.3} />
          ),
        }}
        listeners={{
          tabPress: (e) => {
            // Intercept before the tab transition starts — redirecting *after* letting the
            // transition begin (e.g. from a useEffect on the destination screen) races the
            // in-flight native screen-mount animation and crashes Fabric's view mounting.
            if (isAuthenticated) return;
            e.preventDefault();
            setPendingRedirect('/my-policies');
            router.push('/login');
          },
        }}
      />
      <Tabs.Screen
        name="my-commission"
        options={{
          title: 'Earnings',
          tabBarIcon: ({ color, size }) => (
            <IndianRupee color={color} size={size} strokeWidth={2.3} />
          ),
        }}
        listeners={{
          tabPress: (e) => {
            if (isAuthenticated) return;
            e.preventDefault();
            setPendingRedirect('/my-commission');
            router.push('/login');
          },
        }}
      />
      <Tabs.Screen
        name="help"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <UserRound color={color} size={size} strokeWidth={2.3} />
          ),
        }}
      />
    </Tabs>
  );
}
