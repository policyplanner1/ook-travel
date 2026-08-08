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
  Hash,
  LockKeyhole,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
} from 'lucide-react-native';

import { useAuth } from '@/store/auth';
import { consumePendingRedirect } from '@/store/pending-redirect';
import { sendSignupOtp, verifyRmCode, verifySignupOtp } from '@/services/auth.service';

type SignupStep = 'form' | 'otp';

type SignupField = 'fullName' | 'email' | 'phone' | 'rmCode' | 'password' | 'confirmPassword';

type FieldErrors = Partial<Record<SignupField, string>>;

// Mirrors ookTravel_backend/src/validators/auth.validator.js -> agentSignupRules
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[6-9]\d{9}$/;
const PASSWORD_PATTERN_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/;

function validateFullName(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return 'Full name is required';
  if (trimmed.length < 2 || trimmed.length > 100) return 'Full name must be 2-100 characters';
  return undefined;
}

function validateEmail(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return 'Email is required';
  if (!EMAIL_REGEX.test(trimmed)) return 'Valid email required';
  return undefined;
}

function validatePhone(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return 'Phone number is required';
  if (!PHONE_REGEX.test(trimmed)) return 'Valid 10-digit Indian mobile number required';
  return undefined;
}

function validateRmCode(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return 'RM code is required';
  if (trimmed.length < 4 || trimmed.length > 20) return 'Invalid RM code';
  return undefined;
}

function validatePassword(value: string): string | undefined {
  if (!value) return 'Password is required';
  if (value.length < 8) return 'Password must be at least 8 characters';
  if (!PASSWORD_PATTERN_REGEX.test(value)) {
    return 'Password must contain uppercase, lowercase, number and special character';
  }
  return undefined;
}

function validateConfirmPassword(value: string, password: string): string | undefined {
  if (!value) return 'Please confirm your password';
  if (value !== password) return 'Passwords do not match';
  return undefined;
}

