import type { QuoteResponse } from '@/types/quote';

let latestQuoteResult: QuoteResponse | null = null;

const fallbackQuoteResult: QuoteResponse = {
  message: 'This is temporary static quote data for UI preview. Remove it once the live API flow is ready.',
  proposalResponse: {
    pRequestid_out: 'OKT-QUOTE-240422',
    pErrorCode_out: '0',
    pTrvPartnerDtls_inout: {
      firstname: 'Aftab',
      middlename: 'Ashok',
      lastname: 'Naik',
      title: 'Mr',
      sex: 'Male',
      maritalstatus: 'Single',
      city: 'Pune',
      state: 'Maharashtra',
      streetname: 'MG Road',
      building: 'A-204',
      pincode: '411048',
      email: 'aftabnaik1999@gmail.com',
      dob: '12/08/1999',
      mobileNo: '9876543210',
      assigneeName: 'Sneha Naik',
    },
    pTrvPolDtls_inout: {
      travelplan: 'Travel Secure Gold',
      areaplan: 'Europe',
      fromDate: '2026-05-10',
      toDate: '2026-05-18',
      finalPremium: '1249',
      loading: 'https://example.com/payment',
      requestid: 'REQ-240422-01',
      returnpath: 'https://example.com/return',
    },
  },
};

function normalizeQuoteResult(result: QuoteResponse | null | undefined): QuoteResponse {
  const proposalResponse = result?.proposalResponse;

  return {
    message: result?.message ?? fallbackQuoteResult.message,
    proposalResponse: {
      pRequestid_out:
        proposalResponse?.pRequestid_out ?? fallbackQuoteResult.proposalResponse.pRequestid_out,
      pErrorCode_out:
        proposalResponse?.pErrorCode_out ?? fallbackQuoteResult.proposalResponse.pErrorCode_out,
      pTrvPartnerDtls_inout: {
        ...fallbackQuoteResult.proposalResponse.pTrvPartnerDtls_inout,
        ...(proposalResponse?.pTrvPartnerDtls_inout ?? {}),
      },
      pTrvPolDtls_inout: {
        ...fallbackQuoteResult.proposalResponse.pTrvPolDtls_inout,
        ...(proposalResponse?.pTrvPolDtls_inout ?? {}),
      },
    },
  };
}

export function setLatestQuoteResult(result: QuoteResponse) {
  latestQuoteResult = normalizeQuoteResult(result);
}

export function getLatestQuoteResult() {
  return latestQuoteResult ? normalizeQuoteResult(latestQuoteResult) : null;
}

export function clearLatestQuoteResult() {
  latestQuoteResult = null;
}
