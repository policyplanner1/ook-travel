import axios from 'axios';

import { api, baseURL, resolveApiAssetUrl } from '@/services/api';
import type {
  AuthUser,
  BankDetails,
  ForgotPasswordPayload,
  LoginPayload,
  ResetPasswordPayload,
  SignupPayload,
  VerifyResetOtpPayload,
} from '@/types/auth';

type AuthApiAgent = {
  id: number;
  fullName?: string;
  full_name?: string;
  email: string;
  profileImageUri?: string | null;
  profile_pic_url?: string | null;
  profile_image_uri?: string | null;
  profilePic?: string | null;
  profile_pic?: string | null;
  avatar?: string | null;
  image?: string | null;
  phoneNumber?: string;
  phone_number?: string;
  isActive?: boolean | number;
  is_active?: boolean | number;
  created_at?: string;
  updated_at?: string;
  accountHolderName?: string;
  account_holder_name?: string;
  accountNumber?: string;
  account_number?: string;
  bankName?: string;
  bank_name?: string;
  branchName?: string;
  branch_name?: string;
  ifscCode?: string;
  ifsc_code?: string;
  panCardNumber?: string;
  pan_card_number?: string;
  bankDetails?: {
    accountHolderName?: string;
    account_holder_name?: string;
    bankName?: string;
    bank_name?: string;
    accountNumber?: string;
    account_number?: string;
    ifscCode?: string;
    ifsc_code?: string;
    branchName?: string;
    branch_name?: string;
    panCardNumber?: string;
    pan_card_number?: string;
  };
  bank_details?: {
    accountHolderName?: string;
    account_holder_name?: string;
    bankName?: string;
    bank_name?: string;
    accountNumber?: string;
    account_number?: string;
    ifscCode?: string;
    ifsc_code?: string;
    branchName?: string;
    branch_name?: string;
    panCardNumber?: string;
    pan_card_number?: string;
  };
};

type AuthApiResponse = {
  ok: boolean;
  message: string;
  agent: AuthApiAgent;
};

type AuthMessageResponse = {
  ok: boolean;
  message: string;
};

function formatJoinedOn() {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date());
}

function formatApiDate(value?: string) {
  if (!value) {
    return formatJoinedOn();
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return formatJoinedOn();
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function mapAgentBankDetails(agent: AuthApiAgent): BankDetails | null {
  const nestedBankDetails = agent.bankDetails ?? agent.bank_details;
  const accountHolderName =
    agent.accountHolderName ??
    agent.account_holder_name ??
    nestedBankDetails?.accountHolderName ??
    nestedBankDetails?.account_holder_name ??
    '';
  const bankName =
    agent.bankName ??
    agent.bank_name ??
    nestedBankDetails?.bankName ??
    nestedBankDetails?.bank_name ??
    '';
  const accountNumber =
    agent.accountNumber ??
    agent.account_number ??
    nestedBankDetails?.accountNumber ??
    nestedBankDetails?.account_number ??
    '';
  const ifscCode =
    agent.ifscCode ??
    agent.ifsc_code ??
    nestedBankDetails?.ifscCode ??
    nestedBankDetails?.ifsc_code ??
    '';
  const branchName =
    agent.branchName ??
    agent.branch_name ??
    nestedBankDetails?.branchName ??
    nestedBankDetails?.branch_name ??
    '';
  const panCardNumber =
    agent.panCardNumber ??
    agent.pan_card_number ??
    nestedBankDetails?.panCardNumber ??
    nestedBankDetails?.pan_card_number ??
    '';

  if (
    !accountHolderName.trim() &&
    !bankName.trim() &&
    !accountNumber.trim() &&
    !ifscCode.trim() &&
    !branchName.trim() &&
    !panCardNumber.trim()
  ) {
    return null;
  }

  return {
    accountHolderName: accountHolderName.trim(),
    bankName: bankName.trim(),
    accountNumber: accountNumber.trim(),
    ifscCode: ifscCode.trim().toUpperCase(),
    branchName: branchName.trim(),
    panCardNumber: panCardNumber.trim().toUpperCase(),
  };
}

function mapAgentProfileImageUri(agent: AuthApiAgent) {
  return resolveApiAssetUrl(
    agent.profileImageUri ??
    agent.profile_pic_url ??
    agent.profile_image_uri ??
    agent.profilePic ??
    agent.profile_pic ??
    agent.avatar ??
    agent.image ??
    null
  );
}

function mapAgentToAuthUser(agent: AuthApiAgent): AuthUser {
  return {
    id: agent.id,
    fullName: (agent.fullName ?? agent.full_name ?? '').trim(),
    email: agent.email,
    phone: (agent.phoneNumber ?? agent.phone_number ?? '').trim(),
    isActive: Boolean(agent.isActive ?? agent.is_active),
    membershipId: `OKT-TRAVEL-${String(agent.id).padStart(4, '0')}`,
    joinedOn: formatApiDate(agent.created_at),
    profileImageUri: mapAgentProfileImageUri(agent),
    bankDetails: mapAgentBankDetails(agent),
  };
}

function getAuthErrorMessage(error: unknown, fallbackMessage: string) {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message || error.message || fallbackMessage;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallbackMessage;
}

export async function loginWithApi(payload: LoginPayload): Promise<AuthUser> {
  const requestBody = {
    email: payload.email.trim().toLowerCase(),
    password: payload.password,
  };

  if (!requestBody.email || !requestBody.password.trim()) {
    throw new Error('Email and password are required.');
  }

  console.log('Login request:', {
    url: `${baseURL}/auth/login`,
    body: { ...requestBody },
  });

  try {
    const { data } = await api.post<AuthApiResponse>('/auth/login', requestBody);
    console.log('Login response:', data);
    return mapAgentToAuthUser(data.agent);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log('Login error:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        data: error.response?.data,
        url: `${baseURL}/auth/login`,
      });
    }

    throw new Error(getAuthErrorMessage(error, 'Login failed. Please try again.'));
  }
}

