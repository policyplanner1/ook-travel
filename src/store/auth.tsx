import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import { loginWithApi, signupWithApi } from '@/services/auth.service';
import type {
  AuthUser,
  LoginPayload,
  SignupPayload,
  UpdateBankDetailsPayload,
  UpdateProfilePayload,
} from '@/types/auth';

type AuthContextValue = {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  login: (payload: LoginPayload) => Promise<void>;
  signup: (payload: SignupPayload) => Promise<void>;
  updateProfile: (payload: UpdateProfilePayload) => void;
  updateBankDetails: (payload: UpdateBankDetailsPayload) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function login(payload: LoginPayload) {
    setIsLoading(true);

    try {
      const nextUser = await loginWithApi(payload);
      console.log("nextUser",nextUser)
      setUser(nextUser);
    } finally {
      setIsLoading(false);
    }
  }

  async function signup(payload: SignupPayload) {
    setIsLoading(true);

    try {
      const nextUser = await signupWithApi(payload);
      setUser(nextUser);
    } finally {
      setIsLoading(false);
    }
  }

  function logout() {
    setUser(null);
  }

  function updateProfile(payload: UpdateProfilePayload) {
    setUser((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        fullName: payload.fullName.trim(),
        email: payload.email.trim().toLowerCase(),
        phone: payload.phone.trim(),
        profileImageUri: payload.profileImageUri,
      };
    });
  }

  function updateBankDetails(payload: UpdateBankDetailsPayload) {
    setUser((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        bankDetails: {
          accountHolderName: payload.accountHolderName.trim(),
          bankName: payload.bankName.trim(),
          accountNumber: payload.accountNumber.trim(),
          ifscCode: payload.ifscCode.trim().toUpperCase(),
          branchName: payload.branchName.trim(),
          panCardNumber: payload.panCardNumber.trim().toUpperCase(),
        },
      };
    });
  }

  const value = useMemo(
    () => ({
      isAuthenticated: Boolean(user),
      isLoading,
      user,
      login,
      signup,
      updateProfile,
      updateBankDetails,
      logout,
    }),
    [isLoading, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
