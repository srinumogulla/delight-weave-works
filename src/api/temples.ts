import { supabase } from '@/lib/supabase';
import type { ApiTemple, ApiPooja, CreatePoojaPayload, UpdatePoojaPayload, TempleAnalytics } from './types';

export const listTemples = async (): Promise<ApiTemple[]> => {
  const { data, error } = await supabase
    .from('temples')
    .select('*')
    .eq('is_active', true)
    .order('name');
  if (error) throw error;
  return (data ?? []) as ApiTemple[];
};

export const getTempleById = async (id: string): Promise<ApiTemple> => {
  const { data, error } = await supabase
    .from('temples')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as ApiTemple;
};

export const getMyTempleProfile = async (): Promise<ApiTemple> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('temples')
    .select('*')
    .eq('user_id', user.id)
    .single();
  if (error) throw error;
  return data as ApiTemple;
};

export const listTemplePoojas = async (): Promise<ApiPooja[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: temple } = await supabase
    .from('temples')
    .select('name')
    .eq('user_id', user.id)
    .single();

  if (!temple) return [];

  const { data, error } = await supabase
    .from('pooja_services')
    .select('*')
    .eq('temple', temple.name);
  if (error) throw error;
  return (data ?? []) as ApiPooja[];
};

export const createTemplePooja = async (data: CreatePoojaPayload): Promise<ApiPooja> => {
  const { data: created, error } = await supabase
    .from('pooja_services')
    .insert({ ...data, is_active: true })
    .select()
    .single();
  if (error) throw error;
  return created as ApiPooja;
};

export const updateTemplePooja = async (id: string, data: UpdatePoojaPayload): Promise<ApiPooja> => {
  const { data: updated, error } = await supabase
    .from('pooja_services')
    .update(data)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return updated as ApiPooja;
};

export const deleteTemplePooja = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('pooja_services')
    .update({ is_active: false })
    .eq('id', id);
  if (error) throw error;
};

export const publishTemplePoojaLink = async (id: string, data: { link: string }): Promise<ApiPooja> => {
  return updateTemplePooja(id, data as any);
};

export const getTempleAnalytics = async (): Promise<TempleAnalytics> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: temple } = await supabase
    .from('temples')
    .select('name')
    .eq('user_id', user.id)
    .single();

  if (!temple) return { total_poojas: 0, total_bookings: 0, total_revenue: 0 };

  const { data: poojas } = await supabase
    .from('pooja_services')
    .select('id')
    .eq('temple', temple.name);

  const poojaIds = (poojas ?? []).map(p => p.id);

  let totalRevenue = 0;
  let totalBookings = 0;

  if (poojaIds.length > 0) {
    const { data: bookings } = await supabase
      .from('bookings')
      .select('amount')
      .in('service_id', poojaIds);
    totalBookings = (bookings ?? []).length;
    totalRevenue = (bookings ?? []).reduce((s, b) => s + (b.amount ?? 0), 0);
  }

  return {
    total_poojas: poojaIds.length,
    total_bookings: totalBookings,
    total_revenue: totalRevenue,
  };
};
