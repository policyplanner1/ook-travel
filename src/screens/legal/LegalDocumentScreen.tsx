import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Section = { title: string; body: string };

const TERMS_SECTIONS: Section[] = [
  {
    title: '1. Acceptance of Terms',
    body: 'By registering for or using the OOK TRAVEL Application, you agree to be bound by these Terms and Conditions. These Terms govern your appointment as a marketing and lead generation partner of Maa Pranaam Fortune LLP. If you do not agree to these Terms, you must not access or use the Application.',
  },
  {
    title: '2. Appointment',
    body: 'Maa Pranaam Fortune LLP appoints you on a non-exclusive basis to provide marketing, promotional, consulting, and lead generation services for Trip Secure Program products through the OOK TRAVEL Application and its associated network. You shall be responsible for creating customer awareness, generating and forwarding leads, and facilitating customer engagement. You shall not have any authority to bind Policy Planner Insurance Brokers Pvt. Ltd., collect insurance premiums, issue policies, or perform any regulated insurance activities.',
  },
  {
    title: '3. Nature of Relationship',
    body: 'This arrangement is entered into on a principal-to-principal basis and does not create any agency, partnership, employment, franchise, or joint venture relationship. You shall act solely as a marketing and lead generation partner and shall not represent yourself as an insurance broker, insurer, corporate agent, insurance marketing firm, or any other insurance intermediary. All insurance-related activities, including policy issuance, underwriting, claims handling, and regulatory compliance, shall remain the sole responsibility of Policy Planner Insurance Brokers Pvt. Ltd.',
  },
  {
    title: '4. Scope of Services & Regulatory Compliance',
    body: 'You shall at all times comply with all applicable laws, regulations, notifications, circulars, and guidelines governing your activities, including the Insurance Act 1938, the IRDAI Act 1999, applicable IRDAI Regulations, the Information Technology Act 2000, the Digital Personal Data Protection Act 2023, the Consumer Protection Act 2019, and anti-money laundering laws. You expressly acknowledge that you are not licensed or recognised by IRDAI as an insurance intermediary and shall not undertake any activity requiring an insurance licence, including solicitation, policy issuance, underwriting, premium collection, claims settlement, or advisory services.',
  },
  {
    title: '5. Application Integration & Branding',
    body: 'You shall integrate and maintain all APIs, web services, SDKs, or other technology integrations provided by Policy Planner Insurance Brokers Pvt. Ltd. strictly in accordance with their technical specifications and guidelines. You shall prominently display the statement "Powered by Policy Planner Insurance Brokers Pvt. Ltd." on all insurance-related sections and interfaces of the Application. No modification, removal, or alteration of such branding shall be made without prior written consent.',
  },
  {
    title: '6. Appointment of Sub-Agents',
    body: 'You may appoint travel agents, referral partners, channel associates, or other representatives for marketing, promotional, and lead generation activities. You shall remain solely responsible and liable for all acts, omissions, representations, and conduct of such persons and shall ensure they comply with these Terms and all applicable laws. No such person shall engage in any insurance solicitation, advisory, underwriting, policy issuance, premium collection, or other regulated insurance activity.',
  },
  {
    title: '7. Your Obligations',
    body: 'You shall maintain and operate the OOK TRAVEL Application professionally and use reasonable efforts to ensure a minimum platform uptime of ninety-five percent (95%). You shall ensure that all customer and lead information collected is accurate, complete, and transmitted without unauthorised modification or delay. You shall obtain all necessary customer consents and authorisations required under applicable law for the collection, processing, storage, and sharing of customer information, and shall maintain proper records of all customer interactions and lead submissions.',
  },
  {
    title: '8. Prohibited Representations',
    body: 'You shall not make any false, misleading, inaccurate, or unauthorised representations regarding any insurance product, insurer, or Policy Planner Insurance Brokers Pvt. Ltd. You shall not alter, modify, negotiate, or represent any premium rates, policy benefits, exclusions, terms, conditions, or underwriting requirements. Your role is strictly limited to marketing, promotional, consulting, and lead generation activities.',
  },
  {
    title: '9. Insurance Services by Policy Planner',
    body: 'Policy Planner Insurance Brokers Pvt. Ltd. shall be solely responsible for processing customer applications, coordinating with insurers, arranging policy issuance, policy servicing, renewals, endorsements, customer support, and claim assistance. All underwriting decisions, premium calculations, policy approvals, and insurance-related transactions shall remain under the exclusive control and responsibility of Policy Planner Insurance Brokers Pvt. Ltd. and/or the concerned insurer.',
  },
  {
    title: '10. Changes to Terms',
    body: 'Maa Pranaam Fortune LLP may update these Terms at any time. Continued use of the Application after changes are posted constitutes your acceptance of the revised Terms. You will be notified of material changes via the Application or by email.',
  },
  {
    title: '11. Governing Law',
    body: 'These Terms are governed by the laws of India. Any disputes arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the competent courts of India.',
  },
  {
    title: '12. Contact Us',
    body: 'If you have any questions about these Terms and Conditions, please contact us at support@ooktravel.in.',
  },
];

