import { router } from 'expo-router';
import { ArrowLeft, ExternalLink, MapPin, ShieldCheck, Star, Ticket, UserRound} from 'lucide-react-native';
import React, { type ReactNode } from 'react';
import { ActivityIndicator, Alert, ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { api } from '@/services/api';
import { submitBulkInsuranceUpload } from '@/services/policy.service';
import { useAuth } from '@/store/auth';
import { clearLatestQuoteResult, getLatestQuoteResult } from '@/store/quote-result';

const MONTH_MAP: Record<string, string> = {
  JAN: '01', FEB: '02', MAR: '03', APR: '04',
  MAY: '05', JUN: '06', JUL: '07', AUG: '08',
  SEP: '09', OCT: '10', NOV: '11', DEC: '12',
};

function parseDateToISO(dateStr: string): string {
  if (!dateStr) return '';
  // YYYY-MM-DD — already ISO
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  // DD/MM/YYYY
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
    const [d, m, y] = dateStr.split('/');
    return `${y}-${m}-${d}`;
  }
  // DD-MON-YYYY (e.g. 22-JUN-2026)
  const match = /^(\d{2})-([A-Za-z]{3})-(\d{4})$/.exec(dateStr);
  if (match) {
    const m = MONTH_MAP[match[2].toUpperCase()];
    if (m) return `${match[3]}-${m}-${match[1]}`;
  }
  return dateStr;
}

