import { useEffect, useMemo, useRef, useState } from 'react';
import {
  CalendarDays,
  Download,
  Search,
  UserRound,
} from 'lucide-react-native';
import {
  Alert,
  Animated,
  Easing,
  ImageBackground,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  getAllIssuedPolicies,
  getIssuedPolicyInvoiceUrl,
} from '@/services/static-quote.service';
import { useAuth } from '@/store/auth';
import type { IssuedPolicyRecord } from '@/types/quote';
import { formatDate } from '@/utils/date';

type PolicyStatus = 'active' | 'expired';

type PolicyRecord = {
  id: string;
  uuid: string;
  customerName: string;
  policyNumber: string;
  travelDates: string;
  premiumAmount: string;
  coverAmount: string;
  status: PolicyStatus;
  product: string;
};

type PolicyTab = PolicyStatus | 'all' | 'claim';

const tabs: Array<{ label: string; value: PolicyTab }> = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Expired', value: 'expired' },
  // { label: 'Claim', value: 'claim' },
];

export default function MyPoliciesScreen() {
  const isFocused = useIsFocused();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<PolicyTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [tabContainerWidth, setTabContainerWidth] = useState(0);
  const [policies, setPolicies] = useState<PolicyRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const activeIndex = tabs.findIndex((tab) => tab.value === activeTab);
  const indicatorTranslateX = useRef(new Animated.Value(0)).current;
  const indicatorWidth = tabContainerWidth > 0 ? (tabContainerWidth - 8) / tabs.length : 0;

  useEffect(() => {
    if (!isFocused) {
      return;
    }

    let isMounted = true;

    async function loadPolicies() {
      try {
        setIsLoading(true);
        setErrorMessage('');

        const response = await getAllIssuedPolicies(user!.id);

        if (!isMounted) {
          return;
        }

        const mappedPolicies = (response.data ?? []).map(mapIssuedPolicyToCard);
        setPolicies(mappedPolicies);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        const message =
          error instanceof Error ? error.message : 'Unable to load your policies right now.';
        setErrorMessage(message);
        setPolicies([]);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadPolicies();

    return () => {
      isMounted = false;
    };
  }, [isFocused]);

  const filteredPolicies = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return policies.filter((policy) => {
      const matchesTab =
        activeTab === 'all'
          ? true
          : activeTab === 'claim'
            ? false
            : policy.status === activeTab;
      const matchesSearch =
        !normalizedQuery ||
        policy.customerName.toLowerCase().includes(normalizedQuery) ||
        policy.product.toLowerCase().includes(normalizedQuery) ||
        policy.policyNumber.toLowerCase().includes(normalizedQuery);

      return matchesTab && matchesSearch;
    });
  }, [activeTab, policies, searchQuery]);

  useEffect(() => {
    if (!indicatorWidth) {
      return;
    }

    Animated.timing(indicatorTranslateX, {
      toValue: activeIndex * indicatorWidth,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [activeIndex, indicatorTranslateX, indicatorWidth]);

  async function handleDownload(policy: PolicyRecord) {
    if (!policy.uuid) {
      Alert.alert('Download unavailable', 'This policy does not have a valid invoice reference yet.');
      return;
    }

    try {
      const invoiceUrl = getIssuedPolicyInvoiceUrl(policy.uuid);
      await Linking.openURL(invoiceUrl);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Something went wrong while opening the invoice.';
      Alert.alert('Download failed', message);
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
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-5 pb-20 pt-4"
          showsVerticalScrollIndicator={false}
        >
          <View>
            <Text className="text-3xl font-extrabold text-sky-950">My Policies</Text>
            <Text className="mt-2 text-sm leading-6 text-slate-600">
              Track active and expired travel policies in one place.
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
                  className="flex-1 rounded-[18px] px-4 py-3"
                  style={styles.tabButton}
                >
                  <Text
                    className={`text-center text-base font-bold ${
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
              placeholder="Search policies..."
              placeholderTextColor="#94A3B8"
              className="ml-3 flex-1 py-4 text-base text-slate-700"
            />
          </View>

          <Text className="mt-3 text-base font-semibold text-slate-800">
            Total Policies: {isLoading ? 0 : filteredPolicies.length}
          </Text>

          <View className="mt-5 gap-4">
            {isLoading ? (
              <View className="rounded-[26px] bg-white/95 px-6 py-8" style={styles.panelShadow}>
                <Text className="text-center text-lg font-bold text-sky-950">Loading policies...</Text>
                <Text className="mt-2 text-center text-sm leading-6 text-slate-500">
                  Fetching your latest issued policy details.
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
            ) : filteredPolicies.length ? (
              filteredPolicies.map((policy) => (
                <PolicyCard key={policy.id} policy={policy} onDownload={handleDownload} />
              ))
            ) : (
              <View className="rounded-[26px] bg-white/95 px-6 py-8" style={styles.panelShadow}>
                <Text className="text-center text-lg font-bold text-sky-950">
                  {activeTab === 'claim' ? 'No claims found' : 'No policies found'}
                </Text>
                <Text className="mt-2 text-center text-sm leading-6 text-slate-500">
                  {activeTab === 'claim'
                    ? 'Claims will appear here once claim data is available.'
                    : 'Try another customer name or switch the filter tab.'}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

function PolicyCard({
  onDownload,
  policy,
}: {
  onDownload: (policy: PolicyRecord) => void;
  policy: PolicyRecord;
}) {
  return (
    <View className="overflow-hidden rounded-[26px] bg-white/95" style={styles.panelShadow}>
      <View className="px-5 pb-4 pt-5">
        <View className="flex-row items-start justify-between">
          <View className="mr-4 flex-1">
            <Text className="text-2xl font-extrabold text-sky-950">{policy.customerName}</Text>
            {/* <View className="mt-2 flex-row items-center">
              <FileText size={16} color="#64748B" strokeWidth={2.2} />
              <Text className="ml-2 text-sm font-medium text-slate-500">{policy.destination}</Text>
            </View> */}
          </View>

          <Pressable
            onPress={() => onDownload(policy)}
            className="h-11 w-11 items-center justify-center rounded-2xl bg-sky-50"
          >
            <Download size={20} color="#2563EB" strokeWidth={2.2} />
          </Pressable>
        </View>

        <View className="flex-row items-center">
          <UserRound size={18} color="#3B82F6" strokeWidth={2.2} />
          <Text className="ml-2 text-sm font-medium text-slate-600">{policy.policyNumber}</Text>
        </View>

        {/* <Text className="mt-3 text-sm font-semibold text-slate-500">{policy.product}</Text> */}

        <View className="mt-3 flex-row items-center">
          <CalendarDays size={18} color="#3B82F6" strokeWidth={2.2} />
          <Text className="ml-2 text-sm font-medium text-slate-600">{policy.travelDates}</Text>
        </View>
      </View>

      <View className="flex-row border-t border-slate-200 bg-slate-50/90">
        <CoverageItem label="Premium Amount" value={policy.premiumAmount} />
        <View className="w-px bg-slate-200" />
        <CoverageItem label="Cover Amount" value={policy.coverAmount} />
      </View>
    </View>
  );
}

function CoverageItem({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1 px-4 py-4">
      <Text className="text-sm font-medium text-slate-500">{label}</Text>
      <Text className="mt-1 text-2xl font-extrabold text-sky-950">{value}</Text>
    </View>
  );
}

const currencyFormatter = new Intl.NumberFormat('en-IN');

function mapIssuedPolicyToCard(policy: IssuedPolicyRecord): PolicyRecord {
  const customerName = policy.traveller_details?.name?.trim() || 'Unnamed traveller';
  const policyNumber = policy.uuid || String(policy.id);
  const product = policy.product || 'Travel Policy';
  const startDate = policy.traveller_details?.startDate;
  const endDate = policy.traveller_details?.endDate;
  const coverAmount = policy.quote_details?.basic_coverage;

  return {
    id: String(policy.id),
    uuid: policy.uuid,
    customerName,
    policyNumber,
    product,
    travelDates: formatTravelDates(startDate, endDate),
    premiumAmount: formatCurrency(policy.premium),
    coverAmount: formatCurrency(coverAmount),
    status: getPolicyStatus(startDate, endDate),
  };
}

function formatTravelDates(startDate?: string | null, endDate?: string | null) {
  if (!startDate || !endDate) {
    return 'Travel dates not available';
  }

  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
}

function formatCurrency(value: string | number | null | undefined) {
  const numericValue =
    typeof value === 'number' ? value : typeof value === 'string' ? Number.parseFloat(value) : NaN;

  if (!Number.isFinite(numericValue)) {
    return 'Not available';
  }

  return `Rs. ${currencyFormatter.format(numericValue)}`;
}

function getPolicyStatus(startDate?: string | null, endDate?: string | null): PolicyStatus {
  const today = new Date();
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const normalizedStartDate = parseDateOnly(startDate);
  const normalizedEndDate = parseDateOnly(endDate);

  if (!normalizedStartDate && !normalizedEndDate) {
    return 'expired';
  }

  if (normalizedEndDate && todayOnly > normalizedEndDate) {
    return 'expired';
  }

  return 'active';
}

function parseDateOnly(dateString?: string | null) {
  if (!dateString) {
    return null;
  }

  const parts = dateString.split('-').map(Number);

  if (parts.length !== 3 || parts.some((part) => Number.isNaN(part))) {
    return null;
  }

  const [year, month, day] = parts;
  return new Date(year, month - 1, day);
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
