import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { login as apiLogin, signup as apiSignup, sendMobileCode as apiSendCode, verifyMobileCode as apiVerifyCode } from '@/integrations/vedhaApi/auth';
import { getMe } from '@/integrations/vedhaApi/users';
import type { ApiUser, SignupPayload } from '@/integrations/vedhaApi/types';

interface AuthContextType {
  user: ApiUser | null;
  role: string | null;
  loading: boolean;
  isAdmin: boolean;
  signUp: (data: SignupPayload) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithMobile: (phone: string, code: string) => Promise<{ error: Error | null }>;
  sendMobileCode: (phone: string) => Promise<{ error: Error | null }>;
  signOut: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = role === 'admin';

  const fetchUser = async () => {
    try {
      const userData = await getMe();
      setUser(userData);
      setRole(userData.role || 'user');
    } catch {
      // Token invalid or expired
      localStorage.removeItem('access_token');
      setUser(null);
      setRole(null);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      fetchUser().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const signUp = async (data: SignupPayload) => {
    try {
      const res = await apiSignup(data);
      localStorage.setItem('access_token', res.access_token);
      await fetchUser();
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const res = await apiLogin({ email, password });
      localStorage.setItem('access_token', res.access_token);
      await fetchUser();
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const sendMobileCode = async (phone: string) => {
    try {
      await apiSendCode({ phone });
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signInWithMobile = async (phone: string, code: string) => {
    try {
      const res = await apiVerifyCode({ phone, code });
      localStorage.setItem('access_token', res.access_token);
      await fetchUser();
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = () => {
    localStorage.removeItem('access_token');
    setUser(null);
    setRole(null);
  };

  const refreshProfile = async () => {
    if (localStorage.getItem('access_token')) {
      await fetchUser();
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      role,
      loading,
      isAdmin,
      signUp,
      signIn,
      signInWithMobile,
      sendMobileCode,
      signOut,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
