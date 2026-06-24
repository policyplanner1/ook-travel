import { useEffect, useMemo, useRef, useState } from 'react';
import { useIsFocused } from '@react-navigation/native';
import { Animated, Dimensions, Easing } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { IndianRupee } from 'lucide-react-native';
import {
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getAgentCommissionSummary } from '@/services/commission.service';
import { getAllIssuedPolicies } from '@/services/policy.service';
import { useAuth } from '@/store/auth';
import type { CommissionSummary, IssuedPolicyRecord } from '@/types/quote';

type CommissionRange = 'quarterly' | 'halfYearly' | 'yearly';
type CommissionPoint = {
  label: string;
  value: number;
};

const currencyFormatter = new Intl.NumberFormat('en-IN');
const screenWidth = Dimensions.get('window').width;
const baseChartWidth = screenWidth - 76;
const yAxisStep = 100; //changed
const COMMISSION_RATE = 0.25;
const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const rangeTabs: { label: string; value: CommissionRange }[] = [
  { label: 'Quarterly', value: 'quarterly' },
  { label: 'Half Yearly', value: 'halfYearly' },
  { label: 'Yearly', value: 'yearly' },
];

function formatCompactAmount(value: number) {
  if (value >= 1000) {
    const compactValue = value / 1000;
    return `${Number.isInteger(compactValue) ? compactValue : compactValue.toFixed(1)}k`;
  }

  return `${value}`;
}

