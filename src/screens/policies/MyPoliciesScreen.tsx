import { useEffect, useMemo, useRef, useState } from 'react';
import {
  CalendarDays,
  MapPin,
  Search,
  Users,
  UserRound,
} from 'lucide-react-native';
import {
  Animated,
  Easing,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getAgentPolicyRequests } from '@/services/policy.service';
import { useAuth } from '@/store/auth';
import type { PolicyRequest, PolicyRequestStatus } from '@/types/quote';
import { formatDate } from '@/utils/date';

type TabFilter = 'all' | PolicyRequestStatus;

const tabs: Array<{ label: string; value: TabFilter }> = [
  { label: 'All', value: 'all' },
  { label: 'Assigned', value: 'assigned' },
  { label: 'Issued', value: 'issued' },
  { label: 'Rejected', value: 'rejected' },
];

const STATUS_COLORS: Record<PolicyRequestStatus, { bg: string; text: string }> = {
  pending:  { bg: '#FEF3C7', text: '#92400E' },
  assigned: { bg: '#DBEAFE', text: '#1E40AF' },
  issued:   { bg: '#D1FAE5', text: '#065F46' },
  rejected: { bg: '#FEE2E2', text: '#991B1B' },
};

export default function MyPoliciesScreen() {
  const isFocused = useIsFocused();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [tabContainerWidth, setTabContainerWidth] = useState(0);
  const [requests, setRequests] = useState<PolicyRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const activeIndex = tabs.findIndex((tab) => tab.value === activeTab);
  const indicatorTranslateX = useRef(new Animated.Value(0)).current;
  const indicatorWidth = tabContainerWidth > 0 ? (tabContainerWidth - 8) / tabs.length : 0;

  useEffect(() => {
    if (!isFocused) return;

    let isMounted = true;

    async function loadRequests() {
      try {
        setIsLoading(true);
        setErrorMessage('');
        const response = await getAgentPolicyRequests(user!.id);
        if (!isMounted) return;
        setRequests(response.data?.requests ?? []);
      } catch (error) {
        if (!isMounted) return;
        setErrorMessage(
          error instanceof Error ? error.message : 'Unable to load your policies right now.'
        );
        setRequests([]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadRequests();
    return () => { isMounted = false; };
  }, [isFocused]);

  const filteredRequests = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return requests.filter((r) => {
      const matchesTab = activeTab === 'all' || r.status === activeTab;
      const matchesSearch =
        !q ||
        r.traveler_name.toLowerCase().includes(q) ||
        r.request_number.toLowerCase().includes(q);
      return matchesTab && matchesSearch;
    });
  }, [activeTab, requests, searchQuery]);

  useEffect(() => {
    if (!indicatorWidth) return;
    Animated.timing(indicatorTranslateX, {
      toValue: activeIndex * indicatorWidth,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [activeIndex, indicatorTranslateX, indicatorWidth]);

  return (
    <ImageBackground
      source={require('../../../assets/images/home-bg.png')}
      resizeMode="cover"
      className="flex-1"
      imageStyle={styles.backgroundImage}
    >
      <SafeAreaView className="flex-1">
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-5 pb-20 pt-4"
          showsVerticalScrollIndicator={false}
        >
          <View>
            <Text className="text-3xl font-extrabold text-sky-950">My Policies</Text>
            <Text className="mt-2 text-sm leading-6 text-slate-600">
              Track all your policy requests and their current status.
            </Text>
          </View>

          <View
            className="mt-6 flex-row rounded-[22px] bg-white/95 p-1"
            style={styles.panelShadow}
            onLayout={(event) => setTabContainerWidth(event.nativeEvent.layout.width)}
          >
            {indicatorWidth > 0 ? (
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.tabIndicator,
                  {
                    width: indicatorWidth,
                    transform: [{ translateX: indicatorTranslateX }],
                  },
                ]}
              />
            ) : null}

            {tabs.map((tab) => {
              const isActive = activeTab === tab.value;
              return (
                <Pressable
                  key={tab.value}
                  onPress={() => setActiveTab(tab.value)}
                  className="flex-1 rounded-[18px] py-3"
                  style={styles.tabButton}
                >
                  <Text
                    className={`text-center text-sm font-bold ${
                      isActive ? 'text-white' : 'text-slate-600'
                    }`}
                  >
                    {tab.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View
            className="mt-5 flex-row items-center rounded-[22px] bg-white/95 px-4 py-1"
            style={styles.panelShadow}
          >
            <Search size={20} color="#94A3B8" strokeWidth={2.2} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search by name or request number..."
              placeholderTextColor="#94A3B8"
              className="ml-3 flex-1 py-4 text-base text-slate-700"
            />
          </View>

          <Text className="mt-3 text-base font-semibold text-slate-800">
            Total: {isLoading ? 0 : filteredRequests.length}
          </Text>

          <View className="mt-5 gap-4">
            {isLoading ? (
              <View className="rounded-[26px] bg-white/95 px-6 py-8" style={styles.panelShadow}>
                <Text className="text-center text-lg font-bold text-sky-950">Loading policies...</Text>
                <Text className="mt-2 text-center text-sm leading-6 text-slate-500">
                  Fetching your latest policy requests.
                </Text>
              </View>
            ) : errorMessage ? (
              <View className="rounded-[26px] bg-white/95 px-6 py-8" style={styles.panelShadow}>
                <Text className="text-center text-lg font-bold text-sky-950">
                  Unable to load policies
                </Text>
                <Text className="mt-2 text-center text-sm leading-6 text-slate-500">
                  {errorMessage}
                </Text>
              </View>
            ) : filteredRequests.length ? (
              filteredRequests.map((req) => <RequestCard key={req.id} request={req} />)
            ) : (
              <View className="rounded-[26px] bg-white/95 px-6 py-8" style={styles.panelShadow}>
                <Text className="text-center text-lg font-bold text-sky-950">No requests found</Text>
                <Text className="mt-2 text-center text-sm leading-6 text-slate-500">
                  Try another name or switch the filter tab.
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

function RequestCard({ request }: { request: PolicyRequest }) {
  const colors = STATUS_COLORS[request.status] ?? { bg: '#F1F5F9', text: '#475569' };

  return (
    <View className="overflow-hidden rounded-[26px] bg-white/95" style={styles.panelShadow}>
      <View className="px-5 pb-4 pt-5">
        <View className="flex-row items-start justify-between">
          <View className="mr-4 flex-1">
            <Text className="text-2xl font-extrabold text-sky-950">{request.traveler_name}</Text>
          </View>

          <View
            className="rounded-xl px-3 py-1.5"
            style={{ backgroundColor: colors.bg }}
          >
            <Text className="text-xs font-bold capitalize" style={{ color: colors.text }}>
              {request.status}
            </Text>
          </View>
        </View>

        <View className="mt-2 flex-row items-center">
          <UserRound size={18} color="#3B82F6" strokeWidth={2.2} />
          <Text className="ml-2 text-sm font-medium text-slate-600">{request.request_number}</Text>
        </View>

        {request.destination ? (
          <View className="mt-2 flex-row items-center">
            <MapPin size={18} color="#3B82F6" strokeWidth={2.2} />
            <Text className="ml-2 text-sm font-medium text-slate-600">{request.destination}</Text>
          </View>
        ) : null}

        <View className="mt-2 flex-row items-center">
          <CalendarDays size={18} color="#3B82F6" strokeWidth={2.2} />
          <Text className="ml-2 text-sm font-medium text-slate-600">
            {formatTravelDates(request.travel_date, request.return_date)}
          </Text>
        </View>

        {request.plan_type === 'bulk' ? (
          <View className="mt-2 flex-row items-center gap-3">
            <View className="rounded-lg bg-sky-100 px-3 py-1">
              <Text className="text-xs font-bold uppercase text-sky-800">Bulk</Text>
            </View>
            <View className="flex-row items-center">
              <Users size={16} color="#64748B" strokeWidth={2.2} />
              <Text className="ml-1.5 text-sm font-medium text-slate-600">
                {request.num_travelers ?? 1} Traveller{(request.num_travelers ?? 1) !== 1 ? 's' : ''}
              </Text>
            </View>
          </View>
        ) : null}
      </View>

      <View className="flex-row border-t border-slate-200 bg-slate-50/90">
        <AmountItem label="Est. Premium" value={request.estimated_premium} />
        <View className="w-px bg-slate-200" />
        <AmountItem label="Payment Amount" value={request.payment_amount} />
      </View>
    </View>
  );
}

function AmountItem({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <View className="flex-1 px-4 py-4">
      <Text className="text-sm font-medium text-slate-500">{label}</Text>
      <Text className="mt-1 text-2xl font-extrabold text-sky-950">{formatCurrency(value)}</Text>
    </View>
  );
}

const currencyFormatter = new Intl.NumberFormat('en-IN');

function formatTravelDates(startDate?: string | null, endDate?: string | null) {
  if (!startDate && !endDate) return 'Travel dates not set';
  if (!endDate) return formatDate(startDate!);
  return `${formatDate(startDate!)} - ${formatDate(endDate)}`;
}

function formatCurrency(value: string | number | null | undefined) {
  const num =
    typeof value === 'number' ? value : typeof value === 'string' ? Number.parseFloat(value) : NaN;
  if (!Number.isFinite(num)) return 'N/A';
  return `Rs. ${currencyFormatter.format(num)}`;
}

const styles = StyleSheet.create({
  backgroundImage: {
    height: '100%',
    width: '100%',
  },
  panelShadow: {
    elevation: 10,
    shadowColor: '#1E6BA8',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
  },
  tabIndicator: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    left: 4,
    borderRadius: 18,
    backgroundColor: '#F97316',
  },
  tabButton: {
    zIndex: 1,
  },
});
