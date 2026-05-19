import { getLatestQuoteResult } from '@/store/quote-result';

export type PolicyStatus = 'active' | 'expired';

export type PolicyRecord = {
  id: string;
  customerName: string;
  destination: string;
  policyNumber: string;
  travelDates: string;
  premiumAmount: string;
  coverAmount: string;
  status: PolicyStatus;
  downloadUrl?: string;
};

const samplePolicies: PolicyRecord[] = [
  {
    id: 'policy-sarah-europe',
    customerName: 'Sarah Davis',
    destination: 'Europe Explorer',
    policyNumber: 'OKT-TRV-240515',
    travelDates: '15 May 2024 - 25 May 2024',
    premiumAmount: 'Rs. 1,000',
    coverAmount: 'Rs. 25,00,000',
    status: 'active',
    downloadUrl: 'https://policyplanner.com',
  },
  {
    id: 'policy-kevin-usa',
    customerName: 'Kevin Garah',
    destination: 'USA Summer Trip',
    policyNumber: 'OKT-TRV-240603',
    travelDates: '03 Jun 2024 - 14 Jun 2024',
    premiumAmount: 'Rs. 1,250',
    coverAmount: 'Rs. 20,00,000',
    status: 'active',
    downloadUrl: 'https://policyplanner.com',
  },
  {
    id: 'policy-riya-bali',
    customerName: 'Riya Sharma',
    destination: 'Bali Vacation',
    policyNumber: 'OKT-TRV-240729',
    travelDates: '29 Jul 2024 - 05 Aug 2024',
    premiumAmount: 'Rs. 980',
    coverAmount: 'Rs. 25,00,000',
    status: 'expired',
    downloadUrl: 'https://policyplanner.com',
  },
   {
    id: 'policy-riya-usa',
    customerName: 'Riya Sharma',
    destination: 'USA Summer Trip',
    policyNumber: 'OKT-TRV-240603',
    travelDates: '03 Jun 2024 - 14 Jun 2024',
    premiumAmount: 'Rs. 100',
    coverAmount: 'Rs. 25,00,000',
    status: 'active',
    downloadUrl: 'https://policyplanner.com',
  },
];

function formatCustomerName(name: string) {
  return name.replace(/\s+/g, ' ').trim();
}

export function getPolicies(): PolicyRecord[] {
  const latestQuote = getLatestQuoteResult();

  if (!latestQuote) {
    return samplePolicies;
  }

  const partner = latestQuote.proposalResponse.pTrvPartnerDtls_inout;
  const policy = latestQuote.proposalResponse.pTrvPolDtls_inout;
  const currentPolicy: PolicyRecord = {
    id: latestQuote.proposalResponse.pRequestid_out || policy.requestid,
    customerName: formatCustomerName(
      `${partner.title} ${partner.firstname} ${partner.middlename} ${partner.lastname}`
    ),
    destination: policy.areaplan || policy.travelplan,
    policyNumber: latestQuote.proposalResponse.pRequestid_out || policy.requestid,
    travelDates: `${policy.fromDate} - ${policy.toDate}`,
    premiumAmount: `Rs. ${policy.finalPremium}`,
    coverAmount: 'Rs. 25,00,000',
    status: 'active',
    downloadUrl: policy.loading,
  };

  return [currentPolicy, ...samplePolicies];
}
