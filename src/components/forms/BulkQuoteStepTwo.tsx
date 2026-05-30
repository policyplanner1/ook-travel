import { Calendar, type DateData } from 'react-native-calendars';
import { Pressable, Text, TextInput, View } from 'react-native';
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Mail,
  Minus,
  Phone,
  Plus,
  User,
  Users,
} from 'lucide-react-native';

import { travelerTypes } from '@/constants/quote';
import type { TravelerType } from '@/types/quote';
import { buildMarkedDates, formatDate, todayString } from '@/utils/date';

export type BulkTravelForm = {
  startDate: string | null;
  endDate: string | null;
  name: string;
  email: string;
  phone: string;
  travellers: { Adults: number; Children: number; Seniors: number };
};

export type BulkFormOpenPanel = 'dates' | 'travelers' | null;

type Props = {
  form: BulkTravelForm;
  openPanel: BulkFormOpenPanel;
  onTogglePanel: (panel: Exclude<BulkFormOpenPanel, null>) => void;
  onDayPress: (day: DateData) => void;
  onChangeTraveller: (type: TravelerType, delta: number) => void;
  onChangeName: (value: string) => void;
  onChangeEmail: (value: string) => void;
  onChangePhone: (value: string) => void;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  styles: { fieldShadow: object; buttonShadow: object };
};

