import { api, baseURL } from '@/services/api';
import type { BulkInsuranceUploadResponse, IssuedPoliciesResponse } from '@/types/quote';

export async function getAllIssuedPolicies(agentId: number) {
  const { data } = await api.get<IssuedPoliciesResponse>(`/policy-issue/agent/${agentId}`);
  return data;
}

export function getIssuedPolicyInvoiceUrl(uuid: string) {
  return `${baseURL}/policy-issue/invoice/${encodeURIComponent(uuid)}`;
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

  const { data } = await api.post<BulkInsuranceUploadResponse>('/policy-issue/bulk', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return data;
}
