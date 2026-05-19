export function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function todayString() {
  return new Date().toISOString().split('T')[0];
}

type MarkedDate = {
  color: string;
  textColor: string;
  startingDay?: boolean;
  endingDay?: boolean;
};

export function buildMarkedDates(
  startDate: string | null,
  endDate: string | null,
): Record<string, MarkedDate> {
  if (!startDate) {
    return {};
  }

  if (!endDate) {
    return {
      [startDate]: {
        startingDay: true,
        endingDay: true,
        color: '#2563EB',
        textColor: '#FFFFFF',
      },
    };
  }

  const result: Record<string, MarkedDate> = {};
  const current = new Date(startDate);
  const last = new Date(endDate);

  while (current <= last) {
    const key = current.toISOString().split('T')[0];
    result[key] = {
      color: '#BFDBFE',
      textColor: '#0F172A',
    };
    current.setDate(current.getDate() + 1);
  }

  result[startDate] = {
    startingDay: true,
    color: '#2563EB',
    textColor: '#FFFFFF',
  };
  result[endDate] = {
    endingDay: true,
    color: '#2563EB',
    textColor: '#FFFFFF',
  };

  return result;
}
