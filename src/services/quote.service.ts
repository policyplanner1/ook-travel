import axios from 'axios';
import { api, baseURL } from '@/services/api';
import type { CkycLookupResponse, QuotePayload, QuoteResponse, StaticQuoteResponse } from '@/types/quote';

export async function fetchTravelInsurancePremium(no_of_days: number): Promise<StaticQuoteResponse> {
  try {
    const { data } = await api.post<{ success: boolean; message: string; data: StaticQuoteResponse }>(
      '/travel-insurance/premium',
      { no_of_days }
    );
    return data.data;
  } catch (error) {
    if (axios.isAxiosError<{ message?: string }>(error)) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch premium. Please try again.');
    }
    throw error;
  }
}

export async function submitQuote(payload: QuotePayload, ckycData: CkycLookupResponse): Promise<QuoteResponse> {
  const requestBody = {
    UUID: ckycData.UUID,
    user_id: String(ckycData.user_id),
    quote_no: ckycData.quote_no,
    company_id: String(ckycData.ckycResponse.company_id),
    plan_id: String(ckycData.ckycResponse.plan_id),
    docNumber: payload.panNo,
    dob: ckycData.ckycResponse.dob,
    title: ckycData.ckycResponse.title,
    firstName: ckycData.ckycResponse.firstName,
    middleName: ckycData.ckycResponse.middleName,
    lastName: ckycData.ckycResponse.lastName,
    email: payload.email,
    userPhone: payload.phone,
    gender: payload.gender.trim().charAt(0).toUpperCase(),
    maritalstatus: payload.maritalStatus.toUpperCase(),
    nomineename: payload.nomineeName,
    pincode: payload.pinCode,
    state: payload.state,
    city: payload.city,
    building: payload.streetName,
    streetname: payload.streetName,
    fromDate: payload.startDate,
    toDate: payload.endDate,
  };

  console.log('Bajaj proposal request:', {
    url: `${baseURL}/bajaj/proposal`,
    body: requestBody,
  });

  try {
    const { data } = await api.post<{ success: boolean; message: string; data: QuoteResponse }>('/bajaj/proposal', requestBody);
    console.log('Bajaj proposal response:', data);
    return data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log('Bajaj proposal error:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        data: error.response?.data,
        url: `${baseURL}/bajaj/proposal`,
      });
    }
    throw error;
  }
}
