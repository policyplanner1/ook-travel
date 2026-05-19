import axios from 'axios';

import { api, baseURL } from '@/services/api';
import type { BankDetails } from '@/types/auth';

const CREATE_BANK_DETAILS_ENDPOINT = '/agent/bank-details/save';
const EDIT_BANK_DETAILS_ENDPOINT = '/agent/bank-details/edit';

type SaveBankDetailsPayload = {
  agentId: number;
  bankDetails: BankDetails;
  isEdit?: boolean;
};

type SaveBankDetailsRequest = {
  agent_id: number;
  account_holder_name: string;
  bank_name: string;
  account_number: string;
  ifsc_code: string;
  branch_name: string;
  pan_card_number: string;
};

type SaveBankDetailsResponse = {
  ok?: boolean;
  message?: string;
  bankDetails?: Partial<SaveBankDetailsRequest>;
  bank_details?: Partial<SaveBankDetailsRequest>;
};

function normalizeBankDetails(details: BankDetails): BankDetails {
  return {
    accountHolderName: details.accountHolderName.trim(),
    bankName: details.bankName.trim(),
    accountNumber: details.accountNumber.trim(),
    ifscCode: details.ifscCode.trim().toUpperCase(),
    branchName: details.branchName.trim(),
    panCardNumber: details.panCardNumber.trim().toUpperCase(),
  };
}

function mapApiBankDetails(details: Partial<SaveBankDetailsRequest> | undefined, fallback: BankDetails) {
  if (!details) {
    return fallback;
  }

  return {
    accountHolderName: details.account_holder_name?.trim() || fallback.accountHolderName,
    bankName: details.bank_name?.trim() || fallback.bankName,
    accountNumber: details.account_number?.trim() || fallback.accountNumber,
    ifscCode: details.ifsc_code?.trim().toUpperCase() || fallback.ifscCode,
    branchName: details.branch_name?.trim() || fallback.branchName,
    panCardNumber: details.pan_card_number?.trim().toUpperCase() || fallback.panCardNumber,
  };
}

function getBankDetailsErrorMessage(error: unknown, fallbackMessage: string) {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message || error.message || fallbackMessage;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallbackMessage;
}

export async function saveBankDetails(payload: SaveBankDetailsPayload): Promise<BankDetails> {
  const normalizedDetails = normalizeBankDetails(payload.bankDetails);
  const endpoint = payload.isEdit ? EDIT_BANK_DETAILS_ENDPOINT : CREATE_BANK_DETAILS_ENDPOINT;
  const requestBody: SaveBankDetailsRequest = {
    agent_id: payload.agentId,
    account_holder_name: normalizedDetails.accountHolderName,
    bank_name: normalizedDetails.bankName,
    account_number: normalizedDetails.accountNumber,
    ifsc_code: normalizedDetails.ifscCode,
    branch_name: normalizedDetails.branchName,
    pan_card_number: normalizedDetails.panCardNumber,
  };

  console.log('Save bank details request:', {
    method: payload.isEdit ? 'PUT' : 'POST',
    url: `${baseURL}${endpoint}`,
    body: requestBody,
  });

  try {
    const { data } = payload.isEdit
      ? await api.put<SaveBankDetailsResponse>(endpoint, requestBody)
      : await api.post<SaveBankDetailsResponse>(endpoint, requestBody);
    console.log('Save bank details response:', data);

    return mapApiBankDetails(data.bankDetails ?? data.bank_details, normalizedDetails);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log('Save bank details error:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        data: error.response?.data,
        url: `${baseURL}${endpoint}`,
      });
    }

    throw new Error(
      getBankDetailsErrorMessage(error, 'Unable to save bank details right now. Please try again.')
    );
  }
}
