import * as DocumentPicker from 'expo-document-picker';
import { router } from 'expo-router';
import { FileText, Power, Upload, X } from 'lucide-react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  type AlertButton,
  Image,
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { DateData } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BulkQuoteStepTwo, type BulkFormOpenPanel, type BulkTravelForm } from '@/components/forms/BulkQuoteStepTwo';
import { QuoteStepOne } from '@/components/forms/QuoteStepOne';
import { QuoteStepTwo } from '@/components/forms/QuoteStepTwo';
import { benefits, cities } from '@/constants/quote';
import { fetchCkycDetails } from '@/services/ckyc.service';
import { fetchCityStateByPincode } from '@/services/pincode.service';
import { submitBulkInsuranceUpload } from '@/services/policy.service';
import { submitQuote } from '@/services/quote.service';
import { useAuth } from '@/store/auth';
import { setLatestQuoteResult } from '@/store/quote-result';
import type { CkycLookupResponse, CustomerDetailsFormData, OpenPanel, TravelQuoteFormData, TravelerType } from '@/types/quote';

type InsuranceRequestType = 'individual' | 'bulk';

type BulkUploadDocument = {
  name: string;
  uri: string;
  size: number | null;
  mimeType: string | null;
};

const initialTravelForm: TravelQuoteFormData = {
  destinationQuery: '',
  selectedDestination: '',
  startDate: null,
  endDate: null,
  travellers: {
    Adults: 1,
    Children: 0,
    Seniors: 0,
  },
};

const initialCustomerForm: CustomerDetailsFormData = {
  panNo: '',
  dob: '',
  phone: '',
  name: '',
  email: '',
  gender: '',
  pinCode: '',
  streetName: '',
  city: '',
  state: '',
  maritalStatus: '',
  nomineeName: '',
};

const initialBulkForm: BulkTravelForm = {
  startDate: null,
  endDate: null,
  name: '',
  email: '',
  phone: '',
  travellers: { Adults: 1, Children: 0, Seniors: 0 },
};

