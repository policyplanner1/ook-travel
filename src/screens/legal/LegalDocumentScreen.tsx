import { router } from 'expo-router';
import {
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';

const agreementSections = [
  {
    title: '1. Scope',
    paragraphs: ['The Agent shall:'],
    bullets: [
      "Promote insurance products on the Company's App",
      'Generate leads and assist users in booking',
    ],
    closing:
      'The Agent shall not collect premiums or issue policies. All transactions occur directly with insurers.',
  },
  {
    title: '2. Appointment',
    paragraphs: [
      'The Agent is appointed as a non-exclusive, independent marketing agent and is not an employee or insurance intermediary.',
    ],
  },
  {
    title: '3. Compliance',
    paragraphs: [
      'The Agent shall comply with IRDAI regulations, shall not misrepresent products, and shall not provide insurance advice. This is a marketing services arrangement only.',
    ],
  },
  {
    title: '4. Payment',
    paragraphs: [
      'The Agent will receive a marketing fee/commission as agreed. No expenses will be reimbursed unless approved.',
    ],
  },
  {
    title: '5. Ownership',
    paragraphs: [
      'The App, brand, and materials remain the property of the Company. The Agent gets limited usage rights.',
    ],
  },
  {
    title: '6. Term & Termination',
    paragraphs: [
      'This Agreement is valid for 1 year and may be terminated by either party with notice, or immediately in case of violation or fraud.',
    ],
  },
  {
    title: '7. Confidentiality',
    paragraphs: ['The Agent must keep all customer and business data confidential.'],
  },
  {
    title: '8. Liability',
    paragraphs: ['The Agent is responsible for any misconduct, misrepresentation, or breach.'],
  },
  {
    title: '9. Governing Law',
    paragraphs: ['This Agreement is governed by the laws of India.'],
  },
];

const companyDetails =
  'Maa Pranaam Fortune LLP, a company incorporated under the Companies Act, 2013/1956, having its registered office at B/3, KPCT Mall, Fatima Nagar, Pune, Maharashtra, PIN - 411040 (hereinafter referred to as the "Company" or "Marketing Agency", which expression shall, unless repugnant to the context or meaning thereof, be deemed to mean and include its successors and permitted assigns);';

const agentDetails =
  '[Agent Name/Company Name], a [Individual/Proprietorship/Partnership/Company] having its registered office/residence at [Address] (hereinafter referred to as the "Agent", which expression shall, unless repugnant to the context or meaning thereof, be deemed to mean and include its successors and permitted assigns).';

export default function LegalDocumentScreen() {
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
          contentContainerClassName="px-4 py-5"
          showsVerticalScrollIndicator={false}
        >
          <Pressable
            onPress={() => router.back()}
            className="mb-4 h-11 w-11 items-center justify-center rounded-full bg-white/85"
            style={styles.backButtonShadow}
          >
            <ArrowLeft color="#0F2854" size={20} strokeWidth={2.4} />
          </Pressable>

          <View className="rounded-[30px] bg-white px-5 py-6" style={styles.cardShadow}>
            <Text className="text-[28px] font-extrabold text-sky-950">
              Marketing Agency Agreement
            </Text>
            <Text className="mt-2 text-sm font-medium uppercase tracking-[1.5px] text-orange-600">
              Effective Date 27-04-2026
            </Text>

            <View className="mt-6 gap-5">
              <Text className="text-[15px] leading-6 text-slate-700">
                This Marketing Agency Agreement ("Agreement") is made and entered into on this
                27-04-2026 ("Effective Date") at Pune, Maharashtra.
              </Text>

              <View className="gap-2">
                <Text className="text-base font-extrabold uppercase tracking-[1px] text-sky-950">
                  By And Between
                </Text>
                <Text className="text-[15px] leading-6 text-slate-700">{companyDetails}</Text>
                <Text className="text-sm font-bold uppercase tracking-[1px] text-orange-600">
                  And
                </Text>
                <Text className="text-[15px] leading-6 text-slate-700">{agentDetails}</Text>
                <Text className="text-[15px] leading-6 text-slate-700">
                  The Company and the Agent are collectively referred to as "Parties" and
                  individually as "Party".
                </Text>
              </View>

              <View className="gap-2">
                <Text className="text-base font-extrabold uppercase tracking-[1px] text-sky-950">
                  Whereas
                </Text>
              </View>

              {agreementSections.map((section) => (
                <View key={section.title} className="gap-2 rounded-3xl bg-slate-50 px-4 py-4">
                  <Text className="text-base font-bold text-sky-950">{section.title}</Text>
                  {section.paragraphs?.map((paragraph) => (
                    <Text key={paragraph} className="text-[15px] leading-6 text-slate-700">
                      {paragraph}
                    </Text>
                  ))}
                  {section.bullets?.map((bullet) => (
                    <View key={bullet} className="flex-row items-start">
                      <Text className="mr-2 text-[15px] leading-6 text-slate-700">{'\u2022'}</Text>
                      <Text className="flex-1 text-[15px] leading-6 text-slate-700">{bullet}</Text>
                    </View>
                  ))}
                  {section.closing ? (
                    <Text className="text-[15px] leading-6 text-slate-700">{section.closing}</Text>
                  ) : null}
                </View>
              ))}

              <View className="gap-2">
                <Text className="text-base font-extrabold uppercase tracking-[1px] text-sky-950">
                  Acceptance
                </Text>
                <Text className="text-[15px] leading-6 text-slate-700">
                  By using the App, the Agent agrees to these terms.
                </Text>
              </View>

              <View className="gap-2">
                <Text className="text-[15px] leading-6 text-slate-700">
                  IN WITNESS WHEREOF, the parties have executed this Agreement as of the date
                  first above written.
                </Text>
              </View>

              <View className="gap-4 rounded-3xl bg-slate-50 px-4 py-4">
                <View className="gap-1">
                  <Text className="text-base font-bold text-sky-950">
                    For Maa Pranaam Fortune LLP (Marketing Agency)
                  </Text>
                  <Text className="text-[15px] leading-6 text-slate-700">
                    Authorized Signatory: _______
                  </Text>
                  <Text className="text-[15px] leading-6 text-slate-700">
                    Name: Maa Pranaam Fortune LLP
                  </Text>
                  <Text className="text-[15px] leading-6 text-slate-700">Title:</Text>
                </View>

                <View className="gap-1">
                  <Text className="text-base font-bold text-sky-950">
                    For [Agent Name/Company Name] (Agent)
                  </Text>
                  <Text className="text-[15px] leading-6 text-slate-700">
                    Authorized Signatory: _______
                  </Text>
                  <Text className="text-[15px] leading-6 text-slate-700">Name:</Text>
                  <Text className="text-[15px] leading-6 text-slate-700">Title:</Text>
                </View>
              </View>

              <View className="gap-2 rounded-3xl bg-orange-50 px-4 py-4">
                <Text className="text-base font-bold text-sky-950">
                  Annexure A: Remuneration Structure
                </Text>
                <Text className="text-[15px] leading-6 text-slate-700">
                  (This section must be completed based on your specific business model, e.g.,
                  Rs. X per lead, or Y% of marketing fee received from insurer).
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    height: '100%',
    width: '100%',
  },
  cardShadow: {
    elevation: 14,
    shadowColor: '#5B7FB8',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
  },
  backButtonShadow: {
    elevation: 6,
    shadowColor: '#5B7FB8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
  },
});
