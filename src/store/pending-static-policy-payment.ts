import type { StaticIssuePolicyPayload } from '@/types/quote';

type PendingStaticPolicyPayment = {
  orderId: string;
  policyPayload: StaticIssuePolicyPayload;
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