const PRIVACY_SECTIONS: Section[] = [
  {
    title: '1. Introduction',
    body: 'Maa Pranaam Fortune LLP ("we", "us", or "our") is committed to protecting the privacy and personal data of all users of the OOK TRAVEL Application. This Privacy Policy explains how we collect, use, disclose, and safeguard your personal data and the customer data you process through the Application, in accordance with the Digital Personal Data Protection Act 2023 (DPDPA), the Information Technology Act 2000, and other applicable laws.',
  },
  {
    title: '2. Information We Collect',
    body: 'We collect the following categories of information: (a) Partner account information — your full name, email address, phone number, and business details provided during registration; (b) Customer and lead information — traveller details including names, dates of birth, passport or identity numbers, travel itinerary information, and contact details submitted through the Application for the purpose of generating insurance leads; (c) Application usage data — device information, session logs, and usage statistics collected to operate and improve the platform.',
  },
  {
    title: '3. Customer Consents & Authorisations',
    body: 'As a partner using the OOK TRAVEL Application, you are required to obtain all necessary customer consents and authorisations under applicable law — including the Digital Personal Data Protection Act 2023 — before collecting, processing, storing, or sharing any customer personal data through the Application. You must maintain proper records of such consents and ensure customers are informed about how their data will be used and shared with Policy Planner Insurance Brokers Pvt. Ltd. for policy issuance purposes.',
  },
  {
    title: '4. How We Use Your Information',
    body: 'We use the information collected to operate and improve the OOK TRAVEL Application; transmit accurate customer leads to Policy Planner Insurance Brokers Pvt. Ltd. for processing and policy issuance; maintain records of customer interactions, lead submissions, and partner activity; send account-related notifications, updates, and communications; comply with legal, regulatory, and audit obligations under applicable Indian law; and prevent fraud, unauthorised access, and misuse of the platform.',
  },
  {
    title: '5. Sharing of Information with Policy Planner',
    body: 'Customer and lead information submitted through the Application is transmitted to Policy Planner Insurance Brokers Pvt. Ltd. for the purpose of processing insurance applications, coordinating with insurers, and arranging policy issuance under the Trip Secure Program. Policy Planner Insurance Brokers Pvt. Ltd. acts as the licensed insurance broker responsible for all insurance-related activities and handles such data in accordance with their own privacy obligations and IRDAI regulatory requirements.',
  },
  {
    title: '6. Regulatory Compliance',
    body: 'We process personal data in compliance with the Digital Personal Data Protection Act 2023 (DPDPA), the Information Technology Act 2000 and its rules, the Consumer Protection Act 2019, applicable IRDAI regulations, and all other applicable statutory and regulatory requirements. We cooperate with regulatory authorities and provide information as required by law, including in response to any inquiry, audit, inspection, or investigation.',
  },
  {
    title: '7. Data Accuracy',
    body: 'We take reasonable steps to ensure that all customer and lead information collected and transmitted through the Application is accurate, complete, and transmitted to Policy Planner Insurance Brokers Pvt. Ltd. without unauthorised modification or delay. Partners are responsible for ensuring the accuracy of any information they submit through the Application.',
  },
  {
    title: '8. Data Security',
    body: 'We employ industry-standard security measures including encryption in transit and at rest, access controls, and regular security assessments to protect personal data from unauthorised access, disclosure, alteration, or destruction. However, no transmission over the internet or electronic storage method is 100% secure. We cannot guarantee absolute security but are committed to using reasonable measures to protect your data.',
  },
  {
    title: '9. Data Retention',
    body: 'We retain partner account data for as long as your account remains active and for such period thereafter as required to meet our legal, regulatory, and audit obligations. Customer and lead data is retained for the period required under applicable insurance regulations and the DPDPA. Where data is no longer required, it is deleted or anonymised in a secure manner.',
  },
  {
    title: '10. Your Rights',
    body: 'Subject to applicable law and the Digital Personal Data Protection Act 2023, you have the right to access, correct, or erase your personal data held by us; to withdraw consent where processing is based on consent; and to raise a complaint with the Data Protection Board of India. To exercise any of these rights, please contact our Data Protection contact at support@ooktravel.in.',
  },
  {
    title: '11. Changes to This Policy',
    body: 'We may update this Privacy Policy periodically to reflect changes in our practices or applicable law. We will notify you of significant changes via the Application or by email. Continued use of the Application after changes take effect constitutes your acceptance of the updated Privacy Policy.',
  },
  {
    title: '12. Contact Us',
    body: 'For any privacy-related queries, to exercise your data rights, or to raise a concern, please contact us at support@ooktravel.in.',
  },
];

