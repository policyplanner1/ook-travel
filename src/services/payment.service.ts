import { api } from '@/services/api';
import type { CashfreeCreateOrderResponse, CashfreePaymentStatusResponse } from '@/types/quote';

export type CreatePaymentOrderPayload = {
  amount: number;
  customerId: string;
  customerPhone: string;
  customerEmail: string;
  customerName: string;
  // 'bulk' skips server-side reconciliation (its file upload can't be replayed from a
  // stored JSON payload) — omit requestPayload in that case.
  requestType: 'individual' | 'bulk';
  requestPayload?: Record<string, unknown>;
};

export async function createPaymentOrder(payload: CreatePaymentOrderPayload) {
  const { data } = await api.post<{ success: boolean; data: CashfreeCreateOrderResponse }>(
    '/payment/create-order',
    payload
  );
  return data.data;
}

export async function verifyPaymentOrder(orderId: string) {
  const { data } = await api.get<{ success: boolean; data: CashfreePaymentStatusResponse }>(
    `/payment/verify-order/${encodeURIComponent(orderId)}`
  );
  return data.data;
}

export async function completePaymentOrder(orderId: string) {
  const { data } = await api.post<{ success: boolean; data: { request_id: number } }>(
    `/payment/complete-order/${encodeURIComponent(orderId)}`
  );
  return data.data;
}
