import { router } from 'expo-router';
import {
  ArrowLeft,
  ExternalLink,
  MapPin,
  ShieldCheck,
  Ticket,
  UserRound,
} from 'lucide-react-native';
import type { ReactNode } from 'react';
import { ImageBackground, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { clearLatestQuoteResult, getLatestQuoteResult } from '@/store/quote-result';

export default function QuoteScreen() {
  const quoteResult = getLatestQuoteResult();

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
                Submit the travel details form first to fetch your premium and policy summary.
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

  const partner = quoteResult.proposalResponse.pTrvPartnerDtls_inout;
  const policy = quoteResult.proposalResponse.pTrvPolDtls_inout;

  const PLATFORM_FEE = 50;
  const basePremium = Number(quoteResult.premiumAmount) || 0;
  const totalPremium = basePremium + PLATFORM_FEE;

  async function openPaymentGateway() {
    await Linking.openURL(policy.loading);
  }

  function startNewQuote() {
    clearLatestQuoteResult();
    router.replace('/');
  }

  const fullName = [partner.title, partner.firstname, partner.middlename, partner.lastname]
    .filter(Boolean)
    .join(' ');

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
            <Text className="text-base font-bold uppercase tracking-[2px] text-sky-950">Your Quote</Text>
            <Text className="mt-1 text-4xl font-extrabold leading-[44px] text-white" style={styles.titleShadow}>
              Premium Details
            </Text>
            {/* <View className="mt-4 rounded-[24px] bg-white/88 px-5 py-4" style={styles.messageShadow}>
              <Text className="text-base leading-6 text-slate-700">{quoteResult.message}</Text>
            </View> */}
          </View>

          <View className="mt-6 mb-6 overflow-hidden rounded-[30px] bg-white/95" style={styles.cardShadow}>
            <View className="bg-white px-6 pb-6 pt-5">
              <View className="flex-row items-start justify-between">
                <View className="mr-4 flex-1">
                  <Text className="text-sm font-bold uppercase tracking-[1.5px] text-slate-400">
                    Final Premium
                  </Text>
                  <Text className="mt-2 text-5xl font-extrabold text-sky-950">Rs. {totalPremium}</Text>
                  <View className="mt-2 flex-row items-center gap-1">
                    <Text className="text-xs text-slate-400">Rs. {basePremium} + Rs. 50 platform fee</Text>
                  </View>
                  <Text className="mt-2 text-sm font-medium text-slate-600">
                    {policy.travelplan} for {policy.areaplan}
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
            <SectionCard title="Traveller Details" icon={<UserRound size={22} color="#0C4A6E" strokeWidth={2.2} />}>
              <DetailRow label="Name" value={fullName} />
              <DetailRow label="Date of birth" value={partner.dob} />
              <DetailRow label="Gender" value={partner.sex} />
              <DetailRow label="Marital status" value={partner.maritalstatus} />
              <DetailRow label="Nominee" value={partner.assigneeName} />
              <DetailRow label="Email" value={partner.email}  />
              <DetailRow label="Mobile" value={partner.mobileNo} />
            </SectionCard>

            <SectionCard title="Policy Details" icon={<Ticket size={22} color="#0C4A6E" strokeWidth={2.2} />}>
              <DetailRow label="Request ID" value={policy.requestid} />
              <DetailRow label="Policy reference" value={quoteResult.proposalResponse.pRequestid_out} />
              <DetailRow label="Travel dates" value={`${policy.fromDate} to ${policy.toDate}`} />
              <DetailRow label="Area plan" value={policy.areaplan} />
            </SectionCard>

            <SectionCard title="Address" icon={<MapPin size={22} color="#0C4A6E" strokeWidth={2.2} />}>
              <DetailRow label="Street" value={`${partner.building}, ${partner.streetname}`} />
              <DetailRow label="City / State" value={`${partner.city}, ${partner.state}`} />
              <DetailRow label="PIN code" value={partner.pincode} />
            </SectionCard>
          </ScrollView>
        </View>

        <View className="px-5 pb-6 pt-4">
          <Pressable
            className="h-14 flex-row items-center justify-center rounded-[22px] bg-orange-500"
            style={styles.buttonShadow}
            onPress={openPaymentGateway}
          >
            <ExternalLink size={20} color="#FFFFFF" strokeWidth={2.2} />
            <Text className="ml-2 text-lg font-extrabold text-white">Continue To Payment</Text>
          </Pressable>

          <Pressable
            className="mt-4 h-14 items-center justify-center rounded-[22px] bg-white/90"
            style={styles.secondaryButtonShadow}
            onPress={startNewQuote}
          >
            <Text className="text-base font-bold text-sky-900">Get Another Quote</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

function SectionCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <View className="mt-6 rounded-[30px] bg-white/95 px-6 py-6" style={styles.cardShadow}>
      <View className="flex-row items-center">
        <View className="h-11 w-11 items-center justify-center rounded-2xl bg-sky-100">{icon}</View>
        <Text className="ml-3 text-2xl font-extrabold text-sky-950">{title}</Text>
      </View>

      <View className="mt-5 gap-4">{children}</View>
    </View>
  );
}

function DetailRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | null | undefined;
  icon?: ReactNode;
}) {
  return (
    <View className="rounded-[22px] bg-slate-50 px-4 py-4">
      <View className="flex-row items-center">
        {icon ? <View className="mr-2">{icon}</View> : null}
        <Text className="text-xs font-bold uppercase tracking-[1.2px] text-slate-400">{label}</Text>
      </View>
      <Text className="mt-1 text-base font-semibold text-slate-700">{value || '-'}</Text>
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
  messageShadow: {
    elevation: 6,
    shadowColor: '#1E6BA8',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },
  scrollPanel: {
    flex: 1,
    marginHorizontal: 20,
    borderRadius: 32,
    backgroundColor: 'rgba(248, 250, 252, 0.96)',
    overflow: 'hidden',
    elevation: 12,
    shadowColor: '#1E6BA8',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
  },
  scrollContent: {
    paddingHorizontal: 20,
    // paddingTop: 8,
    paddingBottom: 20,
  },
  buttonShadow: {
    elevation: 6,
    shadowColor: '#B45309',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.24,
    shadowRadius: 10,
  },
  secondaryButtonShadow: {
    elevation: 5,
    shadowColor: '#082F49',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  iconShadow: {
    elevation: 6,
    shadowColor: '#082F49',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
  },
});
