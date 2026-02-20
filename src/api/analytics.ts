import { supabase } from '@/integrations/supabase/client';
import type { TrackEventPayload, AnalyticsEvent } from './types';

// Client-side event tracking (stored locally, can be sent to analytics service)
export const trackEvent = async (data: TrackEventPayload): Promise<void> => {
  // Log analytics events; integrate with external analytics if needed
  console.info('[Analytics]', data.event_type, data.event_data);
};

export const listEvents = async (): Promise<AnalyticsEvent[]> => {
  return [];
};

export const getAdminAnalyticsOverview = async () => {
  const [usersRes, bookingsRes, templesRes, punditsRes] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('bookings').select('amount'),
    supabase.from('temples').select('*', { count: 'exact', head: true }),
    supabase.from('pundits').select('*', { count: 'exact', head: true }),
  ]);

  const totalRevenue = (bookingsRes.data ?? []).reduce((s, b) => s + (b.amount ?? 0), 0);

  return {
    total_users: usersRes.count ?? 0,
    total_bookings: (bookingsRes.data ?? []).length,
    total_revenue: totalRevenue,
    total_temples: templesRes.count ?? 0,
    total_gurus: punditsRes.count ?? 0,
  };
};
