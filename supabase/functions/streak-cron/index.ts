import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    console.log("Starting streak cron job...");
    
    // Get all user settings with streak notifications enabled
    const { data: settings, error: settingsError } = await supabase
      .from("user_settings")
      .select("user_id, tz, nudge_hour, enable_streak, daily_push_cap, quiet_start, quiet_end");

    if (settingsError) {
      console.error("Error fetching settings:", settingsError);
      throw settingsError;
    }

    const nowUTC = new Date();
    let processedUsers = 0;
    let notifications = 0;

    for (const userSetting of settings || []) {
      if (!userSetting.enable_streak) continue;

      const tz = userSetting.tz || "Europe/Paris";
      
      try {
        // Get local time for user's timezone
        const localTime = new Date(nowUTC.toLocaleString("en-CA", { timeZone: tz }));
        const currentHour = localTime.getHours();
        
        // Get day strings for today and yesterday in local timezone
        const today = localTime.toISOString().slice(0, 10);
        const yesterday = new Date(localTime);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().slice(0, 10);

        // Check daily notification cap
        const { count: dailyCount } = await supabase
          .from("notifications")
          .select("*", { count: "exact", head: true })
          .eq("recipient_id", userSetting.user_id)
          .gte("created_at", `${today}T00:00:00Z`);

        const dailyCap = userSetting.daily_push_cap || 3;
        if ((dailyCount || 0) >= dailyCap) {
          console.log(`User ${userSetting.user_id} reached daily cap (${dailyCap})`);
          continue;
        }

        // Check quiet hours
        const quietStart = userSetting.quiet_start || 22;
        const quietEnd = userSetting.quiet_end || 8;
        const isQuietTime = (quietStart > quietEnd) 
          ? (currentHour >= quietStart || currentHour < quietEnd)
          : (currentHour >= quietStart && currentHour < quietEnd);

        if (isQuietTime) {
          console.log(`User ${userSetting.user_id} in quiet hours (${quietStart}-${quietEnd})`);
          continue;
        }

        // Morning check at 8:00 - streak status
        if (currentHour === 8) {
          // Check yesterday's validations
          const { count: yesterdayValidations } = await supabase
            .from("reading_validations")
            .select("*", { count: "exact", head: true })
            .eq("user_id", userSetting.user_id)
            .gte("validated_at", `${yesterdayStr}T00:00:00Z`)
            .lt("validated_at", `${today}T00:00:00Z`);

          const hasYesterdayValidation = (yesterdayValidations || 0) > 0;
          const notificationType = hasYesterdayValidation ? "streak_kept" : "streak_lost";

          // Check if we already sent this notification today
          const { count: existingMorningNotif } = await supabase
            .from("notifications")
            .select("*", { count: "exact", head: true })
            .eq("recipient_id", userSetting.user_id)
            .eq("type", notificationType)
            .gte("created_at", `${today}T00:00:00Z`);

          if ((existingMorningNotif || 0) === 0) {
            await supabase.from("notifications").insert({
              recipient_id: userSetting.user_id,
              type: notificationType,
              meta: { 
                kept: hasYesterdayValidation,
                msg: hasYesterdayValidation ? "Série maintenue. Continue." : "Série interrompue. On relance ce soir."
              }
            });
            notifications++;
            console.log(`Sent ${notificationType} notification to user ${userSetting.user_id}`);
          }
        }

        // Evening nudge at configured hour
        const nudgeHour = userSetting.nudge_hour || 20;
        if (currentHour === nudgeHour) {
          // Check today's validations
          const { count: todayValidations } = await supabase
            .from("reading_validations")
            .select("*", { count: "exact", head: true })
            .eq("user_id", userSetting.user_id)
            .gte("validated_at", `${today}T00:00:00Z`);

          const hasTodayValidation = (todayValidations || 0) > 0;

          if (!hasTodayValidation) {
            // Check if we already sent nudge today
            const { count: existingNudge } = await supabase
              .from("notifications")
              .select("*", { count: "exact", head: true })
              .eq("recipient_id", userSetting.user_id)
              .eq("type", "streak_nudge")
              .gte("created_at", `${today}T00:00:00Z`);

            if ((existingNudge || 0) === 0) {
              await supabase.from("notifications").insert({
                recipient_id: userSetting.user_id,
                type: "streak_nudge",
                meta: { 
                  msg: "Tu n'as pas validé aujourd'hui. Garde ta série."
                }
              });
              notifications++;
              console.log(`Sent streak nudge to user ${userSetting.user_id}`);
            }
          }
        }

        processedUsers++;
      } catch (userError) {
        console.error(`Error processing user ${userSetting.user_id}:`, userError);
      }
    }

    console.log(`Streak cron completed: ${processedUsers} users processed, ${notifications} notifications sent`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        processedUsers, 
        notificationsSent: notifications 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        } 
      }
    );

  } catch (error) {
    console.error("Streak cron error:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message 
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        } 
      }
    );
  }
});