export async function signupWithApi(payload: SignupPayload): Promise<AuthUser> {
  const requestBody = {
    fullname: payload.fullName.trim(),
    email: payload.email.trim().toLowerCase(),
    phoneNumber: payload.phone.trim(),
    password: payload.password,
    confirmPassword: payload.confirmPassword,
  };

  if (
    !requestBody.fullname ||
    !requestBody.email ||
    !requestBody.phoneNumber ||
    !requestBody.password.trim() ||
    !requestBody.confirmPassword.trim()
  ) {
    throw new Error('Please complete all signup fields.');
  }

  if (requestBody.password !== requestBody.confirmPassword) {
    throw new Error('Password and confirm password must match.');
  }

  console.log('Signup request:', {
    url: `${baseURL}/auth/signup`,
    body: {
      ...requestBody,
      password: '***',
      confirmPassword: '***',
    },
  });

  try {
    const { data } = await api.post<AuthApiResponse>('/auth/signup', requestBody);
    console.log('Signup response:', data);
    return mapAgentToAuthUser(data.agent);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log('Signup error:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        data: error.response?.data,
        url: `${baseURL}/auth/signup`,
      });
    }

    throw new Error(getAuthErrorMessage(error, 'Signup failed. Please try again.'));
  }
}

export async function sendSignupOtp(payload: { phone: string }): Promise<string> {
  const requestBody = { mobile: payload.phone.trim() };

  if (!requestBody.mobile) {
    throw new Error('Phone number is required.');
  }

  console.log('Send signup OTP request:', {
    url: `${baseURL}/auth/send-otp`,
    body: requestBody,
  });

  try {
    const { data } = await api.post<AuthMessageResponse>('/auth/send-otp', requestBody);
    console.log('Send signup OTP response:', data);
    return data.message || 'OTP sent successfully.';
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log('Send signup OTP error:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        data: error.response?.data,
        url: `${baseURL}/auth/send-otp`,
      });
    }

    throw new Error(getAuthErrorMessage(error, 'Failed to send OTP. Please try again.'));
  }
}

export async function verifySignupOtp(payload: { phone: string; otp: string }): Promise<string> {
  const requestBody = {
    mobile: payload.phone.trim(),
    otp: payload.otp.trim(),
  };

  if (!requestBody.mobile || !requestBody.otp) {
    throw new Error('Phone number and OTP are required.');
  }

  console.log('Verify signup OTP request:', {
    url: `${baseURL}/auth/verify-otp`,
    body: requestBody,
  });

  try {
    const { data } = await api.post<AuthMessageResponse>('/auth/verify-otp', requestBody);
    console.log('Verify signup OTP response:', data);
    return data.message || 'OTP verified successfully.';
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log('Verify signup OTP error:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        data: error.response?.data,
        url: `${baseURL}/auth/verify-otp`,
      });
    }

    throw new Error(getAuthErrorMessage(error, 'OTP verification failed. Please try again.'));
  }
}

