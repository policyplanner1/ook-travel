import { Calendar, type DateData } from 'react-native-calendars';
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  MapPin,
  Minus,
  Plus,
  Users,
} from 'lucide-react-native';

import { travelerTypes } from '@/constants/quote';
import type {
  CustomerDetailsFormData,
  OpenPanel,
  TravelQuoteFormData,
  TravelerType,
} from '@/types/quote';
import { buildMarkedDates, formatDate, todayString } from '@/utils/date';

type Props = {
  form: CustomerDetailsFormData;
  travelForm: TravelQuoteFormData;
  onChange: <K extends keyof CustomerDetailsFormData>(key: K, value: CustomerDetailsFormData[K]) => void;
  cities: string[];
  openPanel: OpenPanel;
  onTogglePanel: (panel: Exclude<OpenPanel, null>) => void;
  onDestinationQueryChange: (value: string) => void;
  onSelectDestination: (city: string) => void;
  onDayPress: (day: DateData) => void;
  onChangeTraveller: (type: TravelerType, delta: number) => void;
  isFetchingCkyc?: boolean;
  hasAcceptedPrivacyPolicy: boolean;
  onTogglePrivacyPolicy: () => void;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  styles: { fieldShadow: object; buttonShadow: object };
};

function formatDateInput(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export function BulkQuoteStepTwo({
  form,
  travelForm,
  onChange,
  cities,
  openPanel,
  onTogglePanel,
  onDestinationQueryChange,
  onSelectDestination,
  onDayPress,
  onChangeTraveller,
  isFetchingCkyc,
  hasAcceptedPrivacyPolicy,
  onTogglePrivacyPolicy,
  onBack,
  onSubmit,
  isSubmitting,
  styles,
}: Props) {
  const totalTravellers = Object.values(travelForm.travellers).reduce((s, n) => s + n, 0);

  const dateSummary =
    travelForm.startDate && travelForm.endDate
      ? `${formatDate(travelForm.startDate)} – ${formatDate(travelForm.endDate)}`
      : travelForm.startDate
        ? `${formatDate(travelForm.startDate)} – Select return`
        : 'DD / MM / YYYY – DD / MM / YYYY';

  return (
    <>
      <Text className="mb-1 text-center text-3xl font-extrabold tracking-[1px] text-sky-950">
        Proposer Details
      </Text>
      <Text className="mb-5 text-center text-sm font-medium text-slate-500">
        Enter proposer details to get your premium quote.
      </Text>

      <View className="gap-3">
        {/* PAN */}
        <View>
          <Text className="mb-2 ml-1 text-sm font-bold text-sky-950">PAN Number</Text>
          <TextInput
            value={form.panNo}
            onChangeText={(v) => onChange('panNo', v.toUpperCase())}
            placeholder="ABCDE1234F"
            placeholderTextColor="#94A3B8"
            autoCapitalize="characters"
            maxLength={10}
            className="min-h-14 rounded-md bg-white px-4 py-4 text-base text-slate-700"
            style={styles.fieldShadow}
          />
        </View>

        {/* DOB */}
        <View>
          <Text className="mb-2 ml-1 text-sm font-bold text-sky-950">Date of Birth</Text>
          <TextInput
            value={form.dob}
            onChangeText={(v) => onChange('dob', formatDateInput(v))}
            placeholder="DD/MM/YYYY"
            placeholderTextColor="#94A3B8"
            keyboardType="numeric"
            maxLength={10}
            className="min-h-14 rounded-md bg-white px-4 py-4 text-base text-slate-700"
            style={styles.fieldShadow}
          />
        </View>

        {/* Phone */}
        <View>
          <Text className="mb-2 ml-1 text-sm font-bold text-sky-950">Phone Number</Text>
          <TextInput
            value={form.phone}
            onChangeText={(v) => onChange('phone', v.replace(/\D/g, '').slice(0, 10))}
            placeholder="10-digit mobile number"
            placeholderTextColor="#94A3B8"
            keyboardType="number-pad"
            maxLength={10}
            className="min-h-14 rounded-md bg-white px-4 py-4 text-base text-slate-700"
            style={styles.fieldShadow}
          />
          {isFetchingCkyc ? (
            <View className="mt-2 ml-1 flex-row items-center gap-2">
              <ActivityIndicator size="small" color="#0369A1" />
              <Text className="text-xs font-medium text-sky-700">Verifying CKYC details…</Text>
            </View>
          ) : null}
        </View>

        {/* Full Name */}
        <View>
          <Text className="mb-2 ml-1 text-sm font-bold text-sky-950">Full Name</Text>
          <TextInput
            value={form.name}
            onChangeText={(v) => onChange('name', v)}
            placeholder="Auto-filled from CKYC"
            placeholderTextColor="#94A3B8"
            className="min-h-14 rounded-md bg-white px-4 py-4 text-base text-slate-700"
            style={styles.fieldShadow}
          />
          {form.name && !isFetchingCkyc ? (
            <Text className="mt-2 ml-1 text-xs font-medium text-slate-400">
              Name auto-filled from CKYC — you can edit if needed.
            </Text>
          ) : null}
        </View>

        {/* Email */}
        <View>
          <Text className="mb-2 ml-1 text-sm font-bold text-sky-950">Email Address</Text>
          <TextInput
            value={form.email}
            onChangeText={(v) => onChange('email', v)}
            placeholder="example@email.com"
            placeholderTextColor="#94A3B8"
            keyboardType="email-address"
            autoCapitalize="none"
            className="min-h-14 rounded-md bg-white px-4 py-4 text-base text-slate-700"
            style={styles.fieldShadow}
          />
        </View>

        {/* Destination */}
        <View>
          <Text className="mb-2 ml-1 text-sm font-bold text-sky-950">Destination</Text>
          <Pressable
            className="min-h-14 flex-row items-center rounded-md bg-white px-4 py-4"
            style={styles.fieldShadow}
            onPress={() => onTogglePanel('destination')}
          >
            <MapPin size={20} color="#94A3B8" strokeWidth={2.2} />
            <Text
              className={`ml-3 flex-1 text-base ${
                travelForm.selectedDestination ? 'text-slate-700' : 'text-slate-400'
              }`}
            >
              {travelForm.selectedDestination || 'Select Your Destination'}
            </Text>
            {openPanel === 'destination' ? (
              <ChevronUp size={20} color="#64748B" />
            ) : (
              <ChevronDown size={20} color="#64748B" />
            )}
          </Pressable>

          {openPanel === 'destination' ? (
            <View className="mt-2 rounded-md bg-white p-4" style={styles.fieldShadow}>
              <TextInput
                value={travelForm.destinationQuery}
                onChangeText={onDestinationQueryChange}
                placeholder="Type a city name"
                placeholderTextColor="#94A3B8"
                className="rounded-xl border border-slate-200 px-4 py-3 text-base text-slate-700"
              />
              <View className="mt-3 gap-2">
                {(() => {
                  const query = travelForm.destinationQuery.trim();
                  const hasExactMatch = cities.some(
                    (city) => city.toLowerCase() === query.toLowerCase()
                  );

                  return query && !hasExactMatch ? (
                    <Pressable
                      onPress={() => onSelectDestination(query)}
                      className="rounded-xl border border-dashed border-orange-300 bg-orange-50 px-4 py-3"
                    >
                      <Text className="text-base font-semibold text-orange-700">
                        Use "{query}"
                      </Text>
                    </Pressable>
                  ) : null;
                })()}
                {cities.slice(0, 6).map((city) => (
                  <Pressable
                    key={city}
                    onPress={() => onSelectDestination(city)}
                    className="rounded-xl bg-slate-50 px-4 py-3"
                  >
                    <Text className="text-base font-semibold text-slate-700">{city}</Text>
                  </Pressable>
                ))}
                {cities.length === 0 && !travelForm.destinationQuery.trim() ? (
                  <Text className="px-1 py-2 text-sm text-slate-500">No matching cities found.</Text>
                ) : null}
              </View>
            </View>
          ) : null}
        </View>

        {/* Travel Dates */}
        <View>
          <Text className="mb-2 ml-1 text-sm font-bold text-sky-950">Travel Dates</Text>
          <Pressable
            className="min-h-14 flex-row items-center rounded-md bg-white px-4 py-4"
            style={styles.fieldShadow}
            onPress={() => onTogglePanel('dates')}
          >
            <CalendarDays size={20} color="#94A3B8" strokeWidth={2.2} />
            <Text
              className={`ml-3 flex-1 text-base ${
                travelForm.startDate ? 'text-slate-700' : 'text-slate-400'
              }`}
            >
              {dateSummary}
            </Text>
            {openPanel === 'dates' ? (
              <ChevronUp size={20} color="#64748B" />
            ) : (
              <ChevronDown size={20} color="#64748B" />
            )}
          </Pressable>

          {openPanel === 'dates' ? (
            <View className="mt-2 overflow-hidden rounded-md bg-white p-3" style={styles.fieldShadow}>
              <Calendar
                markingType="period"
                markedDates={buildMarkedDates(travelForm.startDate, travelForm.endDate)}
                onDayPress={onDayPress}
                minDate={todayString()}
                renderArrow={(direction) =>
                  direction === 'left' ? (
                    <ChevronLeft size={20} color="#0C4A6E" strokeWidth={2.4} />
                  ) : (
                    <ChevronRight size={20} color="#0C4A6E" strokeWidth={2.4} />
                  )
                }
                theme={{
                  todayTextColor: '#1D4ED8',
                  arrowColor: '#0C4A6E',
                  monthTextColor: '#0C4A6E',
                  textMonthFontWeight: '700',
                  textDayHeaderFontWeight: '600',
                  textSectionTitleColor: '#64748B',
                }}
              />
              <View className="mt-3 flex-row items-center justify-between rounded-md bg-slate-50 px-4 py-3">
                <Text className="text-sm font-semibold text-slate-600">
                  {travelForm.startDate ? formatDate(travelForm.startDate) : 'Departure'}
                </Text>
                <Text className="text-sm font-semibold text-slate-400">→</Text>
                <Text className="text-sm font-semibold text-slate-600">
                  {travelForm.endDate ? formatDate(travelForm.endDate) : 'Return'}
                </Text>
              </View>
            </View>
          ) : null}
        </View>

        {/* Number of Travellers */}
        <View>
          <Text className="mb-2 ml-1 text-sm font-bold text-sky-950">Number of Travellers</Text>
          <Pressable
            className="min-h-14 flex-row items-center rounded-md bg-white px-4 py-4"
            style={styles.fieldShadow}
            onPress={() => onTogglePanel('travelers')}
          >
            <Users size={20} color="#94A3B8" strokeWidth={2.2} />
            <Text className="ml-3 flex-1 text-base text-slate-700">
              {`${totalTravellers} Traveller${totalTravellers === 1 ? '' : 's'}`}
            </Text>
            {openPanel === 'travelers' ? (
              <ChevronUp size={20} color="#64748B" />
            ) : (
              <ChevronDown size={20} color="#64748B" />
            )}
          </Pressable>

          {openPanel === 'travelers' ? (
            <View className="mt-2 rounded-md bg-white px-4 py-2" style={styles.fieldShadow}>
              {travelerTypes.map((type) => (
                <View key={type} className="flex-row items-center justify-between py-3">
                  <Text className="text-base font-semibold text-slate-700">{type}</Text>
                  <View className="flex-row items-center gap-3">
                    <Pressable
                      className="h-9 w-9 items-center justify-center rounded-full bg-slate-100"
                      onPress={() => onChangeTraveller(type, -1)}
                    >
                      <Minus size={18} color="#0F172A" />
                    </Pressable>
                    <Text className="w-6 text-center text-lg font-bold text-slate-800">
                      {travelForm.travellers[type]}
                    </Text>
                    <Pressable
                      className="h-9 w-9 items-center justify-center rounded-full bg-sky-700"
                      onPress={() => onChangeTraveller(type, 1)}
                    >
                      <Plus size={18} color="#FFFFFF" />
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          ) : null}
        </View>
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

      <View className="mt-5 mb-10 flex-row gap-3">
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
            {isSubmitting ? 'Getting Quote…' : 'Get Quote'}
          </Text>
        </Pressable>
      </View>
    </>
  );
}
