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
  pTrvPartnerDtls_inout: ProposalPartnerDetails;
  pTrvPolDtls_inout: ProposalPolicyDetails;
  pRequestid_out: string;
  pErrorCode_out: string;
};

export type QuoteResponse = {
  message: string;
  proposalResponse: ProposalResponseData;
  premiumAmount: string;
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
  ok: boolean;
  message: string;
  data: {
    id: number;
    agent_id: number;
    agent_name: string;
    fileName: string;
    fileType: string;
    url: string;
    created_at: string;
    updated_at: string;
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

export type CashfreeCreateOrderPayload = {
  order_id: string;
  order_amount: number;
  order_currency: string;
  reference_id: string;
  customer_details: {
    customer_id: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
  };
};

export type CashfreeCreateOrderResponse = {
  payment_link?: string;
  paymentLink?: string;
  payment_url?: string;
  paymentUrl?: string;
  order_id?: string;
  cf_order_id?: string;
  payment_session_id?: string;
  [key: string]: unknown;
};

export type CashfreePaymentStatusResponse = {
  status?: string;
  payment_status?: string;
  order_status?: string;
  order_id?: string;
  cf_payment_id?: string | number;
  [key: string]: unknown;
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
