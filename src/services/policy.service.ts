import { api, baseURL } from '@/services/api';
import type { BulkInsuranceUploadResponse, IssuedPoliciesResponse, PolicyRequestsResponse } from '@/types/quote';

export async function getAllIssuedPolicies(agentId: number) {
  const { data } = await api.get<IssuedPoliciesResponse>(`/policy-issue/agent/${agentId}`);
  return data;
}

export function getIssuedPolicyInvoiceUrl(uuid: string) {
  return `${baseURL}/policy-issue/invoice/${encodeURIComponent(uuid)}`;
}

type BulkInsuranceUploadPayload = {
  agent_id?: number;
  travel_date?: string | null;
  return_date?: string | null;
  num_travelers?: number;
  estimated_premium?: number;
  payment_amount?: number;
  pan_no?: string;
  dob?: string;
  phone?: string;
  name?: string;
  email?: string;
  proposal_response?: string;
  file: {
    uri: string;
    name: string;
    type: string;
  };
};

export async function getAgentPolicyRequests(agentId: number, page = 1, limit = 50) {
  const { data } = await api.get<PolicyRequestsResponse>(
    `/policy/requests?agent_id=${agentId}&page=${page}&limit=${limit}`
  );
  return data;
}

export async function submitBulkInsuranceUpload(payload: BulkInsuranceUploadPayload) {
  const formData = new FormData();

  // Send all non-file fields as a single JSON string to avoid React Native
  // FormData serialisation issues (null → "null", empty strings dropped, etc.)
  const { file, ...meta } = payload;
  formData.append('data', JSON.stringify(meta));

  formData.append('file', {
    uri:  file.uri,
    name: file.name,
    type: file.type,
  } as never);

  const { data } = await api.post<BulkInsuranceUploadResponse>('/policy/bulk', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return data;
}
