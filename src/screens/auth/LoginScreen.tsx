import { useState, type ComponentProps, type ReactNode } from 'react';
import { router } from 'expo-router';
import {
  Alert,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Eye, EyeOff, LockKeyhole, MoveRight, UserRound } from 'lucide-react-native';

import { useAuth } from '@/store/auth';
import { consumePendingRedirect } from '@/store/pending-redirect';

export default function LoginScreen() {
  const { isLoading, login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  async function handleLogin() {
    try {
      await login({ identifier, password });
      router.replace(consumePendingRedirect() ?? '/');
    } catch (error) {
      Alert.alert(
        'Login failed',
        error instanceof Error ? error.message : 'Please try again in a moment.'
      );
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
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            className="flex-1"
            contentContainerClassName="flex-grow justify-center px-3 py-6"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View className="items-center">
              <Image
                source={require('../../../assets/images/ooktravel.png')}
                resizeMode="contain"
                className="mb-1 h-28 w-52"
              />
              <Text className="mb-3 text-xs font-bold uppercase tracking-widest text-sky-800">
                Maa Pranaam Fortune LLP
              </Text>
              <Text className="text-[28px] font-extrabold tracking-[0.2px] text-sky-950">Login</Text>
              {/* <Text className="mt-3 max-w-[320px] font-medium text-center text-[18px] leading-7 text-sky-950/85">
                Sell Travel Insurance Online{'\n'}& Earn High Commissions
              </Text> */}
            </View>

            <View className="mt-8 rounded-[34px] bg-white/80 px-4 py-5" style={styles.cardShadow}>
              <View className="gap-4">
                <AuthField
                  icon={<UserRound color="#94A3B8" size={20} strokeWidth={2.2} />}
                  value={identifier}
                  onChangeText={setIdentifier}
                  placeholder="Email or mobile number"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <AuthField
                  icon={<LockKeyhole color="#94A3B8" size={20} strokeWidth={2.2} />}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Password"
                  secureTextEntry={!isPasswordVisible}
                  rightIcon={
                    isPasswordVisible ? (
                      <Eye color="#A8B1C7" size={20} strokeWidth={2.2} />
                    ) : (
                      <EyeOff color="#A8B1C7" size={20} strokeWidth={2.2} />
                    )
                  }
                  onPressRightIcon={() => setIsPasswordVisible((current) => !current)}
                  rightIconAccessibilityLabel={
                    isPasswordVisible ? 'Hide password' : 'Show password'
                  }
                />
              </View>

              <Pressable
                onPress={handleLogin}
                disabled={isLoading}
                className={`mt-5 rounded-[18px] px-5 py-4 ${isLoading ? 'bg-orange-300' : 'bg-orange-500'}`}
                style={styles.buttonShadow}
              >
                <Text className="text-center text-[18px] font-extrabold text-white">
                  {isLoading ? 'Signing In...' : 'Login'}
                </Text>
              </Pressable>

              <Pressable className="mt-5 self-center" onPress={() => router.push('/forgot-password')}>
                <Text className="text-[16px] font-medium text-sky-900/80">Forgot Password?</Text>
              </Pressable>

              <View className="mt-6 h-px bg-slate-300/70" />

              <View className="mt-5 flex-row items-center justify-center">
                <Text className="text-[16px] text-slate-500">{"Don't have an account? "}</Text>
                <Pressable
                  className="flex-row items-center"
                  onPress={() => router.push('/signup')}
                >
                  <Text className="text-[16px] font-bold text-sky-900">Sign Up</Text>
                  {/* <MoveRight color="#153A75" size={16} strokeWidth={2.5} /> */}
                </Pressable>
              </View>
            </View>

            <View className="mt-5 items-center px-4">
              <Text className="text-center text-[15px] leading-6 text-sky-950/75">
                By logging in, you agree to our
              </Text>
              <View className="flex-row flex-wrap items-center justify-center">
                <Pressable onPress={() => router.push('/terms-and-conditions')}>
                  <Text className="text-[15px] font-semibold text-sky-900">Terms of Service</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

function AuthField({
  icon,
  rightIcon,
  onPressRightIcon,
  rightIconAccessibilityLabel,
  ...props
}: ComponentProps<typeof TextInput> & {
  icon: ReactNode;
  rightIcon?: ReactNode;
  onPressRightIcon?: () => void;
  rightIconAccessibilityLabel?: string;
}) {
  return (
    <View
      className="flex-row items-center rounded-[16px] border bg-white/95 px-4 py-1"
      style={styles.inputField}
    >
      <View className="mr-3">{icon}</View>
      <TextInput
        {...props}
        placeholderTextColor="#64748B"
        className="flex-1 py-4 text-[16px] font-medium text-slate-700"
      />
      {rightIcon ? (
        onPressRightIcon ? (
          <Pressable
            className="ml-3"
            onPress={onPressRightIcon}
            accessibilityRole="button"
            accessibilityLabel={rightIconAccessibilityLabel}
            hitSlop={10}
          >
            {rightIcon}
          </Pressable>
        ) : (
          <View className="ml-3">{rightIcon}</View>
        )
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    height: '100%',
    width: '100%',
  },
  cardShadow: {
    elevation: 16,
    shadowColor: '#5B7FB8',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
  },
  buttonShadow: {
    elevation: 8,
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
  },
  inputField: {
    borderColor: '#C7D2E0',
    elevation: 4,
    shadowColor: '#94A3B8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
  },
});