export default function SignupScreen() {
  const { isLoading, signup } = useAuth();
  const scrollViewRef = useRef<ScrollView>(null);
  const fieldPositionsRef = useRef<Record<string, number>>({});
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const [step, setStep] = useState<SignupStep>('form');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [hasRmCode, setHasRmCode] = useState(false);
  const [rmCode, setRmCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
  const [hasAcceptedPrivacy, setHasAcceptedPrivacy] = useState(false);
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

  function handleFullNameChange(value: string) {
    setFullName(value);
    if (errors.fullName) {
      setErrors((prev) => ({ ...prev, fullName: validateFullName(value) }));
    }
  }

  function handleEmailChange(value: string) {
    setEmail(value);
    if (errors.email) {
      setErrors((prev) => ({ ...prev, email: validateEmail(value) }));
    }
  }

  function handlePhoneChange(value: string) {
    setPhone(value);
    if (errors.phone) {
      setErrors((prev) => ({ ...prev, phone: validatePhone(value) }));
    }
  }

  function handleRmCodeChange(value: string) {
    setRmCode(value);
    if (errors.rmCode) {
      setErrors((prev) => ({ ...prev, rmCode: validateRmCode(value) }));
    }
  }

  function handlePasswordChange(value: string) {
    setPassword(value);
    if (errors.password) {
      setErrors((prev) => ({ ...prev, password: validatePassword(value) }));
    }
    if (errors.confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: validateConfirmPassword(confirmPassword, value) }));
    }
  }

  function handleConfirmPasswordChange(value: string) {
    setConfirmPassword(value);
    if (errors.confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: validateConfirmPassword(value, password) }));
    }
  }

  function handleFullNameBlur() {
    setErrors((prev) => ({ ...prev, fullName: validateFullName(fullName) }));
  }

  function handleEmailBlur() {
    setErrors((prev) => ({ ...prev, email: validateEmail(email) }));
  }

  function handlePhoneBlur() {
    setErrors((prev) => ({ ...prev, phone: validatePhone(phone) }));
  }

  function handleRmCodeBlur() {
    setErrors((prev) => ({ ...prev, rmCode: hasRmCode ? validateRmCode(rmCode) : undefined }));
  }

  function handleToggleHasRmCode(value: boolean) {
    setHasRmCode(value);
    if (!value) {
      setRmCode('');
      setErrors((prev) => ({ ...prev, rmCode: undefined }));
    }
  }

  function handlePasswordBlur() {
    setErrors((prev) => ({ ...prev, password: validatePassword(password) }));
  }

  function handleConfirmPasswordBlur() {
    setErrors((prev) => ({ ...prev, confirmPassword: validateConfirmPassword(confirmPassword, password) }));
  }

  async function handleSendOtp() {
    if (!hasAcceptedTerms || !hasAcceptedPrivacy) {
      Alert.alert(
        'Agreement required',
        'Please accept the Terms and Conditions and Privacy Policy to continue.'
      );
      return;
    }

    const nextErrors: FieldErrors = {
      fullName: validateFullName(fullName),
      email: validateEmail(email),
      phone: validatePhone(phone),
      rmCode: hasRmCode ? validateRmCode(rmCode) : undefined,
      password: validatePassword(password),
      confirmPassword: validateConfirmPassword(confirmPassword, password),
    };
    setErrors(nextErrors);

    const firstInvalidField = (
      ['fullName', 'email', 'phone', 'rmCode', 'password', 'confirmPassword'] as const
    ).find((field) => nextErrors[field]);

    if (firstInvalidField) {
      scrollToField(firstInvalidField);
      return;
    }

    setIsOtpSending(true);

    try {
      if (hasRmCode) {
        try {
          await verifyRmCode(rmCode);
        } catch (error) {
          setErrors((prev) => ({
            ...prev,
            rmCode: error instanceof Error ? error.message : 'Invalid RM code. Please check and try again.',
          }));
          scrollToField('rmCode');
          return;
        }
      }

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
      await signup({
        fullName,
        email,
        phone,
        password,
        confirmPassword,
        rmCode: hasRmCode ? rmCode : undefined,
      });
      Alert.alert('Account created', 'Your account has been created successfully!', [
        { text: 'OK', onPress: () => router.replace(consumePendingRedirect() ?? '/') },
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
                onChangeText={handleFullNameChange}
                onBlur={handleFullNameBlur}
                placeholder="Full name"
                onFocus={() => scrollToField('fullName')}
                hasError={Boolean(errors.fullName)}
              />
              {errors.fullName ? (
                <Text className="mt-1.5 ml-1 text-[13px] font-medium text-red-500">
                  {errors.fullName}
                </Text>
              ) : null}
            </View>
            <View onLayout={(event) => registerFieldPosition('email', event.nativeEvent.layout.y)}>
              <AuthField
                icon={<Mail color="#94A3B8" size={20} strokeWidth={2.2} />}
                value={email}
                onChangeText={handleEmailChange}
                onBlur={handleEmailBlur}
                placeholder="Email address"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                onFocus={() => scrollToField('email')}
                hasError={Boolean(errors.email)}
              />
              {errors.email ? (
                <Text className="mt-1.5 ml-1 text-[13px] font-medium text-red-500">
                  {errors.email}
                </Text>
              ) : null}
            </View>
            <View onLayout={(event) => registerFieldPosition('phone', event.nativeEvent.layout.y)}>
              <AuthField
                icon={<Phone color="#94A3B8" size={20} strokeWidth={2.2} />}
                value={phone}
                onChangeText={handlePhoneChange}
                onBlur={handlePhoneBlur}
                placeholder="Phone number"
                keyboardType="phone-pad"
                onFocus={() => scrollToField('phone')}
                hasError={Boolean(errors.phone)}
              />
              {errors.phone ? (
                <Text className="mt-1.5 ml-1 text-[13px] font-medium text-red-500">
                  {errors.phone}
                </Text>
              ) : null}
            </View>
            <View onLayout={(event) => registerFieldPosition('rmCode', event.nativeEvent.layout.y)}>
              <Text className="mb-2 ml-1 text-[15px] font-semibold text-sky-950/80">
                Do you have an RM code?
              </Text>
              <View className="flex-row gap-3">
                <Pressable
                  onPress={() => handleToggleHasRmCode(true)}
                  className={`flex-1 items-center rounded-[14px] border py-3 ${
                    hasRmCode ? 'border-orange-500 bg-orange-50' : 'border-slate-300 bg-white/70'
                  }`}
                >
                  <Text
                    className={`text-[15px] font-bold ${hasRmCode ? 'text-orange-600' : 'text-slate-500'}`}
                  >
                    Yes
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => handleToggleHasRmCode(false)}
                  className={`flex-1 items-center rounded-[14px] border py-3 ${
                    !hasRmCode ? 'border-orange-500 bg-orange-50' : 'border-slate-300 bg-white/70'
                  }`}
                >
                  <Text
                    className={`text-[15px] font-bold ${!hasRmCode ? 'text-orange-600' : 'text-slate-500'}`}
                  >
                    No
                  </Text>
                </Pressable>
              </View>

              {hasRmCode ? (
                <View className="mt-3">
                  <AuthField
                    icon={<Hash color="#94A3B8" size={20} strokeWidth={2.2} />}
                    value={rmCode}
                    onChangeText={handleRmCodeChange}
                    onBlur={handleRmCodeBlur}
                    placeholder="Enter RM code"
                    autoCapitalize="characters"
                    autoCorrect={false}
                    onFocus={() => scrollToField('rmCode')}
                    hasError={Boolean(errors.rmCode)}
                  />
                  {errors.rmCode ? (
                    <Text className="mt-1.5 ml-1 text-[13px] font-medium text-red-500">
                      {errors.rmCode}
                    </Text>
                  ) : (
                    <Text className="mt-1.5 ml-1 text-[13px] text-slate-500">
                      Ask your Relationship Manager for their code
                    </Text>
                  )}
                </View>
              ) : (
                <Text className="mt-2 ml-1 text-[13px] text-slate-500">
                  No problem — we'll assign you to an available Relationship Manager automatically.
                </Text>
              )}
            </View>
            <View onLayout={(event) => registerFieldPosition('password', event.nativeEvent.layout.y)}>
              <AuthField
                icon={<LockKeyhole color="#94A3B8" size={20} strokeWidth={2.2} />}
                value={password}
                onChangeText={handlePasswordChange}
                onBlur={handlePasswordBlur}
                placeholder="Password"
                secureTextEntry={!isPasswordVisible}
                onFocus={() => scrollToField('password')}
                hasError={Boolean(errors.password)}
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
              {errors.password ? (
                <Text className="mt-1.5 ml-1 text-[13px] font-medium text-red-500">
                  {errors.password}
                </Text>
              ) : null}
            </View>
            <View
              onLayout={(event) =>
                registerFieldPosition('confirmPassword', event.nativeEvent.layout.y)
              }
            >
              <AuthField
                icon={<LockKeyhole color="#94A3B8" size={20} strokeWidth={2.2} />}
                value={confirmPassword}
                onChangeText={handleConfirmPasswordChange}
                onBlur={handleConfirmPasswordBlur}
                placeholder="Confirm password"
                secureTextEntry={!isConfirmPasswordVisible}
                onFocus={() => scrollToField('confirmPassword')}
                hasError={Boolean(errors.confirmPassword)}
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
              {errors.confirmPassword ? (
                <Text className="mt-1.5 ml-1 text-[13px] font-medium text-red-500">
                  {errors.confirmPassword}
                </Text>
              ) : null}
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
            onPress={() => setHasAcceptedPrivacy((current) => !current)}
            className="mt-3 flex-row items-start"
            accessibilityRole="checkbox"
            accessibilityState={{ checked: hasAcceptedPrivacy }}
          >
            <View
              className={`mt-0.5 h-5 w-5 items-center justify-center rounded border ${
                hasAcceptedPrivacy ? 'border-orange-500 bg-orange-500' : 'border-slate-400 bg-white'
              }`}
            >
              {hasAcceptedPrivacy ? <Check color="#FFFFFF" size={14} strokeWidth={3} /> : null}
            </View>
            <Text className="ml-3 flex-1 text-[15px] leading-6 text-sky-950/80">
              I agree to the{' '}
              <Text
                className="font-semibold text-sky-900"
                onPress={() => router.push('/privacy-policy')}
              >
                Privacy Policy
              </Text>
              .
            </Text>
          </Pressable>

          <Pressable
            onPress={handleSendOtp}
            disabled={isOtpSending || !hasAcceptedTerms || !hasAcceptedPrivacy}
            className={`mt-5 rounded-[18px] px-5 py-4 ${isOtpSending || !hasAcceptedTerms || !hasAcceptedPrivacy ? 'bg-orange-300' : 'bg-orange-500'}`}
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
              {/* <Text className="mt-3 max-w-[320px] text-center text-[18px] leading-7 text-sky-950/85">
                Start selling travel insurance{'\n'}with your Ook Travel account
              </Text> */}
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
  hasError,
  ...props
}: ComponentProps<typeof TextInput> & {
  icon: ReactNode;
  rightIcon?: ReactNode;
  onPressRightIcon?: () => void;
  rightIconAccessibilityLabel?: string;
  hasError?: boolean;
}) {
  return (
    <View
      className="flex-row items-center rounded-[16px] border bg-white/95 px-4 py-1"
      style={[styles.inputField, hasError && styles.inputFieldError]}
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
  inputFieldError: {
    borderColor: '#EF4444',
  },
});
