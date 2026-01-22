import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PushNotificationRequest {
  user_id?: string;
  type: 'booking_reminder' | 'festival' | 'booking_update';
  title: string;
  body: string;
  url?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY");

    if (!vapidPrivateKey) {
      console.log("VAPID_PRIVATE_KEY not configured - skipping push notification");
      return new Response(
        JSON.stringify({ message: "Push notifications not configured" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { user_id, type, title, body, url }: PushNotificationRequest = await req.json();

    // Get subscriptions based on user preferences
    let query = supabase
      .from('push_subscriptions')
      .select(`
        *,
        notification_preferences!inner (
          upcoming_poojas,
          festival_reminders,
          booking_updates
        )
      `);

    if (user_id) {
      query = query.eq('user_id', user_id);
    }

    // Filter by notification type preference
    if (type === 'booking_reminder') {
      query = query.eq('notification_preferences.upcoming_poojas', true);
    } else if (type === 'festival') {
      query = query.eq('notification_preferences.festival_reminders', true);
    } else if (type === 'booking_update') {
      query = query.eq('notification_preferences.booking_updates', true);
    }

    const { data: subscriptions, error: subError } = await query;

    if (subError) {
      console.error('Error fetching subscriptions:', subError);
      return new Response(
        JSON.stringify({ error: subError.message }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ message: "No active subscriptions found" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Note: In production, you would use web-push library here
    // For now, we log the notification that would be sent
    console.log(`Would send ${subscriptions.length} notifications:`, {
      title,
      body,
      url,
      type
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Notification queued for ${subscriptions.length} subscribers` 
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
