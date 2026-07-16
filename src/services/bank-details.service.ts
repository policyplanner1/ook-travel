import axios from 'axios';

import { api, baseURL, resolveApiAssetUrl } from '@/services/api';
import type { BankDetails, PickedDocument } from '@/types/auth';

const CREATE_BANK_DETAILS_ENDPOINT = '/bank';
const EDIT_BANK_DETAILS_ENDPOINT = '/bank';

type BankDetailsTextFields = Omit<BankDetails, 'bankDocumentUrl' | 'aadharDocumentUrl' | 'panDocumentUrl'>;

type SaveBankDetailsPayload = {
  agentId: number;
  bankDetails: BankDetailsTextFields;
  documents?: {
    bankDocument?: PickedDocument | null;
    aadharDocument?: PickedDocument | null;
    panDocument?: PickedDocument | null;
  };
  isEdit?: boolean;
};

type SaveBankDetailsRequest = {
  agent_id: number;
  account_holder_name: string;
  bank_name: string;
  account_number: string;
  ifsc_code: string;
  aadhar_number: string;
  pan_card_number: string;
};

type SaveBankDetailsApiResponse = Partial<SaveBankDetailsRequest> & {
  bank_document?: string | null;
  aadhar_document?: string | null;
  pan_document?: string | null;
};

type SaveBankDetailsResponse = {
  success: boolean;
  message: string;
  data: { bank_details: SaveBankDetailsApiResponse };
};

function normalizeBankDetails(details: BankDetailsTextFields): BankDetailsTextFields {
  return {
    accountHolderName: details.accountHolderName.trim(),
    bankName: details.bankName.trim(),
    accountNumber: details.accountNumber.trim(),
    ifscCode: details.ifscCode.trim().toUpperCase(),
    aadharCardNumber: details.aadharCardNumber.trim(),
    panCardNumber: details.panCardNumber.trim().toUpperCase(),
  };
}

function mapApiBankDetails(
  details: SaveBankDetailsApiResponse | undefined,
  fallback: BankDetailsTextFields
): BankDetails {
  return {
    accountHolderName: details?.account_holder_name?.trim() || fallback.accountHolderName,
    bankName: details?.bank_name?.trim() || fallback.bankName,
    accountNumber: details?.account_number?.trim() || fallback.accountNumber,
    ifscCode: details?.ifsc_code?.trim().toUpperCase() || fallback.ifscCode,
    aadharCardNumber: details?.aadhar_number?.trim() || fallback.aadharCardNumber,
    panCardNumber: details?.pan_card_number?.trim().toUpperCase() || fallback.panCardNumber,
    bankDocumentUrl: resolveApiAssetUrl(details?.bank_document),
    aadharDocumentUrl: resolveApiAssetUrl(details?.aadhar_document),
    panDocumentUrl: resolveApiAssetUrl(details?.pan_document),
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

function appendDocument(formData: FormData, field: string, document?: PickedDocument | null) {
  if (!document) return;

  const ext = /\.(\w+)$/.exec(document.name)?.[1] ?? 'jpg';
  formData.append(field, {
    uri: document.uri,
    name: document.name,
    type: document.mimeType ?? `image/${ext}`,
  } as unknown as Blob);
}

export async function saveBankDetails(payload: SaveBankDetailsPayload): Promise<BankDetails> {
  const normalizedDetails = normalizeBankDetails(payload.bankDetails);
  const endpoint = payload.isEdit ? EDIT_BANK_DETAILS_ENDPOINT : CREATE_BANK_DETAILS_ENDPOINT;

  const formData = new FormData();
  formData.append('agent_id', String(payload.agentId));
  formData.append('account_holder_name', normalizedDetails.accountHolderName);
  formData.append('bank_name', normalizedDetails.bankName);
  formData.append('account_number', normalizedDetails.accountNumber);
  formData.append('ifsc_code', normalizedDetails.ifscCode);
  formData.append('aadhar_number', normalizedDetails.aadharCardNumber);
  formData.append('pan_card_number', normalizedDetails.panCardNumber);
  appendDocument(formData, 'bank_document', payload.documents?.bankDocument);
  appendDocument(formData, 'aadhar_document', payload.documents?.aadharDocument);
  appendDocument(formData, 'pan_document', payload.documents?.panDocument);

  console.log('Save bank details request:', {
    method: payload.isEdit ? 'PUT' : 'POST',
    url: `${baseURL}${endpoint}`,
    agentId: payload.agentId,
  });

  try {
    const { data } = payload.isEdit
      ? await api.put<SaveBankDetailsResponse>(endpoint, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      : await api.post<SaveBankDetailsResponse>(endpoint, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
    console.log('Save bank details response:', data);

    return mapApiBankDetails(data.data?.bank_details, normalizedDetails);
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
