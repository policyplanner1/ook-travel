import { Pressable, Text, TextInput, View } from 'react-native';
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  MapPin,
  Minus,
  Plus,
  Users,
} from 'lucide-react-native';
import { Calendar, type DateData } from 'react-native-calendars';

import { travelerTypes } from '@/constants/quote';
import type { OpenPanel, TravelQuoteFormData, TravelerType } from '@/types/quote';
import { buildMarkedDates, formatDate, todayString } from '@/utils/date';

type QuoteStepOneProps = {
  cities: string[];
  form: TravelQuoteFormData;
  openPanel: OpenPanel;
  onTogglePanel: (panel: Exclude<OpenPanel, null>) => void;
  onDestinationQueryChange: (value: string) => void;
  onSelectDestination: (city: string) => void;
  onDayPress: (day: DateData) => void;
  onChangeTraveller: (type: TravelerType, delta: number) => void;
  styles: {
    fieldShadow: object;
    buttonShadow: object;
  };
  onNext: () => void;
  hideNextButton?: boolean;
};

export function QuoteStepOne({
  cities,
  form,
  openPanel,
  onTogglePanel,
  onDestinationQueryChange,
  onSelectDestination,
  onDayPress,
  onChangeTraveller,
  styles,
  onNext,
  hideNextButton = false,
}: QuoteStepOneProps) {
  const totalTravellers = Object.values(form.travellers).reduce((sum, count) => sum + count, 0);
  const travellerSummary = `${totalTravellers} Traveler${totalTravellers === 1 ? '' : 's'}`;
  const dateSummary = form.startDate && form.endDate
    ? `${formatDate(form.startDate)} - ${formatDate(form.endDate)}`
    : form.startDate
      ? `${formatDate(form.startDate)} - Select return`
      : 'DD / MM / YYYY - DD / MM / YYYY';

  return (
    <>
      <Text className="mb-5 text-center text-3xl font-extrabold tracking-[1px] text-sky-950">
        Get a Quote
      </Text>

      <View className="w-full gap-3">
        <View>
          <Pressable
            className="min-h-16 flex-row items-center rounded-md bg-white px-4 py-4"
            style={styles.fieldShadow}
            onPress={() => onTogglePanel('destination')}
          >
            <View className="mr-4 h-7 w-7 items-center justify-center">
              <MapPin size={24} color="#F97316" strokeWidth={2.4} />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold tracking-[1px] text-slate-700">
                {form.selectedDestination || 'Select Your Destination'}
              </Text>
            </View>
            {openPanel === 'destination' ? (
              <ChevronUp size={22} color="#64748B" />
            ) : (
              <ChevronDown size={22} color="#64748B" />
            )}
          </Pressable>

          {openPanel === 'destination' ? (
            <View className="mt-2 rounded-2xl bg-white p-4" style={styles.fieldShadow}>
              <TextInput
                value={form.destinationQuery}
                onChangeText={onDestinationQueryChange}
                placeholder="Type a city name"
                placeholderTextColor="#94A3B8"
                className="rounded-xl border border-slate-200 px-4 py-3 text-base text-slate-700"
              />
              <View className="mt-3 gap-2">
                {(() => {
                  const query = form.destinationQuery.trim();
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
                {cities.length === 0 && !form.destinationQuery.trim() ? (
                  <Text className="px-1 py-2 text-sm text-slate-500">No matching cities found.</Text>
                ) : null}
              </View>
            </View>
          ) : null}
        </View>

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
              <Text className="text-base font-semibold tracking-[1px] text-slate-700">Travel Dates</Text>
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
            <View className="mt-2 overflow-hidden rounded-2xl bg-white p-3" style={styles.fieldShadow}>
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

        {/* <View>
          <Pressable
            className="min-h-16 flex-row items-center rounded-md bg-white px-4 py-4"
            style={styles.fieldShadow}
            // onPress={() => onTogglePanel('travelers')}
          >
            <View className="mr-4 h-7 w-7 items-center justify-center">
              <Users size={24} color="#1D4ED8" strokeWidth={2.2} />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold tracking-[1px] text-slate-700">
                Number of Travelers
              </Text>
              <Text className="mt-1 text-sm font-medium tracking-[0.5px] text-slate-500">
                {travellerSummary}
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
        </View> */}
      </View>

      {!hideNextButton ? (
        <Pressable
          className="mt-5 h-14 w-[72%] items-center justify-center self-center rounded-lg bg-orange-500"
          style={styles.buttonShadow}
          onPress={onNext}
        >
          <Text className="text-2xl font-extrabold tracking-normal text-white">Next</Text>
        </Pressable>
      ) : null}
    </>
  );
}
