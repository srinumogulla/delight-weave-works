// Helper to call edge functions deployed on the Lovable Cloud project
// This is needed because the main supabase client points to the external production DB,
// but the edge functions (astrology, panchang, whatsapp, admin-ops) live here on Lovable Cloud.

const LOVABLE_FUNCTIONS_URL = 'https://uuunmenwafhrifatepjm.supabase.co/functions/v1';
const LOVABLE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1dW5tZW53YWZocmlmYXRlcGptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgxMDI3NjcsImV4cCI6MjA4MzY3ODc2N30.WnmMnMMN1Moro3Uzz31u91VNMmN2KDWeg1B7AGu-gWg';

export async function invokeEdgeFunction<T = any>(name: string, body?: object): Promise<T> {
  const res = await fetch(`${LOVABLE_FUNCTIONS_URL}/${name}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${LOVABLE_ANON_KEY}`,
      'apikey': LOVABLE_ANON_KEY,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`Edge function "${name}" error: ${res.status} ${text}`);
  }
  return res.json();
}
