import type { LiveStreamResponse, LiveStream } from './types';

// Live stream functionality via YouTube integration
// These call the edge function when YouTube credentials are configured

export const startStream = async (poojaId: string): Promise<LiveStreamResponse> => {
  const { supabase } = await import('@/integrations/supabase/client');
  const { data, error } = await supabase.functions.invoke('live-stream', {
    body: { action: 'start', pooja_id: poojaId },
  });
  if (error) throw error;
  return data;
};

export const stopStream = async (poojaId: string): Promise<void> => {
  const { supabase } = await import('@/integrations/supabase/client');
  const { error } = await supabase.functions.invoke('live-stream', {
    body: { action: 'stop', pooja_id: poojaId },
  });
  if (error) throw error;
};

export const getMyStreams = async (): Promise<LiveStream[]> => {
  return [];
};
