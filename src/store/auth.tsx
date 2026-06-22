import * as FileSystem from 'expo-file-system/legacy';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { editAgentDetails, editAgentProfilePic, loginWithApi, signupWithApi } from '@/services/auth.service';
import type {
  AuthUser,
  LoginPayload,
  SignupPayload,
  UpdateBankDetailsPayload,
  UpdateProfilePayload,
} from '@/types/auth';

const SESSION_FILE = `${FileSystem.documentDirectory}session.json`;

async function saveSession(user: AuthUser) {
  await FileSystem.writeAsStringAsync(SESSION_FILE, JSON.stringify(user));
}

async function loadSession(): Promise<AuthUser | null> {
  try {
    const info = await FileSystem.getInfoAsync(SESSION_FILE);
    if (!info.exists) return null;
    const json = await FileSystem.readAsStringAsync(SESSION_FILE);
    return JSON.parse(json) as AuthUser;
  } catch {
    return null;
  }
}

async function clearSession() {
  try {
    await FileSystem.deleteAsync(SESSION_FILE, { idempotent: true });
  } catch {}
}

type AuthContextValue = {
  isAuthenticated: boolean;
  isInitializing: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  login: (payload: LoginPayload) => Promise<void>;
  signup: (payload: SignupPayload) => Promise<void>;
  updateProfile: (payload: UpdateProfilePayload) => Promise<void>;
  updateProfilePic: (imageUri: string) => Promise<void>;
  updateBankDetails: (payload: UpdateBankDetailsPayload) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    loadSession().then((savedUser) => {
      if (savedUser) setUser(savedUser);
      setIsInitializing(false);
    });
  }, []);

  async function login(payload: LoginPayload) {
    setIsLoading(true);

    try {
      const nextUser = await loginWithApi(payload);
      console.log("nextUser",nextUser)
      await saveSession(nextUser);
      setUser(nextUser);
    } finally {
      setIsLoading(false);
    }
  }

  async function signup(payload: SignupPayload) {
    setIsLoading(true);

    try {
      const nextUser = await signupWithApi(payload);
      await saveSession(nextUser);
      setUser(nextUser);
    } finally {
      setIsLoading(false);
    }
  }

  async function logout() {
    await clearSession();
    setUser(null);
  }

  async function updateProfile(payload: UpdateProfilePayload) {
    if (!user) return;

    const nextUser = await editAgentDetails({
      agent_id: user.id,
      fullName: payload.fullName.trim(),
      email: payload.email.trim().toLowerCase(),
      phoneNumber: payload.phone.trim(),
    });

    setUser(nextUser);
    await saveSession(nextUser);
  }

  async function updateProfilePic(imageUri: string) {
    if (!user) return;
    const nextUser = await editAgentProfilePic(user.id, imageUri);
    setUser(nextUser);
    await saveSession(nextUser);
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
      isInitializing,
      isLoading,
      user,
      login,
      signup,
      updateProfile,
      updateProfilePic,
      updateBankDetails,
      logout,
    }),
    [isInitializing, isLoading, user]
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
