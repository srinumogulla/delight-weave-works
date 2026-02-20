import { supabase } from '@/integrations/supabase/client';
import { invokeEdgeFunction } from '@/lib/lovableEdgeFunctions';
import type {
  ApiUser, ApiTemple, ApiPooja, CreatePoojaPayload, UpdatePoojaPayload, ApiTransaction, AdminAnalytics
} from './types';

// Users
export const getAdminUsers = async (): Promise<ApiUser[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*, user_roles(role)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((p: any) => ({
    id: p.id,
    full_name: p.full_name,
    email: p.email,
    phone: p.phone,
    role: p.user_roles?.[0]?.role ?? 'user',
    avatar_url: p.avatar_url,
    date_of_birth: p.date_of_birth,
    time_of_birth: p.time_of_birth ? String(p.time_of_birth) : null,
    birth_location: p.birth_location,
    gender: p.gender,
    gotra: p.gotra,
    nakshatra: p.nakshatra,
    rashi: p.rashi,
    created_at: p.created_at,
    updated_at: p.updated_at,
  }));
};

export const disableUser = async (userId: string): Promise<void> => {
  await invokeEdgeFunction('admin-operations', { action: 'disable_user', user_id: userId });
};

export const enableUser = async (userId: string): Promise<void> => {
  await invokeEdgeFunction('admin-operations', { action: 'enable_user', user_id: userId });
};

export const updateUserRole = async (userId: string, role: string): Promise<void> => {
  await invokeEdgeFunction('admin-operations', { action: 'update_role', user_id: userId, role });
};

// Temples
export const getAdminTemples = async (): Promise<ApiTemple[]> => {
  const { data, error } = await supabase
    .from('temples')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as ApiTemple[];
};

export const createAdminTemple = async (data: Partial<ApiTemple>): Promise<ApiTemple> => {
  const { data: created, error } = await supabase
    .from('temples')
    .insert(data as any)
    .select()
    .single();
  if (error) throw error;
  return created as ApiTemple;
};

export const updateAdminTemple = async (id: string, data: Partial<ApiTemple>): Promise<ApiTemple> => {
  const { data: updated, error } = await supabase
    .from('temples')
    .update(data as any)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return updated as ApiTemple;
};

export const deleteAdminTemple = async (id: string): Promise<void> => {
  const { error } = await supabase.from('temples').delete().eq('id', id);
  if (error) throw error;
};

// Poojas
export const getAdminPoojas = async (): Promise<ApiPooja[]> => {
  const { data, error } = await supabase
    .from('pooja_services')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as ApiPooja[];
};

export const createAdminPooja = async (data: CreatePoojaPayload): Promise<ApiPooja> => {
  const { data: created, error } = await supabase
    .from('pooja_services')
    .insert({ ...data, is_active: true })
    .select()
    .single();
  if (error) throw error;
  return created as ApiPooja;
};

export const updateAdminPooja = async (id: string, data: UpdatePoojaPayload): Promise<ApiPooja> => {
  const { data: updated, error } = await supabase
    .from('pooja_services')
    .update(data as any)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return updated as ApiPooja;
};

export const deleteAdminPooja = async (id: string): Promise<void> => {
  const { error } = await supabase.from('pooja_services').delete().eq('id', id);
  if (error) throw error;
};

// Transactions / Bookings
export const getAdminTransactions = async (): Promise<ApiTransaction[]> => {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, pooja_services(name), profiles(full_name, email, phone)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as ApiTransaction[];
};

// Analytics
export const getAdminAnalytics = async (): Promise<AdminAnalytics> => {
  const [usersRes, bookingsRes, templesRes, punditsRes, poojaRes, pendingBookingsRes, pendingPunditsRes, giftRes] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('bookings').select('amount'),
    supabase.from('temples').select('*', { count: 'exact', head: true }),
    supabase.from('pundits').select('*', { count: 'exact', head: true }),
    supabase.from('pooja_services').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('pundits').select('*', { count: 'exact', head: true }).eq('approval_status', 'pending'),
    supabase.from('gift_bookings').select('*', { count: 'exact', head: true }),
  ]);

  const totalRevenue = (bookingsRes.data ?? []).reduce((s, b) => s + (b.amount ?? 0), 0);

  return {
    total_users: usersRes.count ?? 0,
    total_bookings: (bookingsRes.data ?? []).length,
    total_revenue: totalRevenue,
    total_temples: templesRes.count ?? 0,
    total_gurus: punditsRes.count ?? 0,
    total_poojas: poojaRes.count ?? 0,
    pending_bookings: pendingBookingsRes.count ?? 0,
    pending_approvals: pendingPunditsRes.count ?? 0,
    gift_bookings: giftRes.count ?? 0,
  };
};

export const getAdminAnalyticsRevenue = async () => {
  const { data } = await supabase
    .from('bookings')
    .select('amount, created_at')
    .order('created_at');
  return data ?? [];
};

export const getAdminAnalyticsUsers = async () => {
  const { data } = await supabase
    .from('profiles')
    .select('created_at')
    .order('created_at');
  return data ?? [];
};

// Legacy stubs for dosha tags, mahavidyas, gift templates (not in DB yet)
export const getDoshaTags = async () => [];
export const createDoshaTag = async (data: any) => data;
export const updateDoshaTag = async (_id: string, data: any) => data;
export const deleteDoshaTag = async (_id: string) => {};
export const getMahavidyas = async () => [];
export const createMahavidya = async (data: any) => data;
export const updateMahavidya = async (_id: string, data: any) => data;
export const deleteMahavidya = async (_id: string) => {};
export const getGiftTemplates = async () => [];
export const createGiftTemplate = async (data: any) => data;
export const updateGiftTemplate = async (_id: string, data: any) => data;
export const deleteGiftTemplate = async (_id: string) => {};
