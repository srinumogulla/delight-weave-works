import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

const SUPABASE_URL = 'https://thogujcdmhlalroftpmi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRob2d1amNkbWhsYWxyb2Z0cG1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3MjAxNDYsImV4cCI6MjA4MzI5NjE0Nn0.sIiIknYtewJwmYzmAa4Kzdi1Oo5rnUNXC2vvo-xwY70';

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
