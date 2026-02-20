import { supabase } from '@/integrations/supabase/client';
import type { GiftOverview, GiftOccasion } from './types';

export const getGiftsOverview = async (): Promise<GiftOverview> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('gift_bookings')
    .select('occasion')
    .eq('user_id', user.id);

  if (error) throw error;

  const occasions = [...new Set((data ?? []).map(g => g.occasion).filter(Boolean))] as string[];
  return {
    total_gifts: (data ?? []).length,
    occasions,
  };
};

export const getGiftOccasions = async (): Promise<GiftOccasion[]> => {
  return [
    { id: 'birthday', name: 'Birthday' },
    { id: 'anniversary', name: 'Anniversary' },
    { id: 'festival', name: 'Festival' },
    { id: 'get-well', name: 'Get Well Soon' },
    { id: 'new-born', name: 'New Born' },
    { id: 'housewarming', name: 'Housewarming' },
    { id: 'other', name: 'Other' },
  ];
};

export const createGiftBooking = async (data: {
  service_id: string;
  recipient_name: string;
  recipient_email?: string;
  recipient_phone?: string;
  recipient_address?: string;
  occasion?: string;
  message?: string;
  amount?: number;
  send_prasadam?: boolean;
  gotra?: string;
}) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: booking, error } = await supabase
    .from('gift_bookings')
    .insert({
      user_id: user.id,
      service_id: data.service_id,
      booking_date: new Date().toISOString().split('T')[0],
      ...data,
    })
    .select()
    .single();

  if (error) throw error;
  return booking;
};

export const getMyGiftBookings = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('gift_bookings')
    .select('*, pooja_services(name, image_url)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
};

// Legacy stubs
export const addPoojaOccasion = async () => {};
export const removePoojaOccasion = async () => {};
export const getPresignedUploadUrl = async () => ({ upload_url: '', file_url: '' });
