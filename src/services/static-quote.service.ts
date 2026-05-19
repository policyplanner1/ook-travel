import axios from 'axios';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

import { baseURL } from '@/services/api';
import { db } from '@/services/firebase';
import type {
  BulkInsuranceUploadResponse,
  CashfreeCreateOrderPayload,
  CashfreeCreateOrderResponse,
  CashfreePaymentStatusResponse,
  IssuedPoliciesResponse,
  StaticIssuePolicyPayload,
  StaticQuoteResponse,
} from '@/types/quote';

const STATIC_QUOTE_BASE_URL = baseURL;
const FIREBASE_POLICY_BASE_URL = 'https://policyplanner.com/travel-insurance';

const staticQuoteApi = axios.create({
  baseURL: STATIC_QUOTE_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

type StaticQuotePayload = {
  no_of_days: number;
};

export async function submitStaticQuote(payload: StaticQuotePayload) {
  console.log('Bharat Bhraman quote request:', {
    url: `${STATIC_QUOTE_BASE_URL}/bajaj/bharat-bhraman`,
    body: payload,
  });

  try {
    const { data } = await staticQuoteApi.post<StaticQuoteResponse>('/bajaj/bharat-bhraman', payload);
    console.log('Bharat Bhraman quote response:', data);
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log('Bharat Bhraman quote error:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        data: error.response?.data,
        url: `${STATIC_QUOTE_BASE_URL}/bajaj/bharat-bhraman`,
      });
    }

    throw error;
  }
}

export async function issueStaticPolicy(payload: StaticIssuePolicyPayload) {
  // console.log('Bharat Bhraman issue policy request:', {
  //   url: `${STATIC_QUOTE_BASE_URL}/policy-issue/save`,
  //   body: payload,
  // });

  try {
    const { data } = await staticQuoteApi.post('/policy-issue/save', payload);

    try {
      await addDoc(collection(db, 'AUX_enquiry_leads'), {
        lead_type: 'travelPoliciesLeads',
        apiResponse: data,
        companyId : 'PP739792',
        createdAt: serverTimestamp(),
      });
    } catch (firebaseError) {
      console.log('Bharat Bhraman issue policy firebase save error:', firebaseError);
    }

    // console.log('Bharat Bhraman issue policy response:', data);
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log('Bharat Bhraman issue policy error:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        data: error.response?.data,
        url: `${STATIC_QUOTE_BASE_URL}/policy-issue/save`,
      });
    }

    throw error;
  }
}

type BulkInsuranceUploadPayload = {
  agent_id?: number;
  file: {
    uri: string;
    name: string;
    type: string;
  };
};

export async function submitBulkInsuranceUpload(payload: BulkInsuranceUploadPayload) {
  const formData = new FormData();

  if (typeof payload.agent_id === 'number') {
    formData.append('agent_id', String(payload.agent_id));
  }

  formData.append('file', {
    uri: payload.file.uri,
    name: payload.file.name,
    type: payload.file.type,
  } as never);

  console.log('Bulk insurance upload request:', {
    url: `${STATIC_QUOTE_BASE_URL}/policy-issue/bulk`,
    agent_id: payload.agent_id,
    fileName: payload.file.name,
    fileType: payload.file.type,
  });

  try {
    const { data } = await staticQuoteApi.post<BulkInsuranceUploadResponse>(
      '/policy-issue/bulk',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    try {
      await addDoc(collection(db, 'AUX_enquiry_leads'), {
        lead_type: 'travelBulkInsuranceUploads',
        ...data.data,
        url: `${FIREBASE_POLICY_BASE_URL}${data.data.url}`,
        companyId : 'PP739792',
        createdAt: serverTimestamp(),
      });
    } catch (firebaseError) {
      console.log('Bulk insurance upload firebase save error:', firebaseError);
    }

    console.log('Bulk insurance upload response:', data);
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log('Bulk insurance upload error:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        data: error.response?.data,
        url: `${STATIC_QUOTE_BASE_URL}/policy-issue/bulk`,
      });
    }

    throw error;
  }
}

export async function createCashfreeOrder(payload: CashfreeCreateOrderPayload) {
  console.log('Cashfree create order request:', {
    url: `${STATIC_QUOTE_BASE_URL}/cashfree/create-order`,
    body: payload,
  });

  try {
    const { data } = await staticQuoteApi.post<CashfreeCreateOrderResponse>('/cashfree/create-order', payload);
    console.log('Cashfree create order response:', data);
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log('Cashfree create order error:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        data: error.response?.data,
        url: `${STATIC_QUOTE_BASE_URL}/cashfree/create-order`,
      });
    }

    throw error;
  }
}

export async function verifyCashfreePaymentStatus(orderId: string) {
  console.log('Cashfree payment status request:', {
    url: `${STATIC_QUOTE_BASE_URL}/cashfree/payment-status`,
    params: {
      orderId,
    },
  });

  try {
    const { data } = await staticQuoteApi.get<CashfreePaymentStatusResponse>('/cashfree/payment-status', {
      params: {
        orderId,
      },
    });
    console.log('Cashfree payment status response:', data);
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log('Cashfree payment status error:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        data: error.response?.data,
        url: `${STATIC_QUOTE_BASE_URL}/cashfree/payment-status`,
        params: {
          orderId,
        },
      });
    }

    throw error;
  }
}

export async function getAllIssuedPolicies(agentId: number) {
  console.log('Issued policies request:', {
    url: `${STATIC_QUOTE_BASE_URL}/policy-issue/agent/${agentId}`,
  });

  try {
    const { data } = await staticQuoteApi.get<IssuedPoliciesResponse>(`/policy-issue/agent/${agentId}`);
    // console.log('Issued policies response:', data);
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log('Issued policies error:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        data: error.response?.data,
        url: `${STATIC_QUOTE_BASE_URL}/policy-issue/agent/${agentId}`,
      });
    }

    throw error;
  }
}

export function getIssuedPolicyInvoiceUrl(uuid: string) {
  return `${STATIC_QUOTE_BASE_URL}/policy-issue/invoice/${encodeURIComponent(uuid)}`;
}