function LegalDocumentScreen({ type }: { type: 'terms' | 'privacy' }) {
  const isTerms = type === 'terms';
  const title = isTerms ? 'Terms and Conditions' : 'Privacy Policy';
  const sections = isTerms ? TERMS_SECTIONS : PRIVACY_SECTIONS;

  return (
    <SafeAreaView className="flex-1 bg-sky-50">
      <View style={styles.header} className="flex-row items-center bg-white px-4 py-3">
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          className="mr-3"
        >
          <ChevronLeft color="#0C4A6E" size={26} strokeWidth={2.2} />
        </Pressable>
        <Text className="flex-1 text-[18px] font-bold text-sky-950" numberOfLines={1}>
          {title}
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text className="mb-1 text-[26px] font-extrabold tracking-tight text-sky-950">
          {title}
        </Text>
        <Text className="mb-6 text-[13px] text-slate-400">Last updated: December 2024</Text>

        {sections.map((section) => (
          <View key={section.title} className="mb-5">
            <Text className="mb-1.5 text-[15px] font-bold text-sky-900">{section.title}</Text>
            <Text className="text-[14px] leading-6 text-slate-600">{section.body}</Text>
          </View>
        ))}

        <View className="mt-4 rounded-2xl bg-orange-50 px-4 py-4" style={styles.noticeBox}>
          <Text className="text-center text-[13px] leading-5 text-orange-700">
            {isTerms
              ? 'By using Ook Travel, you confirm that you have read and agree to these Terms and Conditions.'
              : 'By using Ook Travel, you confirm that you have read and understood our Privacy Policy.'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export function TermsAndConditionsScreen() {
  return <LegalDocumentScreen type="terms" />;
}

export function PrivacyPolicyScreen() {
  return <LegalDocumentScreen type="privacy" />;
}

const styles = StyleSheet.create({
  header: {
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    elevation: 4,
    shadowColor: '#94A3B8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  noticeBox: {
    borderWidth: 1,
    borderColor: '#FDBA74',
  },
});
