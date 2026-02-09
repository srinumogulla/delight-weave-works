// WhatsApp webhook endpoints are server-side only.
// These types are provided for reference.

export interface WhatsAppWebhookPayload {
  from: string;
  message: string;
  timestamp: string;
  [key: string]: any;
}

// The webhook verify (GET /webhooks/whatsapp) and receive (POST /webhooks/whatsapp)
// are handled by the external API server, not the frontend.
