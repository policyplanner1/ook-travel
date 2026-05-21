import { useEffect, useRef, useState, type ComponentProps, type ReactNode } from 'react';
import { router } from 'expo-router';
import {
  Alert,
  Image,
  ImageBackground,
  Keyboard,
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
import {
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
} from 'lucide-react-native';

import { useAuth } from '@/store/auth';
import { sendSignupOtp, verifySignupOtp } from '@/services/auth.service';

type SignupStep = 'form' | 'otp';

export default function SignupScreen() {
  const { isLoading, signup } = useAuth();
  const scrollViewRef = useRef<ScrollView>(null);
  const fieldPositionsRef = useRef<Record<string, number>>({});
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const [step, setStep] = useState<SignupStep>('form');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [isOtpSending, setIsOtpSending] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const resendTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (step !== 'otp') return;

    setResendCountdown(120);
    resendTimerRef.current = setInterval(() => {
      setResendCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(resendTimerRef.current!);
          resendTimerRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (resendTimerRef.current) {
        clearInterval(resendTimerRef.current);
        resendTimerRef.current = null;
      }
    };
  }, [step]);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSubscription = Keyboard.addListener(showEvent, (event) => {
      setKeyboardOffset(event.endCoordinates.height);
    });

    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      setKeyboardOffset(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  async function handleSendOtp() {
    if (!hasAcceptedTerms) {
      Alert.alert('Terms required', 'Please accept the Terms and Conditions to continue.');
      return;
    }

    if (!fullName.trim() || !email.trim() || !phone.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('Missing fields', 'Please complete all fields before sending OTP.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Password mismatch', 'Password and confirm password must match.');
      return;
    }

    setIsOtpSending(true);

    try {
      const message = await sendSignupOtp({ phone });
      Alert.alert('OTP sent', message);
      setStep('otp');
    } catch (error) {
      Alert.alert(
        'Unable to send OTP',
        error instanceof Error ? error.message : 'Please try again in a moment.'
      );
    } finally {
      setIsOtpSending(false);
    }
  }

  async function handleResendOtp() {
    setIsOtpSending(true);
    try {
      const message = await sendSignupOtp({ phone });
      Alert.alert('OTP resent', message);
      setResendCountdown(120);
      resendTimerRef.current = setInterval(() => {
        setResendCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(resendTimerRef.current!);
            resendTimerRef.current = null;
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      Alert.alert(
        'Unable to resend OTP',
        error instanceof Error ? error.message : 'Please try again in a moment.'
      );
    } finally {
      setIsOtpSending(false);
    }
  }

  async function handleVerifyAndSignup() {
    try {
      await verifySignupOtp({ phone, otp });
      await signup({ fullName, email, phone, password, confirmPassword });
      Alert.alert('Account created', 'Your account has been created successfully!', [
        { text: 'OK', onPress: () => router.replace('/') },
      ]);
    } catch (error) {
      Alert.alert(
        'Signup failed',
        error instanceof Error ? error.message : 'Please try again in a moment.'
      );
    }
  }

  function registerFieldPosition(field: string, y: number) {
    fieldPositionsRef.current[field] = y;
  }

  function scrollToField(field: string) {
    const y = fieldPositionsRef.current[field];

    if (typeof y !== 'number') {
      return;
    }

    const extraOffset = keyboardOffset > 0 ? 120 : 40;
    scrollViewRef.current?.scrollTo({
      y: Math.max(0, y - extraOffset),
      animated: true,
    });
  }

  function renderStepContent() {
    if (step === 'form') {
      return (
        <>
          <View className="gap-4">
            <View onLayout={(event) => registerFieldPosition('fullName', event.nativeEvent.layout.y)}>
              <AuthField
                icon={<UserRound color="#94A3B8" size={20} strokeWidth={2.2} />}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Full name"
                onFocus={() => scrollToField('fullName')}
              />
            </View>
            <View onLayout={(event) => registerFieldPosition('email', event.nativeEvent.layout.y)}>
              <AuthField
                icon={<Mail color="#94A3B8" size={20} strokeWidth={2.2} />}
                value={email}
                onChangeText={setEmail}
                placeholder="Email address"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                onFocus={() => scrollToField('email')}
              />
            </View>
            <View onLayout={(event) => registerFieldPosition('phone', event.nativeEvent.layout.y)}>
              <AuthField
                icon={<Phone color="#94A3B8" size={20} strokeWidth={2.2} />}
                value={phone}
                onChangeText={setPhone}
                placeholder="Phone number"
                keyboardType="phone-pad"
                onFocus={() => scrollToField('phone')}
              />
            </View>
            <View onLayout={(event) => registerFieldPosition('password', event.nativeEvent.layout.y)}>
              <AuthField
                icon={<LockKeyhole color="#94A3B8" size={20} strokeWidth={2.2} />}
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                secureTextEntry={!isPasswordVisible}
                onFocus={() => scrollToField('password')}
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
            <View
              onLayout={(event) =>
                registerFieldPosition('confirmPassword', event.nativeEvent.layout.y)
              }
            >
              <AuthField
                icon={<LockKeyhole color="#94A3B8" size={20} strokeWidth={2.2} />}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm password"
                secureTextEntry={!isConfirmPasswordVisible}
                onFocus={() => scrollToField('confirmPassword')}
                rightIcon={
                  isConfirmPasswordVisible ? (
                    <Eye color="#A8B1C7" size={20} strokeWidth={2.2} />
                  ) : (
                    <EyeOff color="#A8B1C7" size={20} strokeWidth={2.2} />
                  )
                }
                onPressRightIcon={() => setIsConfirmPasswordVisible((current) => !current)}
                rightIconAccessibilityLabel={
                  isConfirmPasswordVisible ? 'Hide confirm password' : 'Show confirm password'
                }
              />
            </View>
          </View>

          <Pressable
            onPress={() => setHasAcceptedTerms((current) => !current)}
            className="mt-5 flex-row items-start"
            accessibilityRole="checkbox"
            accessibilityState={{ checked: hasAcceptedTerms }}
          >
            <View
              className={`mt-0.5 h-5 w-5 items-center justify-center rounded border ${
                hasAcceptedTerms ? 'border-orange-500 bg-orange-500' : 'border-slate-400 bg-white'
              }`}
            >
              {hasAcceptedTerms ? <Check color="#FFFFFF" size={14} strokeWidth={3} /> : null}
            </View>
            <Text className="ml-3 flex-1 text-[15px] leading-6 text-sky-950/80">
              I accept the{' '}
              <Text
                className="font-semibold text-sky-900"
                onPress={() => router.push('/terms-and-conditions')}
              >
                Terms and Conditions
              </Text>
              .
            </Text>
          </Pressable>

          <Pressable
            onPress={handleSendOtp}
            disabled={isOtpSending || !hasAcceptedTerms}
            className={`mt-5 rounded-[18px] px-5 py-4 ${isOtpSending || !hasAcceptedTerms ? 'bg-orange-300' : 'bg-orange-500'}`}
            style={styles.buttonShadow}
          >
            <Text className="text-center text-[18px] font-extrabold text-white">
              {isOtpSending ? 'Sending OTP...' : 'Send OTP'}
            </Text>
          </Pressable>
        </>
      );
    }

    return (
      <>
        <Text className="text-center text-[16px] leading-6 text-slate-500">
          Enter the OTP sent to {phone.trim() || 'your mobile number'}.
        </Text>

        <View className="mt-5 gap-4">
          <AuthField
            icon={<ShieldCheck color="#94A3B8" size={20} strokeWidth={2.2} />}
            value={otp}
            onChangeText={setOtp}
            placeholder="Enter OTP"
            keyboardType="number-pad"
          />
        </View>

        <Pressable
          onPress={handleVerifyAndSignup}
          disabled={isLoading}
          className={`mt-5 rounded-[18px] px-5 py-4 ${isLoading ? 'bg-orange-300' : 'bg-orange-500'}`}
          style={styles.buttonShadow}
        >
          <Text className="text-center text-[18px] font-extrabold text-white">
            {isLoading ? 'Creating Account...' : 'Verify & Create Account'}
          </Text>
        </Pressable>

        <View className="mt-4 flex-row items-center justify-center gap-3">
          {resendCountdown > 0 ? (
            <Text className="text-[14px] text-slate-500">
              Resend OTP in {resendCountdown}s
            </Text>
          ) : (
            <Pressable onPress={handleResendOtp} disabled={isOtpSending || isLoading}>
              <Text
                className={`text-[15px] font-semibold ${isOtpSending ? 'text-slate-400' : 'text-orange-500'}`}
              >
                {isOtpSending ? 'Resending...' : 'Resend OTP'}
              </Text>
            </Pressable>
          )}
          <Text className="text-slate-300">|</Text>
          <Pressable onPress={() => setStep('form')} disabled={isLoading || isOtpSending}>
            <Text className="text-[15px] font-semibold text-sky-900">Change details</Text>
          </Pressable>
        </View>
      </>
    );
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
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 16 : 24}
        >
          <ScrollView
            ref={scrollViewRef}
            className="flex-1"
            contentContainerStyle={[
              styles.scrollContent,
              keyboardOffset > 0 ? styles.scrollContentKeyboardOpen : styles.scrollContentCentered,
              {
                paddingBottom: keyboardOffset > 0 ? keyboardOffset + 32 : 24,
              },
            ]}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
          >
            <View className="items-center">
              <Image
                source={require('../../../assets/images/ooktravel.png')}
                resizeMode="contain"
                className="h-28 w-52"
              />
              <Text className="text-[28px] font-extrabold tracking-[0.2px] text-sky-950">
                Sign Up
              </Text>
              <Text className="mt-3 max-w-[320px] text-center text-[18px] leading-7 text-sky-950/85">
                Start selling travel insurance{'\n'}with your Ook Travel account
              </Text>
            </View>

            <View className="mt-8 rounded-[34px] bg-white/80 px-4 py-5" style={styles.cardShadow}>
              <View className="mb-5 flex-row items-center justify-center">
                <StepBadge label="1" isActive={step === 'form'} isDone={step === 'otp'} />
                <View className="mx-2 h-px w-10 bg-slate-300" />
                <StepBadge label="2" isActive={step === 'otp'} isDone={false} />
              </View>

              {renderStepContent()}

              <View className="mt-6 h-px bg-slate-300/70" />

              <View className="mt-5 flex-row items-center justify-center">
                <Text className="text-[16px] text-slate-500">Already have an account? </Text>
                <Pressable className="flex-row items-center" onPress={() => router.push('/login')}>
                  <Text className="ml-1 text-[16px] font-bold text-sky-900">Login</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

function StepBadge({
  label,
  isActive,
  isDone,
}: {
  label: string;
  isActive: boolean;
  isDone: boolean;
}) {
  return (
    <View
      className={`h-10 w-10 items-center justify-center rounded-2xl ${
        isActive ? 'bg-orange-500' : isDone ? 'bg-sky-700' : 'bg-slate-200'
      }`}
    >
      <Text
        className={`text-base font-extrabold ${
          isActive || isDone ? 'text-white' : 'text-slate-500'
        }`}
      >
        {label}
      </Text>
    </View>
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 12,
    paddingTop: 24,
  },
  scrollContentCentered: {
    justifyContent: 'center',
  },
  scrollContentKeyboardOpen: {
    justifyContent: 'flex-start',
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
