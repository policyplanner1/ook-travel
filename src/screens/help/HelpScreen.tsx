import { router } from 'expo-router';
import { ChevronDown, ChevronUp, CircleHelp, Headphones, Images, Mail, MessageCircleMore, Phone, UserRound } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Alert, ImageBackground, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { api } from '@/services/api';
import { useAuth } from '@/store/auth';

const faqs = [
  {
    question: 'How much commission will I receive?',
    answer:
      'You will earn 15% of the total premium amount collected during the month. Commission is calculated on the net premium after applicable taxes and is credited directly to your registered bank account.',
  },
  {
    question: 'When will I receive my commission?',
    answer:
      'Commissions are processed and credited on the 15th of every month for the previous month\'s business. If the 15th falls on a public holiday, the credit will be made on the next working day.',
  },
  {
    question: 'Can I obtain an agent certificate?',
    answer:
      'Yes, once you have completed all your profile details — including KYC verification and bank account information — your official agent certificate will be generated and made available for download from your profile.',
  },
  {
    question: 'What should I do in case of a claim?',
    answer:
      'Please contact our support team immediately. Your dedicated Relationship Manager (RM) will guide you and the insured through the entire claims process, ensuring a smooth and hassle-free experience.',
  },
  {
    question: 'How can I issue a bulk policy?',
    answer:
      'We provide a dedicated Bulk Documents option within the app. Simply navigate to the bulk upload section, prepare your data in the prescribed format, and upload it to generate multiple policies simultaneously.',
  },
] as const;

const DEFAULT_PHONE = '+91 7218452626';
const DEFAULT_PHONE_DIGITS = '917218452626';
const DEFAULT_EMAIL = 'maapranaam@gmail.com';

type RmContact = { full_name: string; mobile: string; email: string } | null;

function FAQItem({
  index,
  item,
  total,
}: {
  index: number;
  item: { question: string; answer: string };
  total: number;
}) {
  const [open, setOpen] = useState(false);
  const isLast = index === total - 1;

  return (
    <View className={isLast ? '' : 'border-b border-slate-100'}>
      <Pressable
        onPress={() => setOpen((prev) => !prev)}
        className="flex-row items-center justify-between py-4"
      >
        <Text className="flex-1 pr-3 text-sm font-bold text-sky-950">{item.question}</Text>
        {open ? (
          <ChevronUp size={18} color="#0C4A6E" strokeWidth={2.3} />
        ) : (
          <ChevronDown size={18} color="#94A3B8" strokeWidth={2.3} />
        )}
      </Pressable>
      {open && (
        <Text className="pb-4 text-sm leading-6 text-slate-500">{item.answer}</Text>
      )}
    </View>
  );
}

