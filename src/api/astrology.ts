import { supabase } from '@/integrations/supabase/client';
import type { KundaliRequest, KundaliApiResponse, KundaliMatchingRequest, KundaliMatchingApiResponse } from './types';

export async function generateKundali(data: KundaliRequest): Promise<KundaliApiResponse> {
  const { data: result, error } = await supabase.functions.invoke('astrology', {
    body: { action: 'kundali', ...data },
  });
  if (error) throw error;
  return result;
}

export async function getKundaliMatching(data: KundaliMatchingRequest): Promise<KundaliMatchingApiResponse> {
  const { data: result, error } = await supabase.functions.invoke('astrology', {
    body: { action: 'kundali-matching', ...data },
  });
  if (error) throw error;
  return result;
}
