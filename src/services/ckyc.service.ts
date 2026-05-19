import axios from 'axios';

import { api, baseURL } from '@/services/api';
import type { CkycLookupResponse } from '@/types/quote';

type CkycLookupPayload = {
  docNumber: string;
  dob: string;
  phone: string;
};

export async function fetchCkycDetails(payload: CkycLookupPayload) {
  const requestBody = {
    docNumber: payload.docNumber.trim().toUpperCase(),
    dob: payload.dob.trim(),
    userPhone: payload.phone.trim(),
  };

  console.log('CKYC request:', {
    url: `${baseURL}/ckyc/bajaj`,
    body: requestBody,
  });

  try {
    const { data } = await api.post<CkycLookupResponse>('/ckyc/bajaj', requestBody);
    console.log('CKYC response:', data);
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log('CKYC error:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        data: error.response?.data,
        url: `${baseURL}/ckyc/bajaj`,
      });
    }

    throw error;
  }
}
