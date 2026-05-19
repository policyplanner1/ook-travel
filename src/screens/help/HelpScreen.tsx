import { router } from 'expo-router';
import { Headphones, Images, Mail, MessageCircleMore, Phone, UserRound } from 'lucide-react-native';
import { Alert, ImageBackground, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const supportOptions = [
  {
    title: 'Call Support',
    description: '+91 7218452626',
    icon: Phone,
    action: 'tel:+917218452626',
  },
  {
    title: 'Email Us',
    description: 'maapranaam@gmail.com',
    icon: Mail,
    action: 'mailto:maapranaam@gmail.com',
  },
  {
    title: 'WhatsApp Help',
    description: 'Chat with our assistance team',
    icon: MessageCircleMore,
    action: 'https://wa.me/917218452626',
  },
] as const;

export default function HelpScreen() {
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
                View the current static profile and logout from the dummy session.
              </Text>
            </View>
          </Pressable>
          
          {/* <View className="mt-5 rounded-[28px] bg-white/95 px-5 py-6" style={styles.panelShadow}>
            <Text className="text-lg font-extrabold text-sky-950">Frequently asked help topics</Text>
            <Text className="mt-4 text-sm leading-7 text-slate-600">
              Policy download assistance, claim guidance, destination coverage details, nominee updates,
              and quote submission help.
            </Text>
          </View> */}

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
