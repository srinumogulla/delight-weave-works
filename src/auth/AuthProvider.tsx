import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { ApiUser, SignupPayload } from '@/api/types';

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

async function fetchProfile(userId: string): Promise<ApiUser | null> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (!profile) return null;

  const { data: roleRow } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .maybeSingle();

  return {
    id: profile.id,
    full_name: profile.full_name,
    email: profile.email,
    phone: profile.phone,
    role: roleRow?.role ?? 'user',
    avatar_url: profile.avatar_url,
    date_of_birth: profile.date_of_birth,
    time_of_birth: profile.time_of_birth ? String(profile.time_of_birth) : null,
    birth_location: profile.birth_location,
    gender: profile.gender,
    gotra: profile.gotra,
    nakshatra: profile.nakshatra,
    rashi: profile.rashi,
    created_at: profile.created_at,
    updated_at: profile.updated_at,
  };
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = role === 'admin';

  const loadUser = async (supabaseUser: User | null) => {
    if (!supabaseUser) {
      setUser(null);
      setRole(null);
      return;
    }
    const profile = await fetchProfile(supabaseUser.id);
    if (profile) {
      setUser(profile);
      setRole(profile.role);
    }
  };

  useEffect(() => {
    // Set up auth state listener BEFORE getting session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        await loadUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      loadUser(session?.user ?? null).finally(() => setLoading(false));
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (data: SignupPayload) => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: { full_name: data.full_name },
          emailRedirectTo: window.location.origin,
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Signup failed');

      const userId = authData.user.id;

      // Update profile with extra fields (trigger creates the base row)
      const profileUpdate: Record<string, any> = {
        full_name: data.full_name,
        email: data.email,
        phone: data.phone || null,
      };
      if (data.date_of_birth) profileUpdate.date_of_birth = data.date_of_birth;
      if (data.time_of_birth) profileUpdate.time_of_birth = data.time_of_birth;
      if (data.birth_place_name) profileUpdate.birth_location = data.birth_place_name;
      if (data.gender) profileUpdate.gender = data.gender;

      await supabase.from('profiles').upsert({ id: userId, ...profileUpdate });

      // Insert role
      const role = (data.role === 'pundit' ? 'pundit' : 'user') as 'pundit' | 'user';
      await supabase.from('user_roles').insert({ user_id: userId, role });

      // If pundit, create pundits record
      if (data.role === 'pundit') {
        await supabase.from('pundits').insert({
          user_id: userId,
          name: data.full_name,
          approval_status: 'pending',
          is_active: false,
        });
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const sendMobileCode = async (phone: string) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({ phone });
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signInWithMobile = async (phone: string, code: string) => {
    try {
      const { error } = await supabase.auth.verifyOtp({ phone, token: code, type: 'sms' });
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
  };

  const refreshProfile = async () => {
    const { data: { user: supabaseUser } } = await supabase.auth.getUser();
    if (supabaseUser) await loadUser(supabaseUser);
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
