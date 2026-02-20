import { invokeEdgeFunction } from '@/lib/lovableEdgeFunctions';

export const sendWhatsAppMessage = async (to: string, message: string): Promise<void> => {
  await invokeEdgeFunction('send-whatsapp', { to, message });
};

export interface WhatsAppWebhookPayload {
  from: string;
  message: string;
  timestamp: string;
  [key: string]: any;
}
