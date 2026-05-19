import { Check, ChevronDown } from 'lucide-react-native';
import { useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import { Pressable, Text, TextInput, View } from 'react-native';

import { customerFieldConfig, genderOptions, maritalStatusOptions } from '@/constants/quote';
import type { CustomerDetailsFormData } from '@/types/quote';

type QuoteStepTwoProps = {
  form: CustomerDetailsFormData;
  onChange: <K extends keyof CustomerDetailsFormData>(key: K, value: CustomerDetailsFormData[K]) => void;
  isFetchingPincode?: boolean;
  isFetchingCkyc?: boolean;
  onFieldFocus?: (key: keyof CustomerDetailsFormData) => void;
  onFieldLayout?: (key: keyof CustomerDetailsFormData, y: number) => void;
  hasAcceptedPrivacyPolicy: boolean;
  onTogglePrivacyPolicy: () => void;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  styles: {
    fieldShadow: object;
    buttonShadow: object;
  };
};

function formatDateInput(value: string) {
  const digitsOnly = value.replace(/\D/g, '').slice(0, 8);

  if (digitsOnly.length <= 2) {
    return digitsOnly;
  }

  if (digitsOnly.length <= 4) {
    return `${digitsOnly.slice(0, 2)}/${digitsOnly.slice(2)}`;
  }

  return `${digitsOnly.slice(0, 2)}/${digitsOnly.slice(2, 4)}/${digitsOnly.slice(4)}`;
}

export function QuoteStepTwo({
  form,
  onChange,
  isFetchingPincode,
  isFetchingCkyc,
  onFieldFocus,
  onFieldLayout,
  hasAcceptedPrivacyPolicy,
  onTogglePrivacyPolicy,
  onBack,
  onSubmit,
  isSubmitting,
  styles,
}: QuoteStepTwoProps) {
  const [openDropdown, setOpenDropdown] = useState<'gender' | 'maritalStatus' | null>(null);

  function handleFieldLayout(key: keyof CustomerDetailsFormData, event: LayoutChangeEvent) {
    onFieldLayout?.(key, event.nativeEvent.layout.y);
  }

  function toggleDropdown(key: 'gender' | 'maritalStatus') {
    onFieldFocus?.(key);
    setOpenDropdown((current) => (current === key ? null : key));
  }

  function selectOption(key: 'gender' | 'maritalStatus', value: string) {
    onChange(key, value);
    setOpenDropdown(null);
  }

  return (
    <>
      <Text className="mb-1 text-center text-3xl font-extrabold tracking-[1px] text-sky-950">
        Traveller Details
      </Text>
      <Text className="mb-5 text-center text-sm font-medium text-slate-500">
        Fill in the details below to continue your quote request.
      </Text>

      <View className="gap-3">
        {customerFieldConfig.map((field) => (
          <View key={field.key} onLayout={(event) => handleFieldLayout(field.key, event)}>
            <Text className="mb-2 ml-1 text-sm font-bold text-sky-950">{field.label}</Text>
            {field.key === 'gender' || field.key === 'maritalStatus' ? (
              <>
                {(() => {
                  const dropdownKey = field.key;
                  const options = dropdownKey === 'gender' ? genderOptions : maritalStatusOptions;

                  return (
                    <>
                      <Pressable
                        onPress={() => toggleDropdown(dropdownKey)}
                        className="min-h-14 flex-row items-center justify-between rounded-md bg-white px-4 py-4"
                        style={styles.fieldShadow}
                      >
                        <Text
                          className={
                            form[dropdownKey] ? 'text-base text-slate-700' : 'text-base text-slate-400'
                          }
                        >
                          {form[dropdownKey] || field.placeholder}
                        </Text>
                        <ChevronDown size={20} color="#475569" strokeWidth={2.2} />
                      </Pressable>

                      {openDropdown === dropdownKey ? (
                        <View
                          className="mt-2 overflow-hidden rounded-xl border border-sky-100 bg-white"
                          style={styles.fieldShadow}
                        >
                          {options.map((option) => (
                            <Pressable
                              key={option}
                              className="flex-row items-center justify-between px-4 py-4"
                              onPress={() => selectOption(dropdownKey, option)}
                            >
                              <Text className="text-base font-medium text-slate-700">{option}</Text>
                              {form[dropdownKey] === option ? (
                                <Check size={18} color="#0C4A6E" strokeWidth={2.4} />
                              ) : null}
                            </Pressable>
                          ))}
                        </View>
                      ) : null}
                    </>
                  );
                })()}
              </>
            ) : (
              <TextInput
                value={form[field.key]}
                onChangeText={(value) =>
                  onChange(
                    field.key,
                    field.key === 'dob'
                      ? formatDateInput(value)
                      : field.key === 'panNo'
                        ? value.toUpperCase()
                        : value
                  )
                }
                onFocus={() => {
                  setOpenDropdown(null);
                  onFieldFocus?.(field.key);
                }}
                placeholder={field.placeholder}
                placeholderTextColor="#94A3B8"
                keyboardType={field.keyboardType ?? 'default'}
                autoCapitalize={field.autoCapitalize ?? 'sentences'}
                maxLength={field.key === 'dob' ? 10 : undefined}
                editable={field.key !== 'city' && field.key !== 'state'}
                className="min-h-14 rounded-md bg-white px-4 py-4 text-base text-slate-700"
                style={styles.fieldShadow}
              />
            )}
            {field.key === 'pinCode' && isFetchingPincode ? (
              <Text className="mt-2 ml-1 text-xs font-medium text-sky-700">
                Fetching city and state from PIN code...
              </Text>
            ) : null}
            {(field.key === 'phone') && isFetchingCkyc ? (
              <Text className="mt-2 ml-1 text-xs font-medium text-sky-700">
                Checking CKYC details and filling the name...
              </Text>
            ) : null}
          </View>
        ))}
      </View>

      <Pressable
        className="mt-5 flex-row items-start"
        onPress={onTogglePrivacyPolicy}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: hasAcceptedPrivacyPolicy }}
      >
        <View
          className={`mt-0.5 h-6 w-6 items-center justify-center rounded border ${
            hasAcceptedPrivacyPolicy ? 'border-sky-900 bg-sky-900' : 'border-slate-300 bg-white'
          }`}
        >
          {hasAcceptedPrivacyPolicy ? <Check size={16} color="#FFFFFF" strokeWidth={3} /> : null}
        </View>
        <Text className="ml-3 flex-1 text-sm font-medium leading-6 text-slate-600">
          I agree to the data Privacy policy. I want to get my quote and policy details.
        </Text>
      </Pressable>

      <View className="mt-5 flex-row gap-3 mb-10">
        <Pressable
          className="h-14 flex-1 items-center justify-center rounded-lg bg-slate-200"
          onPress={onBack}
        >
          <Text className="text-lg font-bold text-slate-700">Back</Text>
        </Pressable>

        <Pressable
          className={`h-14 flex-1 items-center justify-center rounded-lg ${
            hasAcceptedPrivacyPolicy && !isSubmitting ? 'bg-orange-500' : 'bg-orange-300'
          }`}
          style={styles.buttonShadow}
          onPress={onSubmit}
          disabled={isSubmitting || !hasAcceptedPrivacyPolicy}
        >
          <Text className="text-lg font-extrabold text-white">
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Text>
        </Pressable>
      </View>
    </>
  );
}
