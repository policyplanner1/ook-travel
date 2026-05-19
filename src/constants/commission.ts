export type CommissionRange = 'quarterly' | 'halfYearly' | 'yearly';

export type CommissionPoint = {
  label: string;
  value: number;
};

const monthlyCommissionHistory: CommissionPoint[] = [
  { label: 'Jan', value: 12000 },
  { label: 'Feb', value: 14800 },
  { label: 'Mar', value: 17200 },
  { label: 'Apr', value: 18450 },
  { label: 'May', value: 16100 },
  { label: 'Jun', value: 19300 },
  { label: 'Jul', value: 20750 },
  { label: 'Aug', value: 22100 },
  { label: 'Sep', value: 21400 },
  { label: 'Oct', value: 23650 },
  { label: 'Nov', value: 24800 },
  { label: 'Dec', value: 26500 },
];

const totalSalesHistory = [32500, 41800, 46200, 48900, 51200, 57800, 60500, 64100, 68300, 72400, 81500, 84250];

export const currentMonthIndex = new Date().getMonth();

export const commissionSummary = {
  earnings: monthlyCommissionHistory[currentMonthIndex].value,
  thisMonth: monthlyCommissionHistory[currentMonthIndex].value,
  totalSales: totalSalesHistory[currentMonthIndex],
};

function getCurrentQuarterMonths() {
  const quarterStartIndex = Math.floor(currentMonthIndex / 3) * 3;
  return monthlyCommissionHistory.slice(quarterStartIndex, quarterStartIndex + 3);
}

function getCurrentHalfYearMonths() {
  const halfYearStartIndex = currentMonthIndex < 6 ? 0 : 6;
  return monthlyCommissionHistory.slice(halfYearStartIndex, halfYearStartIndex + 6);
}

export const quarterlyBreakdown: CommissionPoint[] = getCurrentQuarterMonths();

export const halfYearlyBreakdown: CommissionPoint[] = getCurrentHalfYearMonths();

export const yearlyBreakdown: CommissionPoint[] = monthlyCommissionHistory;
