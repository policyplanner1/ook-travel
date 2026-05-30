import type { StaticIssuePolicyPayload } from '@/types/quote';

export type BulkFile = {
  uri: string;
  name: string;
  type: string;
};

type PendingStaticPolicyPayment = {
  orderId: string;
  policyPayload: StaticIssuePolicyPayload;
  bulkFile?: BulkFile;
};

let pendingStaticPolicyPayment: PendingStaticPolicyPayment | null = null;

export function setPendingStaticPolicyPayment(payment: PendingStaticPolicyPayment) {
  pendingStaticPolicyPayment = payment;
}

export function getPendingStaticPolicyPayment() {
  return pendingStaticPolicyPayment;
}

export function clearPendingStaticPolicyPayment() {
  pendingStaticPolicyPayment = null;
}
