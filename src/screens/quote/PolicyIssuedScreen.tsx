import { router, useLocalSearchParams } from 'expo-router';
import { CheckCircle2, FileText, House } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { formatDate } from '@/utils/date';

export default function PolicyIssuedScreen() {
  const params = useLocalSearchParams<{
    travellerName?: string | string[];
    startDate?: string | string[];
    endDate?: string | string[];
    premiumAmount?: string | string[];
  }>();

  const travellerName = getSingleParam(params.travellerName) || 'Traveller';
  const startDate = getSingleParam(params.startDate);
  const endDate = getSingleParam(params.endDate);
  const premiumAmount = getSingleParam(params.premiumAmount) || '0';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.heroCard}>
          <View style={styles.iconWrap}>
            <CheckCircle2 size={38} color="#047857" strokeWidth={2.4} />
          </View>
          <Text style={styles.eyebrow}>Payment Completed</Text>
          <Text style={styles.title}>Policy Issued</Text>
          <Text style={styles.subtitle}>
            Your policy has been issued successfully. Here are the basic details.
          </Text>
        </View>

        <View style={styles.detailsCard}>
          <DetailRow label="Name" value={travellerName} />
          <DetailRow label="Start Date" value={formatDisplayDate(startDate)} />
          <DetailRow label="End Date" value={formatDisplayDate(endDate)} />
          <DetailRow label="Premium Amount" value={`Rs. ${premiumAmount}`} />
        </View>

        <Pressable style={styles.primaryButton} onPress={() => router.replace('/my-policies')}>
          <FileText size={20} color="#FFFFFF" strokeWidth={2.2} />
          <Text style={styles.primaryButtonText}>View Policies</Text>
        </Pressable>

        <Pressable style={styles.secondaryButton} onPress={() => router.replace('/')}>
          <House size={20} color="#0C4A6E" strokeWidth={2.2} />
          <Text style={styles.secondaryButtonText}>Back To Home</Text>
        </Pressable>
      </View>
    </SafeAreaView>
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
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function formatDisplayDate(value?: string) {
  if (!value) {
    return 'Not available';
  }

  return formatDate(value);
}

function getSingleParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ECFEF3',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  heroCard: {
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 28,
    alignItems: 'center',
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
  iconWrap: {
    height: 76,
    width: 76,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DCFCE7',
  },
  eyebrow: {
    marginTop: 18,
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    color: '#059669',
  },
  title: {
    marginTop: 8,
    fontSize: 30,
    fontWeight: '900',
    color: '#064E3B',
  },
  subtitle: {
    marginTop: 10,
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 22,
    color: '#4B5563',
  },
  detailsCard: {
    marginTop: 18,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    padding: 18,
    gap: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  detailRow: {
    borderRadius: 22,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
    color: '#94A3B8',
  },
  detailValue: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  primaryButton: {
    marginTop: 24,
    height: 56,
    borderRadius: 22,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  secondaryButton: {
    marginTop: 12,
    height: 56,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  secondaryButtonText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0C4A6E',
  },
});
