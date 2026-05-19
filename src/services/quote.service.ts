import axios from 'axios';
import { api, baseURL } from '@/services/api';
import type { QuotePayload, QuoteResponse } from '@/types/quote';

function formatDobForProposal(dob: string) {
  const [day = '', month = '', year = ''] = dob.split('/');
  const monthIndex = Number(month) - 1;
  const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const monthCode = monthNames[monthIndex] ?? 'DEC';

  return `${day.padStart(2, '0')}-${monthCode}-${year}`;
}

function splitFullName(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  return {
    firstName: (parts[0] ?? 'AFTAB').toUpperCase(),
    middleName: (parts[1] ?? 'ASHOK').toUpperCase(),
    lastName: (parts.slice(2).join(' ') || parts[1] || 'NAIK').toUpperCase(),
  };
}

export async function submitQuote(payload: QuotePayload) {
  const { firstName, middleName, lastName } = splitFullName(payload.name);

  const requestBody = {
    UUID: 'c254dfd8-8927-426e-b371-b31d94f30f67',
    building: 'A-204',
    city: payload.city || 'pune',
    company_id: '1018',
    dob: formatDobForProposal(payload.dob),
    docNumber: payload.panNo || 'BOGPN8336B',
    email: payload.email || 'aftabnaik1999@gmail.com',
    firstName,
    fromDate: payload.startDate ?? '2026-04-12',
    gender: (payload.gender.trim().charAt(0) || 'M').toUpperCase(),
    lastName,
    maritalstatus: (payload.maritalStatus || 'SINGLE').toUpperCase(),
    middleName,
    nomineename: payload.nomineeName || 'sneha',
    pincode: payload.pinCode || '411048',
    plan_id: '173',
    quote_no: payload.phone || '9490723983',
    state: payload.state || 'maharastra',
    streetname: payload.streetName || 'metha nagar',
    title: 'MR',
    toDate: payload.endDate ?? '2026-04-20',
    userPhone: payload.phone || '9175730492',
    user_id: '7092',
  };

  console.log('Bajaj proposal request:', {
    url: `${baseURL}/proposal/bajaj`,
    body: requestBody,
  });

  try {
    const { data } = await api.post<QuoteResponse>('/proposal/bajaj', requestBody);
    console.log('Bajaj proposal response:', data);
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log('Bajaj proposal error:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        data: error.response?.data,
        url: `${baseURL}/proposal/bajaj`,
      });
    }

    throw error;
  }
}
