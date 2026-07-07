export type OpenPanel = 'destination' | 'dates' | 'travelers' | null;

export type TravelerType = 'Adults' | 'Children' | 'Seniors';

export type TravelQuoteFormData = {
  destinationQuery: string;
  selectedDestination: string;
  startDate: string | null;
  endDate: string | null;
  travellers: Record<TravelerType, number>;
};

export type CustomerDetailsFormData = {
  panNo: string;
  dob: string;
  phone: string;
  name: string;
  email: string;
  gender: string;
  pinCode: string;
  streetName: string;
  city: string;
  state: string;
  maritalStatus: string;
  nomineeName: string;
};

export type QuotePayload = TravelQuoteFormData & CustomerDetailsFormData;

export type CkycResponseData = {
  title: string;
  ckycNumber: string;
  fullName: string;
  firstName: string;
  middleName: string;
  lastName: string;
  dob: string;
  gender: string;
  age: string;
  address1: string | null;
  address2: string | null;
  pincode: string | null;
  state: string | null;
  city: string | null;
  area: string | null;
  doi: string | null;
  doe: string | null;
  docType: string;
  docNumber: string;
  docLastUpdated: string | null;
  remarks: string | null;
  customerType: string | null;
  transactionId: string;
  bagicTxnId: string;
  errMsg: string;
  errCode: string;
  panCategory: string | null;
  relativeName: string | null;
  bloodGroup: string | null;
  citizenship: string | null;
  passportFileName: string | null;
  kycStatus: string;
  poaStatus: string;
  poiStatus: string;
  ckycStatus: string;
  company_id: number;
  plan_id: number;
  UUID: string;
};

export type CkycLookupResponse = {
  status: string;
  message: string;
  UUID: string;
  quote_no: string;
  userPhone: string;
  user_id: number;
  ckycResponse: CkycResponseData;
};

export type ProposalPartnerDetails = {
  firstname: string;
  middlename: string;
  lastname: string;
  title: string;
  sex: string;
  maritalstatus: string;
  city: string;
  state: string;
  streetname: string;
  building: string;
  pincode: string;
  email: string;
  dob: string;
  mobileNo: string;
  assigneeName: string;
};

export type ProposalPolicyDetails = {
  travelplan: string;
  areaplan: string;
  fromDate: string;
  toDate: string;
  finalPremium: string;
  loading: string;
  requestid: string;
  returnpath: string;
};

export type ProposalResponseData = {
  pTrvPartnerDtls_inout: ProposalPartnerDetails | null;
  pTrvPolDtls_inout: ProposalPolicyDetails | null;
  pRequestid_out: string;
  pErrorCode_out: string;
};

export type QuoteResponse = {
  message: string;
  proposalResponse: ProposalResponseData;
  premiumAmount: string;
};

export type StoredQuoteResult = {
  mode: 'bajaj' | 'static';
  quoteResponse?: QuoteResponse;
  staticQuoteResponse?: StaticQuoteResponse;
  formData: TravelQuoteFormData & CustomerDetailsFormData;
  planType: 'individual' | 'bulk';
  totalTravellers?: number;
  bulkDocument?: {
    uri: string;
    name: string;
    mimeType: string;
  } | null;
};

export type StaticQuoteDetails = {
  id: number;
  no_of_days: number;
  premium: number;
  basic_coverage: number;
  loss_of_checked_baggage: number;
  personal_liability: number;
  trip_delay: number;
  hospitalization_daily_allowance: number;
  trip_cancellation: number;
  trip_curtailment: number;
  delay_of_checked_baggage: number;
  track_a_baggage_service: string;
  home_burglary_insurance: number;
  bounced_hotel: number;
  loss_of_baggage: number;
  emergency_hotel_extension: number;
  accidental_hospitalization_expenses: number;
  emergency_medical_evacuation: number;
};

export type StaticQuoteTravellerDetails = {
  selectedDestination: string;
  startDate: string | null;
  endDate: string | null;
  travellers: { Adults: number; Children?: number; Seniors?: number };
  name: string;
  email: string;
  phone: string;
  gender: string;
  panNo: string;
  dob: string;
  pinCode: string;
  streetName: string;
  city: string;
  state: string;
  maritalStatus: string;
  nomineeName: string;
};

export type StaticQuoteResponse = {
  product: string;
  no_of_days: number;
  details: StaticQuoteDetails;
  travellerDetails?: StaticQuoteTravellerDetails;
  lead_type?: 'individual' | 'bulk';
};

export type BulkInsuranceUploadResponse = {
  success: boolean;
  message: string;
  data: {
    request_number: string;
    file: string;
  };
};

export type StaticIssuePolicyPayload = {
  lead_type?: 'individual' | 'bulk';
  product: string;
  no_of_days: number;
  premium: number;
  travellerDetails: StaticQuoteTravellerDetails;
  quoteDetails: StaticQuoteDetails;
  agent_id?: number;
  payment?: {
    status: string;
    transactionId?: string;
  };
};

export type CashfreeCreateOrderResponse = {
  order_id: string;
  payment_session_id: string;
};

export type CashfreePaymentStatusResponse = {
  order_id: string;
  order_status: 'PAID' | 'ACTIVE' | 'EXPIRED' | 'TERMINATED' | string;
  order_amount: number;
};

export type IssuedPolicyPayment = {
  status: string;
} | null;

export type IssuedPolicyRecord = {
  id: number;
  uuid: string;
  no_of_days: number;
  premium: string;
  product: string;
  quote_details: StaticQuoteDetails;
  traveller_details: StaticQuoteTravellerDetails;
  payment: IssuedPolicyPayment;
  created_at: string;
  updated_at: string;
};

export type IssuedPoliciesResponse = {
  ok: boolean;
  data: IssuedPolicyRecord[];
};

export type PolicyRequestStatus = 'pending' | 'assigned' | 'issued' | 'rejected';

export type PolicyRequest = {
  id: number;
  request_number: string;
  traveler_name: string;
  travel_date: string | null;
  return_date: string | null;
  estimated_premium: string | null;
  payment_amount: string | null;
  status: PolicyRequestStatus;
  plan_type: 'individual' | 'bulk' | null;
  num_travelers: number | null;
  created_at: string;
  agent_name: string | null;
  rm_name: string | null;
};

export type PolicyRequestsResponse = {
  success: boolean;
  data: {
    requests: PolicyRequest[];
    total: number;
    page: number;
    limit: number;
  };
};

export type CommissionSummary = {
  agent_id: number;
  full_name: string | null;
  email: string | null;
  total_premium: number;
  commission_earned: number;
};

export type CommissionSummaryResponse = {
  success: boolean;
  data: CommissionSummary;
};