export function BulkQuoteStepTwo({
  form,
  openPanel,
  onTogglePanel,
  onDayPress,
  onChangeTraveller,
  onChangeName,
  onChangeEmail,
  onChangePhone,
  onBack,
  onSubmit,
  isSubmitting,
  styles,
}: Props) {
  const totalTravellers = Object.values(form.travellers).reduce((sum, n) => sum + n, 0);
  const dateSummary =
    form.startDate && form.endDate
      ? `${formatDate(form.startDate)} - ${formatDate(form.endDate)}`
      : form.startDate
        ? `${formatDate(form.startDate)} - Select return`
        : 'DD / MM / YYYY - DD / MM / YYYY';

  return (
    <>
      <Text className="mb-5 text-center text-3xl font-extrabold tracking-[1px] text-sky-950">
        Bulk Quote
      </Text>

      <View className="w-full gap-3">
        {/* Travel Dates */}
        <View>
          <Pressable
            className="min-h-16 flex-row items-center rounded-md bg-white px-4 py-4"
            style={styles.fieldShadow}
            onPress={() => onTogglePanel('dates')}
          >
            <View className="mr-4 h-7 w-7 items-center justify-center">
              <CalendarDays size={24} color="#1D4ED8" strokeWidth={2.2} />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold tracking-[1px] text-slate-700">
                Travel Dates
              </Text>
              <Text className="mt-1 text-sm font-medium tracking-[0.5px] text-slate-500">
                {dateSummary}
              </Text>
            </View>
            {openPanel === 'dates' ? (
              <ChevronUp size={22} color="#64748B" />
            ) : (
              <ChevronDown size={22} color="#64748B" />
            )}
          </Pressable>

          {openPanel === 'dates' ? (
            <View
              className="mt-2 overflow-hidden rounded-2xl bg-white p-3"
              style={styles.fieldShadow}
            >
              <Calendar
                markingType="period"
                markedDates={buildMarkedDates(form.startDate, form.endDate)}
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
              <View className="mt-3 flex-row items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                <Text className="text-sm font-semibold text-slate-600">
                  {form.startDate ? formatDate(form.startDate) : 'Departure'}
                </Text>
                <Text className="text-sm font-semibold text-slate-400">to</Text>
                <Text className="text-sm font-semibold text-slate-600">
                  {form.endDate ? formatDate(form.endDate) : 'Return'}
                </Text>
              </View>
            </View>
          ) : null}
        </View>

        {/* Group Name */}
        <View
          className="min-h-16 flex-row items-center rounded-md bg-white px-4 py-4"
          style={styles.fieldShadow}
        >
          <View className="mr-4 h-7 w-7 items-center justify-center">
            <User size={24} color="#1D4ED8" strokeWidth={2.2} />
          </View>
          <TextInput
            className="flex-1 text-base font-semibold text-slate-700"
            placeholder="Group Name"
            placeholderTextColor="#94A3B8"
            value={form.name}
            onChangeText={onChangeName}
            autoCapitalize="words"
          />
        </View>

        {/* Email */}
        <View
          className="min-h-16 flex-row items-center rounded-md bg-white px-4 py-4"
          style={styles.fieldShadow}
        >
          <View className="mr-4 h-7 w-7 items-center justify-center">
            <Mail size={24} color="#1D4ED8" strokeWidth={2.2} />
          </View>
          <TextInput
            className="flex-1 text-base font-semibold text-slate-700"
            placeholder="Email Address"
            placeholderTextColor="#94A3B8"
            value={form.email}
            onChangeText={onChangeEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Phone */}
        <View
          className="min-h-16 flex-row items-center rounded-md bg-white px-4 py-4"
          style={styles.fieldShadow}
        >
          <View className="mr-4 h-7 w-7 items-center justify-center">
            <Phone size={24} color="#1D4ED8" strokeWidth={2.2} />
          </View>
          <TextInput
            className="flex-1 text-base font-semibold text-slate-700"
            placeholder="Phone Number"
            placeholderTextColor="#94A3B8"
            value={form.phone}
            onChangeText={onChangePhone}
            keyboardType="phone-pad"
            maxLength={10}
          />
        </View>

        {/* Number of Travelers */}
        <View>
          <Pressable
            className="min-h-16 flex-row items-center rounded-md bg-white px-4 py-4"
            style={styles.fieldShadow}
            onPress={() => onTogglePanel('travelers')}
          >
            <View className="mr-4 h-7 w-7 items-center justify-center">
              <Users size={24} color="#1D4ED8" strokeWidth={2.2} />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold tracking-[1px] text-slate-700">
                Number of Travelers
              </Text>
              <Text className="mt-1 text-sm font-medium tracking-[0.5px] text-slate-500">
                {`${totalTravellers} Traveler${totalTravellers === 1 ? '' : 's'}`}
              </Text>
            </View>
            {openPanel === 'travelers' ? (
              <ChevronUp size={22} color="#64748B" />
            ) : (
              <ChevronDown size={22} color="#64748B" />
            )}
          </Pressable>

          {openPanel === 'travelers' ? (
            <View className="mt-2 rounded-2xl bg-white p-4" style={styles.fieldShadow}>
              {travelerTypes.map((type) => (
                <View key={type} className="flex-row items-center justify-between py-2">
                  <Text className="text-base font-semibold text-slate-700">{type}</Text>
                  <View className="flex-row items-center gap-3">
                    <Pressable
                      className="h-9 w-9 items-center justify-center rounded-full bg-slate-100"
                      onPress={() => onChangeTraveller(type, -1)}
                    >
                      <Minus size={18} color="#0F172A" />
                    </Pressable>
                    <Text className="w-6 text-center text-lg font-bold text-slate-800">
                      {form.travellers[type]}
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

      <View className="mt-6 flex-row gap-3">
        <Pressable
          className="h-14 flex-1 items-center justify-center rounded-2xl border border-sky-200 bg-white"
          style={styles.fieldShadow}
          onPress={onBack}
        >
          <Text className="text-base font-extrabold text-sky-900">Back</Text>
        </Pressable>
        <Pressable
          className={`h-14 flex-[2] items-center justify-center rounded-2xl ${
            isSubmitting ? 'bg-orange-300' : 'bg-orange-500'
          }`}
          style={styles.buttonShadow}
          onPress={onSubmit}
          disabled={isSubmitting}
        >
          <Text className="text-base font-extrabold text-white">
            {isSubmitting ? 'Getting Quote...' : 'Get Quote'}
          </Text>
        </Pressable>
      </View>
    </>
  );
}
