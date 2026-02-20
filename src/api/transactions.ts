import { supabase } from '@/lib/supabase';
import type { CreateTransactionPayload, ApiTransaction } from './types';

export const createTransaction = async (data: CreateTransactionPayload): Promise<ApiTransaction> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: booking, error } = await supabase
    .from('bookings')
    .insert({
      user_id: user.id,
      service_id: data.pooja_id,
      amount: data.amount,
      booking_date: data.booking_date ?? new Date().toISOString().split('T')[0],
      sankalpa_name: data.sankalpa_name ?? '',
      gotra: data.gotra,
      nakshatra: data.nakshatra,
      special_requests: data.special_requests,
      time_slot: data.time_slot,
      status: 'pending',
      payment_status: 'unpaid',
    })
    .select()
    .single();

  if (error) throw error;
  return booking as unknown as ApiTransaction;
};

export const getMyTransactions = async (): Promise<ApiTransaction[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('bookings')
    .select('*, pooja_services(name, image_url)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as ApiTransaction[];
};

export const getMyBookings = getMyTransactions;
