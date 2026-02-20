import { supabase } from '@/lib/supabase';
import type { ApiUser } from './types';

export const getMe = async (): Promise<ApiUser> => {
  const { data: { user: supabaseUser } } = await supabase.auth.getUser();
  if (!supabaseUser) throw new Error('Not authenticated');

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', supabaseUser.id)
    .single();

  if (error) throw error;

  const { data: roleRow } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', supabaseUser.id)
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
};

export const updateMe = async (data: Partial<ApiUser>): Promise<ApiUser> => {
  const { data: { user: supabaseUser } } = await supabase.auth.getUser();
  if (!supabaseUser) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: data.full_name,
      phone: data.phone,
      date_of_birth: data.date_of_birth,
      time_of_birth: data.time_of_birth,
      birth_location: data.birth_location,
      gender: data.gender,
      gotra: data.gotra,
      nakshatra: data.nakshatra,
      rashi: data.rashi,
      avatar_url: data.avatar_url,
    })
    .eq('id', supabaseUser.id);

  if (error) throw error;
  return getMe();
};
