// WhatsApp notifications are sent via edge function

export const sendWhatsAppMessage = async (to: string, message: string): Promise<void> => {
  const { supabase } = await import('@/integrations/supabase/client');
  const { error } = await supabase.functions.invoke('send-whatsapp', {
    body: { to, message },
  });
  if (error) throw error;
};

export interface WhatsAppWebhookPayload {
  from: string;
  message: string;
  timestamp: string;
  [key: string]: any;
}
