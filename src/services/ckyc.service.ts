import axios from 'axios';

import { api, baseURL } from '@/services/api';
import type { CkycLookupResponse } from '@/types/quote';

type CkycLookupPayload = {
  docNumber: string;
  dob: string;
  phone: string;
};

export async function fetchCkycDetails(payload: CkycLookupPayload) {
  const rawDob = payload.dob.trim();
  // Form stores dob as DD/MM/YYYY; API expects YYYY-MM-DD
  const dobForApi = rawDob.includes('/')
    ? rawDob.split('/').reverse().join('-')
    : rawDob;

  const requestBody = {
    docNumber: payload.docNumber.trim().toUpperCase(),
    dob: dobForApi,
    userPhone: payload.phone.trim(),
  };

  console.log('CKYC request:', {
    url: `${baseURL}/bajaj/ckyc`,
    body: requestBody,
  });

  try {
    const { data } = await api.post<{ success: boolean; message: string; data: CkycLookupResponse }>('/bajaj/ckyc', requestBody);
    console.log('CKYC response:', data);
    return data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log('CKYC error:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        data: error.response?.data,
        url: `${baseURL}/bajaj/ckyc`,
      });
    }

    throw error;
  }
}