export default function HelpScreen() {
  const { user } = useAuth();
  const [rmContact, setRmContact] = useState<RmContact>(null);

  useEffect(() => {
    if (!user?.id) return;
    api.get<{ ok: boolean; data: RmContact }>(`/profile/rm/${user.id}`)
      .then((res) => { if (res.data.ok) setRmContact(res.data.data); })
      .catch(() => {});
  }, [user?.id]);

  const phone = rmContact?.mobile ?? DEFAULT_PHONE;
  const phoneDigits = rmContact?.mobile
    ? rmContact.mobile.replace(/\D/g, '').replace(/^0/, '91')
    : DEFAULT_PHONE_DIGITS;
  const email = rmContact?.email ?? DEFAULT_EMAIL;

  const supportOptions = [
    {
      title: 'Call Support',
      description: rmContact ? `${rmContact.full_name} — ${phone}` : phone,
      icon: Phone,
      action: `tel:+${phoneDigits}`,
    },
    {
      title: 'Email Us',
      description: email,
      icon: Mail,
      action: `mailto:${email}`,
    },
    {
      title: 'WhatsApp Help',
      description: 'Chat with your Relationship Manager',
      icon: MessageCircleMore,
      action: `https://wa.me/${phoneDigits}`,
    },
  ];

  async function handleOpen(url: string) {
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert('Unable to open link', 'Please try again in a moment.');
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
            <Text className="text-3xl font-extrabold text-sky-950">Help & Support</Text>
            <Text className="mt-2 text-sm leading-6 text-slate-600">
              Reach out for policy questions, quote help, or travel assistance guidance.
            </Text>
          </View>

          <View className="mt-6 rounded-[28px] bg-white/95 px-5 py-6" style={styles.panelShadow}>
            <View className="flex-row items-center">
              <View className="h-14 w-14 items-center justify-center rounded-2xl bg-sky-100">
                <Headphones size={28} color="#0C4A6E" strokeWidth={2.3} />
              </View>

              <View className="ml-4 flex-1">
                <Text className="text-xl font-extrabold text-sky-950">24/7 Assistance</Text>
                <Text className="mt-1 text-sm leading-6 text-slate-500">
                  Our support team is available anytime during your trip.
                </Text>
              </View>
            </View>
          </View>

          <View className="mt-5 gap-4">
            {supportOptions.map((option) => {
              const Icon = option.icon;

              return (
                <Pressable
                  key={option.title}
                  onPress={() => handleOpen(option.action)}
                  className="flex-row items-center rounded-[26px] bg-white/95 px-5 py-5"
                  style={styles.panelShadow}
                >
                  <View className="h-12 w-12 items-center justify-center rounded-2xl bg-orange-50">
                    <Icon size={22} color="#EA580C" strokeWidth={2.3} />
                  </View>

                  <View className="ml-4 flex-1">
                    <Text className="text-lg font-extrabold text-sky-950">{option.title}</Text>
                    <Text className="mt-1 text-sm leading-6 text-slate-500">{option.description}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            onPress={() => router.push('/gallery')}
            className="mt-5 flex-row items-center rounded-[28px] bg-white/95 px-5 py-5"
            style={styles.panelShadow}
          >
            <View className="h-12 w-12 items-center justify-center rounded-2xl bg-sky-100">
              <Images size={22} color="#0C4A6E" strokeWidth={2.3} />
            </View>

            <View className="ml-4 flex-1">
              <Text className="text-lg font-extrabold text-sky-950">Open Gallery</Text>
              <Text className="mt-1 text-sm leading-7 text-slate-600">
                View brochure images and the travel insurance one-pager PDF.
              </Text>
            </View>
          </Pressable>

          <Pressable
            onPress={() => router.push('/profile')}
            className="mt-5 flex-row items-center rounded-[28px] bg-white/95 px-5 py-5"
            style={styles.panelShadow}
          >
            <View className="h-12 w-12 items-center justify-center rounded-2xl bg-sky-100">
              <UserRound size={22} color="#0C4A6E" strokeWidth={2.3} />
            </View>

            <View className="ml-4 flex-1">
              <Text className="text-lg font-extrabold text-sky-950">Profile & Logout</Text>
              <Text className="mt-1 text-sm leading-7 text-slate-600">
                View your profile details and logout from your current session.
              </Text>
            </View>
          </Pressable>
          
          <View className="mt-5 rounded-[28px] bg-white/95 px-5 py-6" style={styles.panelShadow}>
            <View className="flex-row items-center gap-3 mb-4">
              <View className="h-10 w-10 items-center justify-center rounded-xl bg-sky-100">
                <CircleHelp size={20} color="#0C4A6E" strokeWidth={2.3} />
              </View>
              <View>
                <Text className="text-xl font-extrabold text-sky-950">FAQs</Text>
                <Text className="text-xs text-slate-500">Frequently Asked Questions</Text>
              </View>
            </View>

            {faqs.map((item, index) => (
              <FAQItem key={index} index={index} item={item} total={faqs.length} />
            ))}
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
  panelShadow: {
    elevation: 10,
    shadowColor: '#1E6BA8',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
  },
});