const allowedBulkDocumentTypes = [
  'application/pdf',
  'text/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

const allowedBulkDocumentExtensions = ['pdf', 'csv', 'xls', 'xlsx', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'webp'];

export default function HomeScreen() {
  const { logout, user } = useAuth();
  const scrollViewRef = useRef<ScrollView>(null);
  const fieldPositionsRef = useRef<Partial<Record<keyof CustomerDetailsFormData, number>>>({});
  const [step, setStep] = useState<1 | 2>(1);
  const [insuranceRequestType, setInsuranceRequestType] = useState<InsuranceRequestType>('individual');
  const [openPanel, setOpenPanel] = useState<OpenPanel>(null);
  const [travelForm, setTravelForm] = useState<TravelQuoteFormData>(initialTravelForm);
  const [customerForm, setCustomerForm] = useState<CustomerDetailsFormData>(initialCustomerForm);
  const [bulkDocument, setBulkDocument] = useState<BulkUploadDocument | null>(null);
  const [bulkForm, setBulkForm] = useState<BulkTravelForm>(initialBulkForm);
  const [openBulkPanel, setOpenBulkPanel] = useState<BulkFormOpenPanel>(null);
  const [ckycData, setCkycData] = useState<CkycLookupResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPickingBulkDocument, setIsPickingBulkDocument] = useState(false);
  const [isFetchingPincode, setIsFetchingPincode] = useState(false);
  const [isFetchingCkyc, setIsFetchingCkyc] = useState(false);
  const [hasAcceptedPrivacyPolicy, setHasAcceptedPrivacyPolicy] = useState(false);
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const pincodeLookupRef = useRef(0);
  const ckycLookupRef = useRef(0);
  const lastCkycLookupKeyRef = useRef('');

  const filteredCities = useMemo(() => {
    const query = travelForm.destinationQuery.trim().toLowerCase();
    if (!query) {
      return cities;
    }

    return cities.filter((city) => city.toLowerCase().includes(query));
  }, [travelForm.destinationQuery]);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSubscription = Keyboard.addListener(showEvent, () => {
      setKeyboardOffset(320);
    });

    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      setKeyboardOffset(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  function togglePanel(panel: Exclude<OpenPanel, null>) {
    setOpenPanel((current) => (current === panel ? null : panel));
  }

  function selectDestination(city: string) {
    setTravelForm((current) => ({
      ...current,
      selectedDestination: city,
      destinationQuery: city,
    }));
    setOpenPanel(null);
  }

  function onDayPress(day: DateData) {
    const selected = day.dateString;

    setTravelForm((current) => {
      if (!current.startDate) {
        return { ...current, startDate: selected, endDate: selected };
      }

      if (
        current.endDate &&
        current.startDate === current.endDate &&
        selected > current.startDate
      ) {
        return { ...current, endDate: selected };
      }

      if (selected < current.startDate) {
        return { ...current, startDate: selected, endDate: selected };
      }

      if (!current.endDate || selected >= current.startDate) {
        return { ...current, endDate: selected };
      }

      return { ...current, startDate: selected, endDate: selected };
    });
  }

  function changeTraveller(type: TravelerType, delta: number) {
    setTravelForm((current) => ({
      ...current,
      travellers: {
        ...current.travellers,
        [type]: Math.max(type === 'Adults' ? 1 : 0, current.travellers[type] + delta),
      },
    }));
  }

  function handleInsuranceRequestTypeChange(nextType: InsuranceRequestType) {
    setInsuranceRequestType(nextType);
    setStep(1);
    setOpenPanel(null);
    setOpenBulkPanel(null);
    setHasAcceptedPrivacyPolicy(false);
    setCkycData(null);

    if (nextType === 'individual') {
      setBulkDocument(null);
      setBulkForm(initialBulkForm);
      return;
    }

    setCustomerForm(initialCustomerForm);
  }

  function toggleBulkPanel(panel: Exclude<BulkFormOpenPanel, null>) {
    setOpenBulkPanel((current) => (current === panel ? null : panel));
  }

  function onBulkDayPress(day: import('react-native-calendars').DateData) {
    const selected = day.dateString;
    setBulkForm((current) => {
      if (!current.startDate) {
        return { ...current, startDate: selected, endDate: selected };
      }
      if (current.endDate && current.startDate === current.endDate && selected > current.startDate) {
        return { ...current, endDate: selected };
      }
      if (selected < current.startDate) {
        return { ...current, startDate: selected, endDate: selected };
      }
      if (!current.endDate || selected >= current.startDate) {
        return { ...current, endDate: selected };
      }
      return { ...current, startDate: selected, endDate: selected };
    });
  }

  function onBulkChangeTraveller(type: import('@/types/quote').TravelerType, delta: number) {
    setBulkForm((current) => ({
      ...current,
      travellers: {
        ...current.travellers,
        [type]: Math.max(type === 'Adults' ? 1 : 0, current.travellers[type] + delta),
      },
    }));
  }

  function handleBulkGoToStep2() {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    setStep(2);
  }

  function goToDetailsStep() {
    // if (!travelForm.selectedDestination || !travelForm.startDate || !travelForm.endDate) {
    //   Alert.alert('Missing details', 'Please select destination and travel dates before continuing.');
    //   return;
    // }

        if (!travelForm.startDate || !travelForm.endDate) {
      Alert.alert('Missing details', 'Please select travel dates before continuing.');
      return;
    }

    setOpenPanel(null);
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    setStep(2);
  }

  async function handlePickBulkDocument() {
    try {
      setIsPickingBulkDocument(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: allowedBulkDocumentTypes,
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled || !result.assets.length) {
        return;
      }

      const selectedFile = result.assets[0];

      const selectedFileName = selectedFile.name ?? 'bulk-upload-file';

      if (!isAllowedBulkDocument(selectedFileName, selectedFile.mimeType ?? null)) {
        Alert.alert(
          'Unsupported file',
          'Please upload a PDF, CSV, Excel, Word document, or image for bulk insurance.'
        );
        return;
      }

      setBulkDocument({
        name: selectedFileName,
        uri: selectedFile.uri,
        size: selectedFile.size ?? null,
        mimeType: selectedFile.mimeType ?? null,
      });
    } catch (error) {
      Alert.alert('Upload failed', 'Unable to pick the document right now. Please try again.');
    } finally {
      setIsPickingBulkDocument(false);
    }
  }

  function removeBulkDocument() {
    setBulkDocument(null);
  }

  function handleBenefitPress(label: string) {
    if (label === 'My Business') {
      router.navigate('/my-policies');
      return;
    }

    if (label === 'My Earnings') {
      router.navigate('/my-commission');
    }
  }

  function handleFieldLayout(key: keyof CustomerDetailsFormData, y: number) {
    fieldPositionsRef.current[key] = y;
  }

  function handleFieldFocus(key: keyof CustomerDetailsFormData) {
    const y = fieldPositionsRef.current[key];

    if (typeof y !== 'number') {
      return;
    }

    setTimeout(() => {
      const needsExtraLift = key === 'maritalStatus' || key === 'nomineeName';

      scrollViewRef.current?.scrollTo({
        y: Math.max(0, y - (needsExtraLift ? 310 : 150)),
        animated: true,
      });
    }, 150);
  }

  async function handleCustomerChange<K extends keyof CustomerDetailsFormData>(
    key: K,
    value: CustomerDetailsFormData[K]
  ) {
    const normalizedValue =
      key === 'panNo' ? String(value).toUpperCase() : String(value);

    setCustomerForm((current) => ({ ...current, [key]: normalizedValue as CustomerDetailsFormData[K] }));

    if (key === 'panNo' || key === 'dob' || key === 'phone') {
      const nextForm = {
        ...customerForm,
        [key]: normalizedValue,
      };
      const panNo = nextForm.panNo.trim().toUpperCase();
      const dob = nextForm.dob.trim();
      const phone = nextForm.phone.trim().replace(/\D/g, '');
      const hasValidDob = /^\d{2}\/\d{2}\/\d{4}$/.test(dob);
      const hasValidPhone = phone.length === 10;
      const lookupKey = `${panNo}|${dob}|${phone}`;

      if (!panNo || !hasValidDob || !hasValidPhone) {
        ckycLookupRef.current += 1;
        lastCkycLookupKeyRef.current = '';
        setIsFetchingCkyc(false);
        setCkycData(null);

        if (key === 'panNo' && !panNo) {
          setCustomerForm((current) => ({ ...current, name: '' }));
        }
      } else if (lastCkycLookupKeyRef.current !== lookupKey) {
        const requestId = ckycLookupRef.current + 1;
        ckycLookupRef.current = requestId;
        setIsFetchingCkyc(true);

        try {
          const response = await fetchCkycDetails({
            docNumber: panNo,
            dob,
            phone,
          });

          if (ckycLookupRef.current !== requestId) {
            return;
          }

          lastCkycLookupKeyRef.current = lookupKey;
          setCkycData(response);

          setCustomerForm((current) => ({
            ...current,
            panNo,
            dob,
            phone,
            name: response.ckycResponse.fullName?.trim() || current.name,
          }));
        } catch (error) {
          if (ckycLookupRef.current !== requestId) {
            return;
          }

          lastCkycLookupKeyRef.current = '';
          setCkycData(null);
          setCustomerForm((current) => ({
            ...current,
            panNo,
            dob,
            phone,
            name: current.name,
          }));
        } finally {
          if (ckycLookupRef.current === requestId) {
            setIsFetchingCkyc(false);
          }
        }
      }
    }

    if (key !== 'pinCode') {
      return;
    }

    const pinCode = String(value).replace(/\D/g, '').slice(0, 6);

    setCustomerForm((current) => ({
      ...current,
      pinCode,
      city: pinCode.length === 6 ? current.city : '',
      state: pinCode.length === 6 ? current.state : '',
    }));

    if (pinCode.length !== 6) {
      setIsFetchingPincode(false);
      return;
    }

    const requestId = pincodeLookupRef.current + 1;
    pincodeLookupRef.current = requestId;
    setIsFetchingPincode(true);

    try {
      const location = await fetchCityStateByPincode(pinCode);

      if (pincodeLookupRef.current !== requestId) {
        return;
      }

      setCustomerForm((current) => ({
        ...current,
        pinCode,
        city: location.city,
        state: location.state,
      }));
    } catch (error) {
      if (pincodeLookupRef.current !== requestId) {
        return;
      }

      setCustomerForm((current) => ({
        ...current,
        pinCode,
        city: '',
        state: '',
      }));
    } finally {
      if (pincodeLookupRef.current === requestId) {
        setIsFetchingPincode(false);
      }
    }
  }

  async function handleSubmit() {
    if (!hasAcceptedPrivacyPolicy) {
      Alert.alert('Consent required', 'Please accept the data Privacy policy before submitting.');
      return;
    }

    const hasEmptyField = Object.values(customerForm).some((value) => !value.trim());

    if (hasEmptyField) {
      Alert.alert('Incomplete form', 'Please fill all traveller details before submitting.');
      return;
    }

    if (isFetchingCkyc) {
      Alert.alert('Please wait', 'CKYC verification is in progress. Please wait before submitting.');
      return;
    }

    if (!ckycData) {
      Alert.alert('Verification required', 'CKYC verification failed or is incomplete. Please check your PAN, DOB, and phone number.');
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await submitQuote({ ...travelForm, ...customerForm }, ckycData);
      setLatestQuoteResult(response);

      setStep(1);
      setOpenPanel(null);
      setTravelForm(initialTravelForm);
      setCustomerForm(initialCustomerForm);
      setCkycData(null);
      setHasAcceptedPrivacyPolicy(false);
      router.push('/quote');
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unable to submit the quote right now. Please try again.';

      const buttons: AlertButton[] = [{ text: 'OK' }];

      Alert.alert('Submission failed', message, buttons);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleBulkSubmit() {
    if (!bulkDocument) {
      Alert.alert('Document required', 'Please upload a bulk insurance document before submitting.');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await submitBulkInsuranceUpload({
        agent_id: user?.id,
        file: {
          uri: bulkDocument.uri,
          name: bulkDocument.name,
          type: bulkDocument.mimeType ?? getMimeTypeFromFileName(bulkDocument.name),
        },
      });

      Alert.alert(
        'Bulk request submitted',
        typeof response.message === 'string' && response.message.trim()
          ? response.message
          : 'The file and agent details were sent successfully.'
      );

      setBulkDocument(null);
      setOpenPanel(null);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleLogout() {
    Alert.alert('Logout', 'Do you want to logout from this session?', [
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
          keyboardVerticalOffset={Platform.OS === 'ios' ? 16 : 0}
        >
          <View className="absolute left-5 top-8 z-10">
            <Pressable
              onPress={handleLogout}
              className="h-12 w-12 items-center justify-center rounded-2xl "
              
            >
              <Power size={22} color="#d1001f" strokeWidth={2.4} />
            </Pressable>
          </View>

          <ScrollView
            ref={scrollViewRef}
            className="flex-1"
            contentContainerClassName={step === 1 ? 'px-5 pb-5 pt-8' : 'px-5 pt-8 pb-20'}
            contentContainerStyle={step === 2 ? { paddingBottom: 32 + keyboardOffset } : undefined}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {step === 1 ? (
              <>
                <View className="items-center">
                  <Image
                    source={require('../../../assets/images/ooktravel.png')}
                    resizeMode="contain"
                    className="mb-4 h-20 w-52"
                  />
                  <Text className="text-3xl font-semibold tracking-[2px] text-sky-950">Book Your</Text>
                  <Text
                    className="mt-2 text-center text-6xl font-extrabold leading-[54px] tracking-[2px] text-white"
                    style={styles.titleShadow}
                  >
                    TRAVEL
                  </Text>
                  <Text
                    className="text-center text-6xl font-extrabold leading-[54px] tracking-[2px] text-white"
                    style={styles.titleShadow}
                  >
                    INSURANCE
                  </Text>
                </View>

                <View className="mt-4 flex-row items-start justify-center">
                  {benefits.map((benefit, index) => (
                    <View key={benefit.icon} className="flex-row items-start">
                      <Pressable
                        className="w-36 items-center"
                        onPress={() => handleBenefitPress(benefit.label)}
                      >
                        <Image source={benefit.source} resizeMode="contain" className="h-24 w-24" />
                        <Text className="mt-2 text-center text-base font-extrabold leading-5 tracking-normal text-sky-950">
                          {benefit.label}
                        </Text>
                      </Pressable>

                      {index < benefits.length - 1 ? (
                        <View className="mx-1 mt-5 h-24 w-px bg-sky-900/20" />
                      ) : null}
                    </View>
                  ))}
                </View>
              </>
            ) : null}

            <View className={step === 1 ? 'my-14' : 'my-20'}>
              <View
                className="w-full max-w-[450px] self-center rounded-[28px] bg-slate-50/95 px-6 pb-6 pt-5"
                style={styles.cardShadow}
              >
                {step === 1 ? (
                  <View className="mb-5">
                    <Text className="mb-3 text-center text-sm font-bold uppercase tracking-[1.4px] text-sky-800">
                      Select Insurance Type
                    </Text>
                    <View className="flex-row rounded-2xl bg-sky-100 p-1">
                      {(['individual', 'bulk'] as InsuranceRequestType[]).map((type) => {
                        const isActive = insuranceRequestType === type;

                        return (
                          <Pressable
                            key={type}
                            onPress={() => handleInsuranceRequestTypeChange(type)}
                            className={`flex-1 rounded-2xl px-4 py-3 ${
                              isActive ? 'bg-sky-900' : 'bg-transparent'
                            }`}
                          >
                            <Text
                              className={`text-center text-base font-extrabold capitalize ${
                                isActive ? 'text-white' : 'text-sky-900'
                              }`}
                            >
                              {type}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                ) : null}

                {step === 1 ? (
                  insuranceRequestType === 'individual' ? (
                    <QuoteStepOne
                      cities={filteredCities}
                      form={travelForm}
                      openPanel={openPanel}
                      onTogglePanel={togglePanel}
                      onDestinationQueryChange={(value) =>
                        setTravelForm((current) => ({ ...current, destinationQuery: value }))
                      }
                      onSelectDestination={selectDestination}
                      onDayPress={onDayPress}
                      onChangeTraveller={changeTraveller}
                      styles={{ fieldShadow: styles.fieldShadow, buttonShadow: styles.buttonShadow }}
                      onNext={goToDetailsStep}
                    />
                  ) : (
                    <>
                      <View className="rounded-3xl border border-dashed border-orange-300 bg-orange-50 px-4 py-4">
                        <View className="flex-row items-start">
                          <View className="mr-3 mt-1 h-11 w-11 items-center justify-center rounded-2xl bg-white">
                            <Upload size={22} color="#EA580C" strokeWidth={2.3} />
                          </View>
                          <View className="flex-1">
                            <Text className="text-lg font-extrabold text-sky-950">
                              Upload Bulk Insurance File
                            </Text>
                            <Text className="mt-1 text-sm leading-6 text-slate-600">
                              Upload one file with traveller details. Supported formats: PDF, CSV,
                              Excel, Word, and images.
                            </Text>
                          </View>
                        </View>

                        <Pressable
                          onPress={handlePickBulkDocument}
                          className="mt-4 rounded-2xl bg-orange-500 px-4 py-4"
                          style={styles.buttonShadow}
                          disabled={isPickingBulkDocument}
                        >
                          <Text className="text-center text-base font-extrabold text-white">
                            {isPickingBulkDocument
                              ? 'Opening files...'
                              : bulkDocument
                                ? 'Replace Document'
                                : 'Choose Document'}
                          </Text>
                        </Pressable>

                        {bulkDocument ? (
                          <View className="mt-4 rounded-2xl bg-white px-4 py-4" style={styles.fieldShadow}>
                            <View className="flex-row items-start">
                              <View className="mr-3 mt-0.5 h-10 w-10 items-center justify-center rounded-2xl bg-sky-100">
                                <FileText size={20} color="#0C4A6E" strokeWidth={2.2} />
                              </View>
                              <View className="flex-1">
                                <Text className="text-base font-bold text-slate-800">
                                  {bulkDocument.name}
                                </Text>
                                <Text className="mt-1 text-sm text-slate-500">
                                  {formatFileSize(bulkDocument.size)}
                                </Text>
                              </View>
                              <Pressable
                                onPress={removeBulkDocument}
                                className="ml-3 h-9 w-9 items-center justify-center rounded-full bg-slate-100"
                              >
                                <X size={18} color="#475569" strokeWidth={2.4} />
                              </Pressable>
                            </View>
                          </View>
                        ) : (
                          <Text className="mt-3 text-sm font-medium text-slate-500">
                            No file selected yet.
                          </Text>
                        )}

                        <Pressable
                          className="mt-5 h-14 items-center justify-center rounded-2xl bg-orange-500"
                          style={styles.buttonShadow}
                          onPress={handleBulkGoToStep2}
                        >
                          <Text className="text-lg font-extrabold text-white">Next</Text>
                        </Pressable>
                      </View>
                    </>
                  )
                ) : insuranceRequestType === 'bulk' ? (
                  <BulkQuoteStepTwo
                    form={bulkForm}
                    openPanel={openBulkPanel}
                    onTogglePanel={toggleBulkPanel}
                    onDayPress={onBulkDayPress}
                    onChangeTraveller={onBulkChangeTraveller}
                    onChangeName={(value) => setBulkForm((c) => ({ ...c, name: value }))}
                    onChangeEmail={(value) => setBulkForm((c) => ({ ...c, email: value }))}
                    onChangePhone={(value) =>
                      setBulkForm((c) => ({ ...c, phone: value.replace(/\D/g, '').slice(0, 10) }))
                    }
                    onBack={() => setStep(1)}
                    onSubmit={handleBulkSubmit}
                    isSubmitting={isSubmitting}
                    styles={{ fieldShadow: styles.fieldShadow, buttonShadow: styles.buttonShadow }}
                  />
                ) : (
                  <QuoteStepTwo
                    form={customerForm}
                    onChange={handleCustomerChange}
                    isFetchingPincode={isFetchingPincode}
                    isFetchingCkyc={isFetchingCkyc}
                    onFieldFocus={handleFieldFocus}
                    onFieldLayout={handleFieldLayout}
                    hasAcceptedPrivacyPolicy={hasAcceptedPrivacyPolicy}
                    onTogglePrivacyPolicy={() =>
                      setHasAcceptedPrivacyPolicy((current) => !current)
                    }
                    onBack={() => setStep(1)}
                    onSubmit={handleSubmit}
                    isSubmitting={isSubmitting}
                    styles={{ fieldShadow: styles.fieldShadow, buttonShadow: styles.buttonShadow }}
                  />
                )}

                {/* {step === 1 ? (
                  <>
                    <View className="mt-5 h-px w-full bg-sky-100" />

                    <View className="w-full flex-row items-center justify-center pt-4">
                      <View className="min-w-36 flex-row items-center justify-center">
                        <FileText
                          size={24}
                          color="#0C4A6E"
                          strokeWidth={2.2}
                          style={styles.inlineIcon}
                        />
                        <Text className="text-lg font-bold tracking-normal text-sky-900 underline">
                          Policy Details
                        </Text>
                      </View>

                      <View className="mx-4 h-8 w-px bg-sky-200" />

                      <View className="min-w-36 flex-row items-center justify-center">
                        <CircleHelp
                          size={24}
                          color="#0C4A6E"
                          strokeWidth={2.2}
                          style={styles.inlineIcon}
                        />
                        <Text className="text-lg font-bold tracking-normal text-sky-900 underline">
                          24/7 Support
                        </Text>
                      </View>
                    </View>
                  </>
                ) : null} */}
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

function isAllowedBulkDocument(fileName: string, mimeType: string | null) {
  const extension = fileName.split('.').pop()?.toLowerCase() ?? '';

  return (
    allowedBulkDocumentExtensions.includes(extension) ||
    (mimeType ? allowedBulkDocumentTypes.includes(mimeType) : false)
  );
}

function formatFileSize(size: number | null) {
  if (!size || size <= 0) {
    return 'File selected';
  }

  if (size < 1024 * 1024) {
    return `${Math.max(1, Math.round(size / 1024))} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function getMimeTypeFromFileName(fileName: string) {
  const extension = fileName.split('.').pop()?.toLowerCase() ?? '';

  switch (extension) {
    case 'pdf':
      return 'application/pdf';
    case 'csv':
      return 'text/csv';
    case 'xls':
      return 'application/vnd.ms-excel';
    case 'xlsx':
      return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    case 'doc':
      return 'application/msword';
    case 'docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    default:
      return 'application/octet-stream';
  }
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
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.24,
    shadowRadius: 20,
  },
  fieldShadow: {
    elevation: 3,
    shadowColor: '#68839B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
  },
  buttonShadow: {
    elevation: 5,
    shadowColor: '#B85800',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.26,
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
