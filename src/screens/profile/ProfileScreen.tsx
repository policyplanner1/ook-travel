import { useEffect, useState, type ComponentProps } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import {
  ArrowLeft,
  BadgeCheck,
  Camera,
  LogOut,
  Mail,
  Pencil,
  Phone,
  ShieldCheck,
  UserRound,
  X,
} from 'lucide-react-native';
import {
  Alert,
  Image,
  ImageBackground,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { saveBankDetails } from '@/services/bank-details.service';
import { editProfilePic, saveProfilePic } from '@/services/profile-pic.service';
import { useAuth } from '@/store/auth';
import type { AuthUser, BankDetails } from '@/types/auth';

const initialBankDetails: BankDetails = {
  accountHolderName: '',
  bankName: '',
  accountNumber: '',
  ifscCode: '',
  branchName: '',
  panCardNumber: '',
};

function hasAnyBankDetail(details: BankDetails | null | undefined) {
  if (!details) {
    return false;
  }

  return Object.values(details).some((value) => value.trim().length > 0);
}

export default function ProfileScreen() {
  const { logout, updateBankDetails, updateProfile, user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isBankDetailsModalVisible, setIsBankDetailsModalVisible] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [profileImageUri, setProfileImageUri] = useState<AuthUser['profileImageUri']>(null);
  const [bankDetails, setBankDetails] = useState<BankDetails>(initialBankDetails);
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('');
  const [selectedProfileImageFile, setSelectedProfileImageFile] = useState<{
    uri: string;
    name: string;
    type: string;
  } | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingBankDetails, setIsSavingBankDetails] = useState(false);

  useEffect(() => {
    if (!user) {
      return;
    }

    setFullName(user.fullName);
    setEmail(user.email);
    setPhone(user.phone);
    setProfileImageUri(user.profileImageUri);
    setSelectedProfileImageFile(null);
    setBankDetails(user.bankDetails ?? initialBankDetails);
    setConfirmAccountNumber(user.bankDetails?.accountNumber ?? '');
  }, [user]);

  function handleLogout() {
    Alert.alert('Logout', 'Do you want to logout from this dummy session?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          logout();
          router.replace('/login');
        },
      },
    ]);
  }

  async function handlePickPhoto() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        'Permission needed',
        'Please allow gallery access to upload a profile picture.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets.length) {
      return;
    }

    const asset = result.assets[0];
    const fileExtension = asset.uri.split('.').pop()?.toLowerCase();
    const fallbackExtension =
      fileExtension === 'png' || fileExtension === 'webp' ? fileExtension : 'jpg';
    const fileName = asset.fileName ?? `profile-pic-${Date.now()}.${fallbackExtension}`;
    const mimeType =
      asset.mimeType ??
      (fallbackExtension === 'png'
        ? 'image/png'
        : fallbackExtension === 'webp'
          ? 'image/webp'
          : 'image/jpeg');

    setProfileImageUri(asset.uri);
    setSelectedProfileImageFile({
      uri: asset.uri,
      name: fileName,
      type: mimeType,
    });
  }

  async function handleUpdateProfile() {
    if (!user) {
      return;
    }

    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      Alert.alert('Missing details', 'Please fill name, email, and phone before updating.');
      return;
    }

    try {
      setIsSavingProfile(true);

      let nextProfileImageUri = profileImageUri;

      if (selectedProfileImageFile) {
        const uploadProfilePic = user.profileImageUri ? editProfilePic : saveProfilePic;
        const uploadedProfilePic = await uploadProfilePic({
          agent_id: user.id,
          profile_pic: selectedProfileImageFile,
        });

        nextProfileImageUri = uploadedProfilePic.profileImageUri ?? selectedProfileImageFile.uri;
      }

      updateProfile({
        fullName,
        email,
        phone,
        profileImageUri: nextProfileImageUri,
      });
      setSelectedProfileImageFile(null);
      setIsEditing(false);
      setProfileImageUri(nextProfileImageUri);
      Alert.alert('Profile updated', 'Your profile details have been updated.');
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unable to update profile right now. Please try again.';

      Alert.alert('Update failed', message);
    } finally {
      setIsSavingProfile(false);
    }
  }

  function handleBankDetailChange<K extends keyof BankDetails>(key: K, value: BankDetails[K]) {
    const normalizedValue =
      key === 'accountNumber'
        ? String(value).replace(/\D/g, '')
        : key === 'ifscCode' || key === 'panCardNumber'
          ? String(value).toUpperCase()
          : String(value);

    setBankDetails((current) => ({
      ...current,
      [key]: normalizedValue as BankDetails[K],
    }));
  }

  function openBankDetailsModal() {
    setBankDetails(user?.bankDetails ?? initialBankDetails);
    setConfirmAccountNumber(user?.bankDetails?.accountNumber ?? '');
    setIsBankDetailsModalVisible(true);
  }

  function closeBankDetailsModal() {
    setIsBankDetailsModalVisible(false);
  }

  async function handleSaveBankDetails() {
    if (!user) {
      return;
    }

    const trimmedDetails = {
      accountHolderName: bankDetails.accountHolderName.trim(),
      bankName: bankDetails.bankName.trim(),
      accountNumber: bankDetails.accountNumber.trim(),
      ifscCode: bankDetails.ifscCode.trim().toUpperCase(),
      branchName: bankDetails.branchName.trim(),
      panCardNumber: bankDetails.panCardNumber.trim().toUpperCase(),
    };

    if (Object.values(trimmedDetails).some((value) => !value)) {
      Alert.alert('Missing details', 'Please fill all bank transfer and PAN card fields.');
      return;
    }

    if (trimmedDetails.accountNumber.length < 8) {
      Alert.alert('Invalid account number', 'Please enter a valid bank account number.');
      return;
    }

    if (trimmedDetails.accountNumber !== confirmAccountNumber.trim()) {
      Alert.alert('Account mismatch', 'Account number and confirm account number must match.');
      return;
    }

    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(trimmedDetails.ifscCode)) {
      Alert.alert('Invalid IFSC', 'Please enter a valid IFSC code.');
      return;
    }

    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(trimmedDetails.panCardNumber)) {
      Alert.alert('Invalid PAN', 'Please enter a valid PAN card number.');
      return;
    }

    try {
      setIsSavingBankDetails(true);
      const savedBankDetails = await saveBankDetails({
        agentId: user.id,
        bankDetails: trimmedDetails,
        isEdit: Boolean(user.bankDetails),
      });

      updateBankDetails(savedBankDetails);
      setIsBankDetailsModalVisible(false);
      Alert.alert('Bank details saved', 'Your payout details have been updated.');
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unable to save bank details right now. Please try again.';

      Alert.alert('Save failed', message);
    } finally {
      setIsSavingBankDetails(false);
    }
  }

  if (!user) {
    return null;
  }

  const displayedBankDetails = hasAnyBankDetail(user.bankDetails) ? user.bankDetails! : bankDetails;
  const hasBankDetails = hasAnyBankDetail(displayedBankDetails);

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
          contentContainerClassName="px-5 pb-16 pt-4"
          showsVerticalScrollIndicator={false}
        >
          <Pressable
            onPress={() => router.back()}
            className="h-12 w-12 items-center justify-center rounded-2xl bg-white/90"
            style={styles.iconShadow}
          >
            <ArrowLeft size={24} color="#0C4A6E" strokeWidth={2.4} />
          </Pressable>

          <View className="mt-5 rounded-[30px] bg-white/95 px-6 py-7" style={styles.cardShadow}>
            <View className="relative h-24 w-24">
              {profileImageUri ? (
                <Image
                  source={{ uri: profileImageUri }}
                  resizeMode="cover"
                  className="h-24 w-24 rounded-[30px]"
                />
              ) : (
                <View className="h-24 w-24 items-center justify-center rounded-[30px] bg-sky-100">
                  <UserRound size={40} color="#0C4A6E" strokeWidth={2.1} />
                </View>
              )}
              <Pressable
                onPress={handlePickPhoto}
                className="absolute bottom-0 right-0 h-10 w-10 items-center justify-center rounded-2xl bg-orange-500"
                style={styles.cameraShadow}
                disabled={isSavingProfile}
              >
                <Camera size={18} color="#FFFFFF" strokeWidth={2.2} />
              </Pressable>
            </View>

            <View className="mt-5 flex-row items-center justify-between">
              <View className="mr-4 flex-1">
                <Text className="text-3xl font-extrabold text-sky-950">{user.fullName}</Text>
                <Text className="mt-2 text-sm leading-6 text-slate-500">
                  View and manage your personal account information.
                </Text>
              </View>
            </View>

            {!isEditing ? (
              <>
                <View className="mt-6 gap-4">
                  <ProfileRow icon={Mail} label="Email" value={user.email} />
                  <ProfileRow icon={Phone} label="Phone" value={user.phone} />
                  <ProfileRow icon={BadgeCheck} label="ship MemberID" value={user.membershipId} />
                  <ProfileRow icon={ShieldCheck} label="Joined On" value={user.joinedOn} />
                </View>

                <Pressable
                  onPress={() => setIsEditing(true)}
                  className="mt-6 flex-row items-center justify-center rounded-[22px] bg-sky-100 px-5 py-4"
                >
                  <Pencil size={18} color="#0C4A6E" strokeWidth={2.3} />
                  <Text className="ml-2 text-base font-bold text-sky-900">Edit Profile</Text>
                </Pressable>
              </>
            ) : null}

            {isEditing ? (
              <View className="mt-6 rounded-[24px] bg-slate-50 px-4 py-4">
                <Text className="text-lg font-extrabold text-sky-950">Edit Profile</Text>
                <Text className="mt-2 text-sm leading-6 text-slate-500">
                  Update your profile details and upload a picture from your phone gallery.
                </Text>

                <View className="mt-4 gap-4">
                  <ProfileInput label="Full Name" value={fullName} onChangeText={setFullName} />
                  <ProfileInput
                    label="Email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  <ProfileInput
                    label="Phone"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                  />

                  <Pressable
                    onPress={handlePickPhoto}
                    className="rounded-[20px] border border-dashed border-orange-300 bg-orange-50 px-4 py-4"
                    disabled={isSavingProfile}
                  >
                    <Text className="text-sm font-bold text-orange-700">Upload Profile Pic</Text>
                    <Text className="mt-1 text-sm text-slate-600">
                      {selectedProfileImageFile
                        ? `Selected: ${selectedProfileImageFile.name}`
                        : 'Tap to choose an image from your mobile gallery.'}
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={handleUpdateProfile}
                    className="rounded-[22px] bg-orange-500 px-5 py-4"
                    style={styles.updateShadow}
                    disabled={isSavingProfile}
                  >
                    <Text className="text-center text-lg font-extrabold text-white">
                      {isSavingProfile ? 'Saving...' : 'Update Profile'}
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => setIsEditing(false)}
                    className="rounded-[22px] bg-sky-100 px-5 py-4"
                    disabled={isSavingProfile}
                  >
                    <Text className="text-center text-base font-bold text-sky-900">Close</Text>
                  </Pressable>
                </View>
              </View>
            ) : null}
          </View>

          <View className="mt-5 rounded-[30px] bg-white/95 px-6 py-6" style={styles.cardShadow}>
            <View>
              <Text className="text-lg font-extrabold text-sky-950">Bank Details</Text>
              {!hasBankDetails ? (
                <Text className="mt-1 text-sm text-slate-500">
                  Add your payout details.
                </Text>
              ) : null}
            </View>

            {hasBankDetails ? (
              <View className="mt-6 rounded-[22px] bg-slate-50 px-4 py-4">
                <Text className="text-base font-bold text-sky-950">Bank details added</Text>
                <View className="mt-4 gap-3">
                  <BankDetailRow
                    label="Account Holder"
                    value={displayedBankDetails.accountHolderName}
                  />
                  <BankDetailRow label="Bank Name" value={displayedBankDetails.bankName} />
                  <BankDetailRow
                    label="Account Number"
                    value={displayedBankDetails.accountNumber}
                  />
                  <BankDetailRow label="IFSC Code" value={displayedBankDetails.ifscCode} />
                  <BankDetailRow label="Branch Name" value={displayedBankDetails.branchName} />
                  <BankDetailRow
                    label="PAN Card Number"
                    value={displayedBankDetails.panCardNumber}
                  />
                </View>
              </View>
            ) : (
              <View className="mt-6 rounded-[22px] bg-slate-50 px-4 py-4">
                <Text className="text-base font-bold text-sky-950">No bank details added yet</Text>
              </View>
            )}

            <Pressable
              onPress={openBankDetailsModal}
              className={`mt-6 flex-row items-center justify-center rounded-[22px] px-5 py-4 ${
                hasBankDetails ? 'bg-sky-100' : 'bg-orange-500'
              }`}
              style={!hasBankDetails ? styles.updateShadow : undefined}
            >
              <Text
                className={`text-base font-bold ${
                  hasBankDetails ? 'text-sky-900' : 'text-white'
                }`}
              >
                {hasBankDetails ? 'Edit Details' : 'Add Bank Details'}
              </Text>
            </Pressable>
          </View>

          <View className="mt-5 rounded-[30px] bg-white/95 px-6 py-6" style={styles.cardShadow}>
            <Text className="text-lg font-extrabold text-sky-950">Account options</Text>
            <Text className="mt-2 text-sm leading-6 text-slate-500">
              Manage your account settings and securely sign out of your session.
            </Text>

            <Pressable
              onPress={handleLogout}
              className="mt-6 flex-row items-center justify-center rounded-[22px] bg-rose-500 px-5 py-4"
              style={styles.logoutShadow}
            >
              <LogOut size={20} color="#FFFFFF" strokeWidth={2.4} />
              <Text className="ml-2 text-lg font-extrabold text-white">Logout</Text>
            </Pressable>
          </View>
        </ScrollView>

        <Modal visible={isBankDetailsModalVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <Pressable style={styles.modalBackdrop} onPress={closeBankDetailsModal} />

            <View className="mx-5 max-h-[88%] overflow-hidden rounded-[30px] bg-white">
              <View className="flex-row items-start justify-between border-b border-slate-100 px-5 py-5">
                <View className="mr-4 flex-1">
                  <Text className="text-2xl font-extrabold text-sky-950">
                    {hasBankDetails ? 'Edit Bank Details' : 'Add Bank Details'}
                  </Text>
                  <Text className="mt-2 text-sm leading-6 text-slate-500">
                    Enter the payout account information and PAN card details.
                  </Text>
                </View>

                <Pressable
                  onPress={closeBankDetailsModal}
                  className="h-11 w-11 items-center justify-center rounded-2xl bg-slate-100"
                >
                  <X size={20} color="#0F172A" strokeWidth={2.3} />
                </Pressable>
              </View>

              <ScrollView
                className="max-h-[70%]"
                contentContainerClassName="px-5 pb-6 pt-5"
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <View className="gap-4">
                  <ProfileInput
                    label="Account Holder Name"
                    value={bankDetails.accountHolderName}
                    onChangeText={(value) => handleBankDetailChange('accountHolderName', value)}
                  />
                  <ProfileInput
                    label="Bank Name"
                    value={bankDetails.bankName}
                    onChangeText={(value) => handleBankDetailChange('bankName', value)}
                  />
                  <ProfileInput
                    label="Account Number"
                    value={bankDetails.accountNumber}
                    onChangeText={(value) => handleBankDetailChange('accountNumber', value)}
                    keyboardType="number-pad"
                  />
                  <ProfileInput
                    label="Confirm Account Number"
                    value={confirmAccountNumber}
                    onChangeText={(value) => setConfirmAccountNumber(value.replace(/\D/g, ''))}
                    keyboardType="number-pad"
                  />
                  <ProfileInput
                    label="IFSC Code"
                    value={bankDetails.ifscCode}
                    onChangeText={(value) => handleBankDetailChange('ifscCode', value)}
                    autoCapitalize="characters"
                  />
                  <ProfileInput
                    label="Branch Name"
                    value={bankDetails.branchName}
                    onChangeText={(value) => handleBankDetailChange('branchName', value)}
                  />
                  <ProfileInput
                    label="PAN Card Number"
                    value={bankDetails.panCardNumber}
                    onChangeText={(value) => handleBankDetailChange('panCardNumber', value)}
                    autoCapitalize="characters"
                  />
                </View>
              </ScrollView>

              <View className="border-t border-slate-100 px-5 py-5">
                <Pressable
                  onPress={handleSaveBankDetails}
                  className={`rounded-[22px] px-5 py-4 ${
                    isSavingBankDetails ? 'bg-orange-300' : 'bg-orange-500'
                  }`}
                  style={styles.updateShadow}
                  disabled={isSavingBankDetails}
                >
                  <Text className="text-center text-lg font-extrabold text-white">
                    {isSavingBankDetails
                      ? 'Saving...'
                      : hasBankDetails
                        ? 'Update Details'
                        : 'Save Details'}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </ImageBackground>
  );
}

