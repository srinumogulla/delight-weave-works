import { supabase } from '@/integrations/supabase/client';
import type { ApiGuru, CreateGuruPayload, GuruAnalytics, GuruEarnings } from './types';

export const listGurus = async (): Promise<ApiGuru[]> => {
  const { data, error } = await supabase
    .from('pundits')
    .select('*')
    .eq('is_active', true)
    .eq('approval_status', 'approved')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as ApiGuru[];
};

export const getMyGuruProfile = async (): Promise<ApiGuru> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('pundits')
    .select('*')
    .eq('user_id', user.id)
    .single();
  if (error) throw error;
  return data as ApiGuru;
};

export const createGuruProfile = async (data: CreateGuruPayload): Promise<ApiGuru> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: created, error } = await supabase
    .from('pundits')
    .insert({ ...data, user_id: user.id, approval_status: 'pending' })
    .select()
    .single();
  if (error) throw error;
  return created as ApiGuru;
};

export const updateGuruProfile = async (data: Partial<ApiGuru>): Promise<ApiGuru> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: updated, error } = await supabase
    .from('pundits')
    .update(data)
    .eq('user_id', user.id)
    .select()
    .single();
  if (error) throw error;
  return updated as ApiGuru;
};

export const getGuruAnalytics = async (): Promise<GuruAnalytics> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: pundit } = await supabase
    .from('pundits')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!pundit) return { total_poojas: 0, total_bookings: 0, total_earnings: 0, rating: 0 };

  const { count: bookingCount } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('assigned_pundit_id', pundit.id);

  const { data: earnings } = await supabase
    .from('bookings')
    .select('amount')
    .eq('assigned_pundit_id', pundit.id)
    .eq('payment_status', 'paid');

  const totalEarnings = (earnings ?? []).reduce((sum, b) => sum + (b.amount ?? 0), 0);

  return {
    total_poojas: 0,
    total_bookings: bookingCount ?? 0,
    total_earnings: totalEarnings,
    rating: 0,
  };
};

export const getGuruEarnings = async (): Promise<GuruEarnings> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: pundit } = await supabase
    .from('pundits')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!pundit) return { total: 0, pending: 0, paid: 0, history: [] };

  const { data: bookings } = await supabase
    .from('bookings')
    .select('id, amount, payment_status, booking_date, service_id, pooja_services(name)')
    .eq('assigned_pundit_id', pundit.id)
    .order('booking_date', { ascending: false });

  const rows = bookings ?? [];
  const total = rows.reduce((s, b) => s + (b.amount ?? 0), 0);
  const paid = rows.filter(b => b.payment_status === 'paid').reduce((s, b) => s + (b.amount ?? 0), 0);
  const pending = rows.filter(b => b.payment_status !== 'paid').reduce((s, b) => s + (b.amount ?? 0), 0);
  const history = rows.map(b => ({
    date: b.booking_date,
    amount: b.amount ?? 0,
    pooja_name: (b.pooja_services as any)?.name ?? 'Pooja',
    status: b.payment_status ?? 'pending',
  }));

  return { total, pending, paid, history };
};