export default function QuoteScreen() {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const stored = getLatestQuoteResult();

  if (!stored) {
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

  const { quoteResponse, staticQuoteResponse, formData, planType, totalTravellers, bulkDocument, mode } = stored;
  const isStatic = mode === 'static';

  const PLATFORM_FEE = 50;
  const basePremium = isStatic
    ? (staticQuoteResponse?.details.premium ?? 0)
    : (Number(quoteResponse?.premiumAmount) || 0);
  const numTravellers = planType === 'bulk' ? (totalTravellers ?? 1) : 1;
  const totalPremium = basePremium * numTravellers + PLATFORM_FEE;

  const partner = !isStatic
    ? (quoteResponse?.proposalResponse?.pTrvPartnerDtls_inout ?? {} as Partial<import('@/types/quote').ProposalPartnerDetails>)
    : {} as Partial<import('@/types/quote').ProposalPartnerDetails>;
  const policy = !isStatic
    ? (quoteResponse?.proposalResponse?.pTrvPolDtls_inout ?? {} as Partial<import('@/types/quote').ProposalPolicyDetails>)
    : {} as Partial<import('@/types/quote').ProposalPolicyDetails>;

  const fullName = isStatic
    ? formData.name
    : [partner.title, partner.firstname, partner.middlename, partner.lastname].filter(Boolean).join(' ');

  const traveller_details = !isStatic ? {
    panNo:         formData.panNo,
    dob:           formData.dob,
    gender:        formData.gender,
    pinCode:       formData.pinCode,
    city:          formData.city,
    state:         formData.state,
    streetName:    formData.streetName,
    maritalStatus: formData.maritalStatus,
    nomineeName:   formData.nomineeName,
    name:          formData.name,
    email:         formData.email,
    phone:         formData.phone,
    destination:   formData.selectedDestination,
    startDate:     formData.startDate,
    endDate:       formData.endDate,
    travellers:    formData.travellers,
    proposalResponse: quoteResponse!.proposalResponse,
  } : null;

  async function submitPolicyRequest() {
    if (!user) return;
    setIsSubmitting(true);

    try {
      if (planType === 'bulk' && bulkDocument) {
        const travelDate = formData.startDate ?? parseDateToISO(policy.fromDate ?? '');
        const returnDate = formData.endDate   ?? parseDateToISO(policy.toDate ?? '');
        await submitBulkInsuranceUpload({
          agent_id:          user.id,
          travel_date:       travelDate,
          return_date:       returnDate,
          num_travelers:     numTravellers,
          estimated_premium: basePremium,
          payment_amount:    totalPremium,
          pan_no:            formData.panNo,
          dob:               formData.dob,
          phone:             formData.phone,
          name:              fullName,
          email:             formData.email,
          proposal_response: isStatic
            ? JSON.stringify(staticQuoteResponse ?? {})
            : JSON.stringify(quoteResponse?.proposalResponse ?? {}),
          file: {
            uri:  bulkDocument.uri,
            name: bulkDocument.name,
            type: bulkDocument.mimeType,
          },
        });
        clearLatestQuoteResult();
        router.replace({
          pathname: '/policy-issued',
          params: {
            travellerName: fullName,
            startDate:     travelDate,
            endDate:       returnDate,
            premiumAmount: String(totalPremium),
          },
        });
      } else if (isStatic) {
        await api.post('/policy/requests', {
          agent_id:          user.id,
          plan_type:         planType,
          traveller_details: { ...formData },
          travel_date:       formData.startDate ?? '',
          return_date:       formData.endDate   ?? '',
          estimated_premium: basePremium,
          payment_amount:    totalPremium,
        });
        clearLatestQuoteResult();
        router.replace({
          pathname: '/policy-issued',
          params: {
            travellerName: fullName,
            startDate:     formData.startDate ?? '',
            endDate:       formData.endDate   ?? '',
            premiumAmount: String(totalPremium),
          },
        });
      } else {
        await api.post('/policy/requests', {
          agent_id:          user.id,
          plan_type:         planType,
          traveller_details,
          travel_date:       parseDateToISO(policy.fromDate ?? ''),
          return_date:       parseDateToISO(policy.toDate ?? ''),
          estimated_premium: basePremium,
          payment_amount:    totalPremium,
        });
        clearLatestQuoteResult();
        router.replace({
          pathname: '/policy-issued',
          params: {
            travellerName: fullName,
            startDate:     parseDateToISO(policy.fromDate ?? ''),
            endDate:       parseDateToISO(policy.toDate ?? ''),
            premiumAmount: String(totalPremium),
          },
        });
      }
    } catch {
      Alert.alert('Error', 'Failed to submit policy request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function startNewQuote() {
    clearLatestQuoteResult();
    router.replace('/');
  }

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
                    {planType === 'bulk' && numTravellers > 1 ? (
                      <Text className="text-xs text-slate-400">
                        Rs. {basePremium} × {numTravellers} travellers + Rs. 50 platform fee
                      </Text>
                    ) : (
                      <Text className="text-xs text-slate-400">Rs. {basePremium} + Rs. 50 platform fee</Text>
                    )}
                  </View>
                  <Text className="mt-2 text-sm font-medium text-slate-600">
                    {isStatic
                      ? staticQuoteResponse?.product
                      : `${policy.travelplan} for ${policy.areaplan}`}
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
              <DetailRow label="Name"           value={fullName} />
              <DetailRow label="Date of birth"  value={formData.dob} />
              <DetailRow label="Gender"         value={formData.gender} />
              <DetailRow label="Marital status" value={formData.maritalStatus} />
              <DetailRow label="Nominee"        value={formData.nomineeName} />
              <DetailRow label="PAN"            value={formData.panNo} />
              <DetailRow label="Email"          value={formData.email} />
              <DetailRow label="Mobile"         value={formData.phone} />
            </SectionCard>

            <SectionCard title="Policy Details" icon={<Ticket size={22} color="#0C4A6E" strokeWidth={2.2} />}>
              {isStatic ? (
                <>
                  <DetailRow label="Product"      value={staticQuoteResponse?.product} />
                  <DetailRow label="No of days"   value={String(staticQuoteResponse?.no_of_days ?? '')} />
                  <DetailRow label="Travel dates" value={`${formData.startDate ?? ''} to ${formData.endDate ?? ''}`} />
                  <DetailRow label="Plan type"    value={planType} />
                </>
              ) : (
                <>
                  <DetailRow label="Request ID"       value={policy.requestid} />
                  <DetailRow label="Policy reference" value={quoteResponse?.proposalResponse.pRequestid_out} />
                  <DetailRow label="Travel dates"     value={`${policy.fromDate} to ${policy.toDate}`} />
                  <DetailRow label="Area plan"        value={policy.areaplan} />
                  <DetailRow label="Plan type"        value={planType} />
                </>
              )}
            </SectionCard>

            {isStatic && staticQuoteResponse?.details ? (
              <SectionCard title="Coverage Details" icon={<Star size={22} color="#0C4A6E" strokeWidth={2.2} />}>
                <DetailRow label="Basic Coverage"                    value={`Rs. ${staticQuoteResponse.details.basic_coverage}`} />
                <DetailRow label="Accidental Hospitalisation"        value={`Rs. ${staticQuoteResponse.details.accidental_hospitalization_expenses}`} />
                <DetailRow label="Trip Cancellation"                 value={`Rs. ${staticQuoteResponse.details.trip_cancellation}`} />
                <DetailRow label="Trip Curtailment"                  value={`Rs. ${staticQuoteResponse.details.trip_curtailment}`} />
                <DetailRow label="Trip Delay"                        value={`Rs. ${staticQuoteResponse.details.trip_delay}`} />
                <DetailRow label="Loss of Checked Baggage"           value={`Rs. ${staticQuoteResponse.details.loss_of_checked_baggage}`} />
                <DetailRow label="Delay of Checked Baggage"          value={`Rs. ${staticQuoteResponse.details.delay_of_checked_baggage}`} />
                <DetailRow label="Loss of Baggage"                   value={`Rs. ${staticQuoteResponse.details.loss_of_baggage}`} />
                <DetailRow label="Personal Liability"                value={`Rs. ${staticQuoteResponse.details.personal_liability}`} />
                <DetailRow label="Home Burglary Insurance"           value={`Rs. ${staticQuoteResponse.details.home_burglary_insurance}`} />
                <DetailRow label="Emergency Hotel Extension"         value={`Rs. ${staticQuoteResponse.details.emergency_hotel_extension}`} />
                <DetailRow label="Emergency Medical Evacuation"      value={`Rs. ${staticQuoteResponse.details.emergency_medical_evacuation}`} />
                <DetailRow label="Bounced Hotel"                     value={`Rs. ${staticQuoteResponse.details.bounced_hotel}`} />
                <DetailRow label="Hospitalisation Daily Allowance"   value={`Rs. ${staticQuoteResponse.details.hospitalization_daily_allowance}`} />
                <DetailRow label="Track A Baggage"                   value={staticQuoteResponse.details.track_a_baggage_service} />
              </SectionCard>
            ) : null}

            {!isStatic && (
              <SectionCard title="Address" icon={<MapPin size={22} color="#0C4A6E" strokeWidth={2.2} />}>
                <DetailRow label="Street"       value={formData.streetName} />
                <DetailRow label="City / State" value={`${formData.city}, ${formData.state}`} />
                <DetailRow label="PIN code"     value={formData.pinCode} />
              </SectionCard>
            )}
          </ScrollView>
        </View>

        <View className="px-5 pb-6 pt-4">
          <Pressable
            className="h-14 flex-row items-center justify-center rounded-[22px] bg-orange-500"
            style={styles.buttonShadow}
            onPress={submitPolicyRequest}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <ExternalLink size={20} color="#FFFFFF" strokeWidth={2.2} />
                <Text className="ml-2 text-lg font-extrabold text-white">Continue To Payment</Text>
              </>
            )}
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
