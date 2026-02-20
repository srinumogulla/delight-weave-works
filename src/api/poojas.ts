import { supabase } from '@/lib/supabase';
import type { ApiPooja, CreatePoojaPayload, UpdatePoojaPayload, SchedulePayload } from './types';

export const listPoojas = async (): Promise<ApiPooja[]> => {
  const { data, error } = await supabase
    .from('pooja_services')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as ApiPooja[];
};

export const getPoojaById = async (id: string): Promise<ApiPooja> => {
  const { data, error } = await supabase
    .from('pooja_services')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as ApiPooja;
};

export const createPooja = async (data: CreatePoojaPayload): Promise<ApiPooja> => {
  const { data: created, error } = await supabase
    .from('pooja_services')
    .insert({ ...data, is_active: true })
    .select()
    .single();
  if (error) throw error;
  return created as ApiPooja;
};

export const updatePooja = async (id: string, data: UpdatePoojaPayload): Promise<ApiPooja> => {
  const { data: updated, error } = await supabase
    .from('pooja_services')
    .update(data)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return updated as ApiPooja;
};

export const deletePooja = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('pooja_services')
    .update({ is_active: false })
    .eq('id', id);
  if (error) throw error;
};

export const reschedulePooja = async (id: string, data: SchedulePayload): Promise<ApiPooja> => {
  return updatePooja(id, data);
};

export const uploadPoojaImage = async (id: string, file: File): Promise<{ image_url: string }> => {
  const ext = file.name.split('.').pop();
  const path = `pooja-images/${id}.${ext}`;
  const { error: uploadError } = await supabase.storage
    .from('pundit-photos')
    .upload(path, file, { upsert: true });
  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage.from('pundit-photos').getPublicUrl(path);
  await supabase.from('pooja_services').update({ image_url: publicUrl }).eq('id', id);
  return { image_url: publicUrl };
};

export const getPoojaRegistrations = async (id: string) => {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, profiles(full_name, email)')
    .eq('service_id', id);
  if (error) throw error;
  return data ?? [];
};

export const publishPoojaLink = async (id: string, data: { link: string }) => {
  return updatePooja(id, data as any);
};

export const notifyPoojaLink = async (_id: string) => {
  // Will be handled via WhatsApp edge function when configured
  return { message: 'Notifications queued' };
};
