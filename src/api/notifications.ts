import { supabase } from '@/lib/supabase';

export interface NotificationPreferences {
  id?: string;
  upcoming_poojas: boolean;
  festival_reminders: boolean;
  booking_updates: boolean;
}

export const getNotificationPreferences = async (): Promise<NotificationPreferences> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('notification_preferences')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) throw error;

  if (!data) {
    // Create default preferences
    const { data: created, error: insertError } = await supabase
      .from('notification_preferences')
      .insert({
        user_id: user.id,
        upcoming_poojas: true,
        festival_reminders: true,
        booking_updates: true,
      })
      .select()
      .single();
    if (insertError) throw insertError;
    return created;
  }

  return data;
};

export const updateNotificationPreferences = async (prefs: Partial<NotificationPreferences>): Promise<NotificationPreferences> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('notification_preferences')
    .upsert({ user_id: user.id, ...prefs })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Legacy compatibility
export const getNotifications = async () => [];
export const getUnreadCount = async () => ({ count: 0 });
export const markRead = async (_id: string) => {};
export const markAllRead = async () => {};
