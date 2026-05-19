import { useState, type ComponentProps, type ReactNode } from 'react';
import { router } from 'expo-router';
import {
  Alert,
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
import { Eye, EyeOff, LockKeyhole, MoveLeft, Phone, ShieldCheck } from 'lucide-react-native';

import {
  requestPasswordResetOtp,
  resetPasswordWithOtp,
  verifyPasswordResetOtp,
} from '@/services/auth.service';

type ResetStep = 'mobile' | 'otp' | 'password';

export default function ForgotPasswordScreen() {
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState<ResetStep>('mobile');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

  async function handleSendOtp() {
    setIsSubmitting(true);

    try {
      const message = await requestPasswordResetOtp({ mobile });
      Alert.alert('OTP sent', message);
      setStep('otp');
    } catch (error) {
      Alert.alert(
        'Unable to send OTP',
        error instanceof Error ? error.message : 'Please try again in a moment.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleVerifyOtp() {
    setIsSubmitting(true);

    try {
      const message = await verifyPasswordResetOtp({ mobile, otp });
      Alert.alert('OTP verified', message);
      setStep('password');
    } catch (error) {
      Alert.alert(
        'OTP verification failed',
        error instanceof Error ? error.message : 'Please try again in a moment.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResetPassword() {
    setIsSubmitting(true);

    try {
      const message = await resetPasswordWithOtp({ mobile, newPassword, confirmPassword });
      Alert.alert('Password reset', message, [
        {
          text: 'Back to login',
          onPress: () => router.replace('/login'),
        },
      ]);
    } catch (error) {
      Alert.alert(
        'Reset password failed',
        error instanceof Error ? error.message : 'Please try again in a moment.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function renderStepContent() {
    if (step === 'mobile') {
      return (
        <>
          <Text className="text-center text-[16px] leading-6 text-slate-500">
            Enter your registered mobile number to receive a reset OTP.
          </Text>

          <View className="mt-5 gap-4">
            <AuthField
              icon={<Phone color="#94A3B8" size={20} strokeWidth={2.2} />}
              value={mobile}
              onChangeText={setMobile}
              placeholder="Registered mobile number"
              keyboardType="phone-pad"
            />
          </View>

          <Pressable
            onPress={handleSendOtp}
            disabled={isSubmitting}
            className={`mt-5 rounded-[18px] px-5 py-4 ${isSubmitting ? 'bg-orange-300' : 'bg-orange-500'}`}
            style={styles.buttonShadow}
          >
            <Text className="text-center text-[18px] font-extrabold text-white">
              {isSubmitting ? 'Sending OTP...' : 'Send OTP'}
            </Text>
          </Pressable>
        </>
      );
    }

    if (step === 'otp') {
      return (
        <>
          <Text className="text-center text-[16px] leading-6 text-slate-500">
            Verify the OTP sent to {mobile.trim() || 'your mobile number'}.
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
            onPress={handleVerifyOtp}
            disabled={isSubmitting}
            className={`mt-5 rounded-[18px] px-5 py-4 ${isSubmitting ? 'bg-orange-300' : 'bg-orange-500'}`}
            style={styles.buttonShadow}
          >
            <Text className="text-center text-[18px] font-extrabold text-white">
              {isSubmitting ? 'Verifying OTP...' : 'Verify OTP'}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setStep('mobile')}
            disabled={isSubmitting}
            className="mt-4 self-center"
          >
            <Text className="text-[15px] font-semibold text-sky-900">Change mobile number</Text>
          </Pressable>
        </>
      );
    }

    return (
      <>
        <Text className="text-center text-[16px] leading-6 text-slate-500">
          Create a new password for {mobile.trim() || 'your account'}.
        </Text>

        <View className="mt-5 gap-4">
          <AuthField
            icon={<LockKeyhole color="#94A3B8" size={20} strokeWidth={2.2} />}
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="New password"
            secureTextEntry={!isNewPasswordVisible}
            rightIcon={
              isNewPasswordVisible ? (
                <Eye color="#A8B1C7" size={20} strokeWidth={2.2} />
              ) : (
                <EyeOff color="#A8B1C7" size={20} strokeWidth={2.2} />
              )
            }
            onPressRightIcon={() => setIsNewPasswordVisible((current) => !current)}
            rightIconAccessibilityLabel={
              isNewPasswordVisible ? 'Hide new password' : 'Show new password'
            }
          />
          <AuthField
            icon={<LockKeyhole color="#94A3B8" size={20} strokeWidth={2.2} />}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm new password"
            secureTextEntry={!isConfirmPasswordVisible}
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

        <Pressable
          onPress={handleResetPassword}
          disabled={isSubmitting}
          className={`mt-5 rounded-[18px] px-5 py-4 ${isSubmitting ? 'bg-orange-300' : 'bg-orange-500'}`}
          style={styles.buttonShadow}
        >
          <Text className="text-center text-[18px] font-extrabold text-white">
            {isSubmitting ? 'Resetting Password...' : 'Reset Password'}
          </Text>
        </Pressable>
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
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            className="flex-1"
            contentContainerClassName="flex-grow justify-center px-3 py-6"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* <Pressable
              onPress={() => router.back()}
              className="mb-6 h-12 w-12 items-center justify-center rounded-2xl bg-white/90"
              style={styles.iconShadow}
            >
              <MoveLeft size={22} color="#0C4A6E" strokeWidth={2.4} />
            </Pressable> */}

            <View className="items-center">
              <Text className="text-[28px] font-extrabold tracking-[0.2px] text-sky-950">
                Forgot Password
              </Text>
              <Text className="mt-3 max-w-[320px] text-center text-[18px] leading-7 text-sky-950/85">
                Reset your account password securely with mobile OTP verification
              </Text>
            </View>

            <View className="mt-8 rounded-[34px] bg-white/80 px-4 py-5" style={styles.cardShadow}>
              <View className="mb-5 flex-row items-center justify-center">
                <StepBadge label="1" isActive={step === 'mobile'} />
                <View className="mx-2 h-px w-10 bg-slate-300" />
                <StepBadge label="2" isActive={step === 'otp'} />
                <View className="mx-2 h-px w-10 bg-slate-300" />
                <StepBadge label="3" isActive={step === 'password'} />
              </View>

              {renderStepContent()}

              <View className="mt-6 h-px bg-slate-300/70" />

              <View className="mt-5 flex-row items-center justify-center">
                <Text className="text-[16px] text-slate-500">Remember your password? </Text>
                <Pressable onPress={() => router.replace('/login')}>
                  <Text className="text-[16px] font-bold text-sky-900">Login</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

function StepBadge({ label, isActive }: { label: string; isActive: boolean }) {
  return (
    <View
      className={`h-10 w-10 items-center justify-center rounded-2xl ${
        isActive ? 'bg-orange-500' : 'bg-slate-200'
      }`}
    >
      <Text className={`text-base font-extrabold ${isActive ? 'text-white' : 'text-slate-500'}`}>
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
  iconShadow: {
    elevation: 6,
    shadowColor: '#082F49',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
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