export default function MyCommissionScreen() {
  const isFocused = useIsFocused();
  const { user } = useAuth();
  const [activeRange, setActiveRange] = useState<CommissionRange>('quarterly');
  const [tabContainerWidth, setTabContainerWidth] = useState(0);
  const [policies, setPolicies] = useState<IssuedPolicyRecord[]>([]);
  const [backendSummary, setBackendSummary] = useState<CommissionSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const activeIndex = rangeTabs.findIndex((tab) => tab.value === activeRange);
  const indicatorTranslateX = useRef(new Animated.Value(0)).current;
  const chartScrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (!isFocused) {
      return;
    }

    let isMounted = true;

    async function loadData() {
      try {
        setIsLoading(true);
        setErrorMessage('');

        const [policiesResponse, summaryResponse] = await Promise.all([
          getAllIssuedPolicies(user!.id),
          getAgentCommissionSummary(user!.id),
        ]);

        if (!isMounted) {
          return;
        }

        setPolicies(policiesResponse.data ?? []);
        setBackendSummary(summaryResponse.data ?? null);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        const message =
          error instanceof Error ? error.message : 'Unable to load commission data right now.';
        setErrorMessage(message);
        setPolicies([]);
        setBackendSummary(null);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [isFocused]);

  const yearlyBreakdown = useMemo(() => buildYearlyBreakdown(policies), [policies]);
  const localSummary = useMemo(() => buildCommissionSummary(policies), [policies]);
  const commissionSummary = backendSummary
    ? {
        earnings:   Number(backendSummary.commission_earned),
        totalSales: Number(backendSummary.total_premium),
        thisMonth:  localSummary.thisMonth,
        paid:       Number(backendSummary.paid_amount),
        pending:    Number(backendSummary.pending_amount),
      }
    : { ...localSummary, paid: 0, pending: localSummary.earnings };

  const activeData = useMemo(
    () =>
      activeRange === 'quarterly'
        ? getCurrentQuarterMonths(yearlyBreakdown)
        : activeRange === 'halfYearly'
          ? getCurrentHalfYearMonths(yearlyBreakdown)
          : yearlyBreakdown,
    [activeRange, yearlyBreakdown]
  );

  const chartData = useMemo(
    () => ({
      labels: activeData.map((item) => item.label),
      datasets: [
        {
          data: activeData.map((item) => item.value),
        },
      ],
    }),
    [activeData]
  );

  const chartAxisMax = useMemo(() => {
    const maxValue = Math.max(0, ...activeData.map((item) => item.value));
    return Math.max(yAxisStep, Math.ceil(maxValue / yAxisStep) * yAxisStep);
  }, [activeData]);

  const chartSegments = useMemo(() => chartAxisMax / yAxisStep, [chartAxisMax]);

  const chartWidth = useMemo(() => {
    if (activeRange === 'yearly') {
      return Math.max(baseChartWidth, activeData.length * 45);
    }

    return baseChartWidth;
  }, [activeData.length, activeRange]);

  const indicatorWidth = tabContainerWidth > 0 ? (tabContainerWidth - 8) / rangeTabs.length : 0;

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

  useEffect(() => {
    chartScrollRef.current?.scrollTo({ x: 0, animated: false });
  }, [activeRange]);

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
            <Text className="text-3xl font-extrabold text-sky-950">My Commission</Text>
            <Text className="mt-2 text-sm leading-6 text-slate-600">
              Review earnings, sales totals, and period-based commission trends.
            </Text>
          </View>

          <View className="mt-6 px-4 py-6">
            <Text className="text-2xl font-bold text-black">
              Your Commission Earnings
            </Text>

            {/* <View className="mt-2 flex-row items-center">
              <IndianRupee size={28} color="#000" strokeWidth={2.4} />
              <Text className="ml-2 text-4xl font-extrabold">
                {currencyFormatter.format(isLoading ? 0 : commissionSummary.earnings)}
              </Text>
            </View> */}

            <View className="mt-6 flex-row gap-4">
              <SummaryCard title="This Month" value={isLoading ? 0 : commissionSummary.thisMonth} />
              <SummaryCard title="Total Sales" value={isLoading ? 0 : commissionSummary.totalSales} />
            </View>

            <View className="mt-4 flex-row gap-4">
              <SummaryCard title="Paid" value={isLoading ? 0 : commissionSummary.paid} color="#065F46" />
              <SummaryCard title="Pending" value={isLoading ? 0 : commissionSummary.pending} color="#92400E" />
            </View>
          </View>

          {errorMessage ? (
            <View className="mx-4 rounded-[24px] bg-white/95 px-6 py-5" style={styles.summaryCardShadow}>
              <Text className="text-lg font-bold text-sky-950">Unable to load commission data</Text>
              <Text className="mt-2 text-sm leading-6 text-slate-500">{errorMessage}</Text>
            </View>
          ) : null}

          <View className="mt-6 rounded-[30px] bg-white px-6 py-6" style={styles.cardShadow}>
            <Text className="text-2xl font-extrabold text-sky-950">Commission Breakdown</Text>

            <View
              className="mt-5 flex-row rounded-2xl bg-sky-50 p-1"
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

              {rangeTabs.map((tab) => (
                <RangeTab
                  key={tab.value}
                  label={tab.label}
                  isActive={activeRange === tab.value}
                  onPress={() => setActiveRange(tab.value)}
                />
              ))}
            </View>

            <View className="mt-6 rounded-[24px] bg-white px-2 py-4">
              <View className="px-2">
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm font-bold uppercase tracking-[1.2px] text-slate-400">
                    Commission Graph
                  </Text>
                  <Text className="text-sm font-semibold text-slate-500">
                    Max Rs. {currencyFormatter.format(Math.max(0, ...activeData.map((item) => item.value)))}
                  </Text>
                </View>
                <Text className="mt-2 text-sm text-slate-500">
                  {isLoading ? 'Loading commission data...' : `Showing ${getRangeDescription(activeData)}`}
                </Text>
              </View>

              <ScrollView
                ref={chartScrollRef}
                horizontal
                bounces={false}
                nestedScrollEnabled
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chartScrollContent}
              >
                <BarChart
                  data={chartData}
                  width={chartWidth}
                  height={250}
                  yAxisLabel=""
                  yAxisSuffix=""
                  yLabelsOffset={4}
                  fromZero
                  fromNumber={chartAxisMax}
                  segments={chartSegments}
                  showValuesOnTopOfBars
                  withInnerLines
                  withHorizontalLabels
                  chartConfig={{
                    backgroundColor: '#FFFFFF',
                    backgroundGradientFrom: '#FFFFFF',
                    backgroundGradientTo: '#FFFFFF',
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(249, 115, 22, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(51, 65, 85, ${opacity})`,
                    fillShadowGradient: '#F97316',
                    fillShadowGradientOpacity: 1,
                    barPercentage:
                      activeRange === 'quarterly'
                        ? 0.98
                        : activeRange === 'halfYearly'
                          ? 0.82
                          : 0.68,
                    propsForBackgroundLines: {
                      stroke: '#FED7AA',
                      strokeWidth: 1,
                    },
                    propsForLabels: {
                      fontSize: 12,
                    },
                    formatYLabel: (value) => formatCompactAmount(Number(value)),
                    formatTopBarValue: (value) => formatCompactAmount(value),
                  }}
                  style={styles.chart}
                  verticalLabelRotation={0}
                />
              </ScrollView>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

function buildCommissionSummary(policies: IssuedPolicyRecord[]) {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  let totalSales = 0;
  let thisMonthSales = 0;

  for (const policy of policies) {
    const premium = parsePremium(policy.premium);
    const createdAt = new Date(policy.created_at);

    if (!Number.isFinite(premium)) {
      continue;
    }

    totalSales += premium;

    if (createdAt.getFullYear() === currentYear && createdAt.getMonth() === currentMonth) {
      thisMonthSales += premium;
    }
  }

  return {
    earnings: Math.round(totalSales * COMMISSION_RATE),
    totalSales: Math.round(totalSales),
    thisMonth: Math.round(thisMonthSales * COMMISSION_RATE),
  };
}

function buildYearlyBreakdown(policies: IssuedPolicyRecord[]): CommissionPoint[] {
  const currentYear = new Date().getFullYear();
  const monthlyCommission = new Array<number>(12).fill(0);

  for (const policy of policies) {
    const premium = parsePremium(policy.premium);
    const createdAt = new Date(policy.created_at);

    if (!Number.isFinite(premium) || createdAt.getFullYear() !== currentYear) {
      continue;
    }

    monthlyCommission[createdAt.getMonth()] += premium * COMMISSION_RATE;
  }

  return monthLabels.map((label, index) => ({
    label,
    value: Math.round(monthlyCommission[index]),
  }));
}

function getCurrentQuarterMonths(yearlyBreakdown: CommissionPoint[]) {
  const currentMonthIndex = new Date().getMonth();
  const quarterStartIndex = Math.floor(currentMonthIndex / 3) * 3;
  return yearlyBreakdown.slice(quarterStartIndex, quarterStartIndex + 3);
}

function getCurrentHalfYearMonths(yearlyBreakdown: CommissionPoint[]) {
  const currentMonthIndex = new Date().getMonth();
  const halfYearStartIndex = currentMonthIndex < 6 ? 0 : 6;
  return yearlyBreakdown.slice(halfYearStartIndex, halfYearStartIndex + 6);
}

function getRangeDescription(data: CommissionPoint[]) {
  if (!data.length) {
    return 'No commission data available';
  }

  return `${data[0].label} to ${data[data.length - 1].label}`;
}

function parsePremium(premium: string | number) {
  const numericValue = typeof premium === 'number' ? premium : Number.parseFloat(premium);
  return Number.isFinite(numericValue) ? numericValue : Number.NaN;
}

function SummaryCard({
  title,
  value,
  color = '#0C4A6E',
}: {
  title: string;
  value: number;
  color?: string;
}) {
  return (
    <View className="flex-1 rounded-xl bg-white px-4 py-4" style={styles.summaryCardShadow}>
      <Text className="text-sm font-bold uppercase tracking-[1.2px] text-slate-500">{title}</Text>
      <Text className="mt-3 text-2xl font-extrabold" style={{ color }}>
        Rs. {currencyFormatter.format(value)}
      </Text>
    </View>
  );
}

function RangeTab({
  isActive,
  label,
  onPress,
}: {
  isActive: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-1 rounded-[18px] px-2 py-2"
      style={styles.rangeTab}
    >
      <Text
        className={`text-center text-base font-bold  ${
          isActive ? 'text-white' : 'text-orange-700'
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    height: '100%',
    width: '100%',
  },
  cardShadow: {
    elevation: 12,
    shadowColor: '#1E6BA8',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
  },
  summaryCardShadow: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
  },
  tabIndicator: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    left: 4,
    borderRadius: 18,
    backgroundColor: '#F97316',
  },
  rangeTab: {
    zIndex: 1,
  },
  chart: {
    marginTop: 18,
    borderRadius: 24,
    paddingRight: 40,
  },
  chartScrollContent: {
    paddingRight: 8,
  },
});
