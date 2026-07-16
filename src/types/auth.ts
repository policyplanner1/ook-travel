export type BankDetails = {
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  aadharCardNumber: string;
  panCardNumber: string;
  bankDocumentUrl: string | null;
  aadharDocumentUrl: string | null;
  panDocumentUrl: string | null;
};

export type PickedDocument = {
  uri: string;
  name: string;
  mimeType: string | null;
};

export type AuthUser = {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  isActive: boolean;
  membershipId: string;
  joinedOn: string;
  profileImageUri: string | null;
  bankDetails: BankDetails | null;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type SignupPayload = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
};

export type UpdateProfilePayload = {
  fullName: string;
  email: string;
  phone: string;
};

export type UpdateBankDetailsPayload = BankDetails;

export type ForgotPasswordPayload = {
  mobile: string;
};

export type VerifyResetOtpPayload = {
  mobile: string;
  otp: string;
};

export type ResetPasswordPayload = {
  mobile: string;
  newPassword: string;
  confirmPassword: string;
};
