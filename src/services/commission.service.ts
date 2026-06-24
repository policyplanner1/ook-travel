import { api } from '@/services/api';
import type { CommissionSummaryResponse } from '@/types/quote';

export async function getAgentCommissionSummary(agentId: number) {
  const { data } = await api.get<CommissionSummaryResponse>(
    `/commission/summary?agent_id=${agentId}`
  );
  return data;
}