export async function requestPasswordResetOtp(payload: ForgotPasswordPayload): Promise<string> {
  const requestBody = {
    mobile: payload.mobile.trim(),
  };

  if (!requestBody.mobile) {
    throw new Error('Mobile number is required.');
  }

  console.log('Forgot password request:', {
    url: `${baseURL}/auth/forgot-password`,
    body: requestBody,
  });

  try {
    const { data } = await api.post<AuthMessageResponse>('/auth/forgot-password', requestBody);
    console.log('Forgot password response:', data);
    return data.message || 'OTP sent successfully.';
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log('Forgot password error:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        data: error.response?.data,
        url: `${baseURL}/auth/forgot-password`,
      });
    }

    throw new Error(getAuthErrorMessage(error, 'Failed to send OTP. Please try again.'));
  }
}

export async function verifyPasswordResetOtp(payload: VerifyResetOtpPayload): Promise<string> {
  const requestBody = {
    mobile: payload.mobile.trim(),
    otp: payload.otp.trim(),
  };

  if (!requestBody.mobile || !requestBody.otp) {
    throw new Error('Mobile number and OTP are required.');
  }

  console.log('Verify reset OTP request:', {
    url: `${baseURL}/auth/verify-reset-otp`,
    body: requestBody,
  });

  try {
    const { data } = await api.post<AuthMessageResponse>('/auth/verify-reset-otp', requestBody);
    console.log('Verify reset OTP response:', data);
    return data.message || 'OTP verified successfully.';
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log('Verify reset OTP error:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        data: error.response?.data,
        url: `${baseURL}/auth/verify-reset-otp`,
      });
    }

    throw new Error(getAuthErrorMessage(error, 'OTP verification failed. Please try again.'));
  }
}

type EditAgentDetailsPayload = {
  agent_id: number;
  full_name: string;
  email: string;
  phone_number: string;
};

type EditAgentDetailsResponse = {
  ok: boolean;
  message: string;
  data: AuthApiAgent;
};

export async function editAgentDetails(payload: EditAgentDetailsPayload): Promise<AuthUser> {
  console.log('Edit agent details request:', {
    url: `${baseURL}/agent/details/edit`,
    body: payload,
  });

  try {
    const { data } = await api.put<EditAgentDetailsResponse>('/agent/details/edit', payload);
    console.log('Edit agent details response:', data);
    return mapAgentToAuthUser(data.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log('Edit agent details error:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        data: error.response?.data,
        url: `${baseURL}/agent/details/edit`,
      });
    }
    throw new Error(getAuthErrorMessage(error, 'Failed to update profile. Please try again.'));
  }
}

type EditProfilePicResponse = {
  ok: boolean;
  message: string;
  agent?: AuthApiAgent;
  data?: AuthApiAgent;
};

export async function editAgentProfilePic(agentId: number, imageUri: string): Promise<AuthUser> {
  const filename = imageUri.split('/').pop() ?? 'profile.jpg';
  const ext = /\.(\w+)$/.exec(filename)?.[1] ?? 'jpg';

  const formData = new FormData();
  formData.append('profile_pic', { uri: imageUri, name: filename, type: `image/${ext}` } as unknown as Blob);
  formData.append('agent_id', String(agentId));

  console.log('Edit profile pic request:', { url: `${baseURL}/agent/profile-pic/edit`, agentId });

  try {
    const { data } = await api.put<EditProfilePicResponse>('/agent/profile-pic/edit', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    console.log('Edit profile pic response:', data);
    const agent = data.agent ?? data.data;
    if (!agent) throw new Error('Invalid response from server.');
    return mapAgentToAuthUser(agent);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log('Edit profile pic error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
    }
    throw new Error(getAuthErrorMessage(error, 'Failed to update profile picture. Please try again.'));
  }
}

export async function resetPasswordWithOtp(payload: ResetPasswordPayload): Promise<string> {
  const requestBody = {
    mobile: payload.mobile.trim(),
    newPassword: payload.newPassword,
    confirmPassword: payload.confirmPassword,
  };

  if (!requestBody.mobile || !requestBody.newPassword.trim() || !requestBody.confirmPassword.trim()) {
    throw new Error('Please complete all reset password fields.');
  }

  if (requestBody.newPassword !== requestBody.confirmPassword) {
    throw new Error('New password and confirm password must match.');
  }

  console.log('Reset password request:', {
    url: `${baseURL}/auth/reset-password`,
    body: {
      mobile: requestBody.mobile,
      newPassword: '***',
      confirmPassword: '***',
    },
  });

  try {
    const { data } = await api.post<AuthMessageResponse>('/auth/reset-password', requestBody);
    console.log('Reset password response:', data);
    return data.message || 'Password reset successful.';
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log('Reset password error:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        data: error.response?.data,
        url: `${baseURL}/auth/reset-password`,
      });
    }

    throw new Error(getAuthErrorMessage(error, 'Reset password failed. Please try again.'));
  }
}