function ProfileInput({
  label,
  ...props
}: ComponentProps<typeof TextInput> & { label: string }) {
  return (
    <View>
      <Text className="mb-2 text-sm font-bold text-slate-700">{label}</Text>
      <TextInput
        {...props}
        placeholderTextColor="#94A3B8"
        className="rounded-[20px] border border-sky-100 bg-white px-4 py-4 text-base text-slate-800"
      />
    </View>
  );
}

function ProfileRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
}) {
  return (
    <View className="flex-row items-center rounded-[22px] bg-slate-50 px-4 py-4">
      <View className="h-11 w-11 items-center justify-center rounded-2xl bg-orange-50">
        <Icon size={20} color="#EA580C" strokeWidth={2.2} />
      </View>
      <View className="ml-4 flex-1">
        <Text className="text-xs font-bold uppercase tracking-[1.2px] text-slate-400">{label}</Text>
        <Text className="mt-1 text-base font-semibold text-slate-700">{value}</Text>
      </View>
    </View>
  );
}

function BankDetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="rounded-[18px] bg-white px-4 py-3">
      <Text className="text-xs font-bold uppercase tracking-[1.2px] text-slate-400">{label}</Text>
      <Text className="mt-1 text-base font-semibold text-slate-700">{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    height: '100%',
    width: '100%',
  },
  cardShadow: {
    elevation: 10,
    shadowColor: '#1E6BA8',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
  },
  iconShadow: {
    elevation: 6,
    shadowColor: '#082F49',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
  },
  logoutShadow: {
    elevation: 6,
    shadowColor: '#BE123C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
  },
  updateShadow: {
    elevation: 6,
    shadowColor: '#B45309',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
  },
  cameraShadow: {
    elevation: 5,
    shadowColor: '#B45309',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(2, 6, 23, 0.6)',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
});
