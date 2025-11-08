import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

function dayBoundsUTC(nowUTC: Date, tz: string) {
  const local = new Date(nowUTC.toLocaleString("en-CA", { timeZone: tz }));
  const tzOffsetMs = local.getTime() - nowUTC.getTime();
  const startLocal = new Date(local); startLocal.setHours(0,0,0,0);
  const nextLocal  = new Date(startLocal); nextLocal.setDate(nextLocal.getDate()+1);
  return {
    startUTC: new Date(startLocal.getTime() - tzOffsetMs).toISOString(),
    nextUTC:  new Date(nextLocal.getTime()  - tzOffsetMs).toISOString(),
    hour: local.getHours(),
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const resend = new Resend(resendApiKey);
    
    console.log("Starting streak cron job...");
    
    // Get all user settings with streak notifications enabled + user email
    const { data: settings, error: settingsError } = await supabase
      .from("user_settings")
      .select("user_id, tz, nudge_hour, enable_streak, daily_push_cap, quiet_start, quiet_end, profiles!inner(email)");

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
        // Get local time bounds and hour
        const { startUTC, nextUTC, hour } = dayBoundsUTC(nowUTC, tz);
        const yStartUTC = new Date(new Date(startUTC).getTime() - 24*3600e3).toISOString();

        // Check daily notification cap
        const { count: dailyCount } = await supabase
          .from("notifications")
          .select("*", { count: "exact", head: true })
          .eq("recipient_id", userSetting.user_id)
          .gte("created_at", startUTC)
          .lt("created_at", nextUTC);

        const dailyCap = userSetting.daily_push_cap || 3;
        if ((dailyCount || 0) >= dailyCap) {
          console.log(`User ${userSetting.user_id} reached daily cap (${dailyCap})`);
          continue;
        }

        // Check quiet hours
        const quietStart = userSetting.quiet_start || 22;
        const quietEnd = userSetting.quiet_end || 8;
        const isQuietTime = (quietStart > quietEnd) 
          ? (hour >= quietStart || hour < quietEnd)
          : (hour >= quietStart && hour < quietEnd);

        if (isQuietTime) {
          console.log(`User ${userSetting.user_id} in quiet hours (${quietStart}-${quietEnd})`);
          continue;
        }

        // Morning check at 8:00 - streak status
        if (hour === 8) {
          // Check yesterday's validations
          const { count: yesterdayValidations } = await supabase
            .from("reading_validations")
            .select("*", { count: "exact", head: true })
            .eq("user_id", userSetting.user_id)
            .gte("validated_at", yStartUTC)
            .lt("validated_at", startUTC);

          const hasYesterdayValidation = (yesterdayValidations || 0) > 0;
          const notificationType = hasYesterdayValidation ? "streak_kept" : "streak_lost";

          // Check if we already sent this notification today
          const { count: existingMorningNotif } = await supabase
            .from("notifications")
            .select("*", { count: "exact", head: true })
            .eq("recipient_id", userSetting.user_id)
            .eq("type", notificationType)
            .gte("created_at", startUTC)
            .lt("created_at", nextUTC);

          if ((existingMorningNotif || 0) === 0) {
            const msg = hasYesterdayValidation ? "Série maintenue. Continue." : "Série interrompue. On relance ce soir.";
            
            await supabase.from("notifications").insert({
              recipient_id: userSetting.user_id,
              type: notificationType,
              meta: { kept: hasYesterdayValidation, msg }
            });

            // Send email
            const userEmail = (userSetting as any).profiles?.email;
            if (userEmail) {
              try {
                await resend.emails.send({
                  from: "V-READ <notifications@vread.fr>",
                  to: [userEmail],
                  subject: hasYesterdayValidation ? "🔥 Série maintenue !" : "📚 On repart ce soir ?",
                  html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                      <h2 style="color: #333;">${hasYesterdayValidation ? "🔥 Bravo !" : "📚 Ta série..."}</h2>
                      <p style="font-size: 16px; color: #666;">${msg}</p>
                      <a href="https://v-read.fr" style="display: inline-block; margin-top: 20px; padding: 12px 24px; background: #000; color: #fff; text-decoration: none; border-radius: 8px;">
                        Ouvrir V-READ
                      </a>
                    </div>
                  `
                });
                console.log(`Sent ${notificationType} email to ${userEmail}`);
              } catch (emailError) {
                console.error(`Email error for ${userEmail}:`, emailError);
              }
            }
            
            notifications++;
            console.log(`Sent ${notificationType} notification to user ${userSetting.user_id}`);
          }
        }

        // Evening nudge at configured hour
        const nudgeHour = userSetting.nudge_hour || 20;
        if (hour === nudgeHour) {
          // Check today's validations
          const { count: todayValidations } = await supabase
            .from("reading_validations")
            .select("*", { count: "exact", head: true })
            .eq("user_id", userSetting.user_id)
            .gte("validated_at", startUTC)
            .lt("validated_at", nextUTC);

          const hasTodayValidation = (todayValidations || 0) > 0;

          if (!hasTodayValidation) {
            // Check if we already sent nudge today
            const { count: existingNudge } = await supabase
              .from("notifications")
              .select("*", { count: "exact", head: true })
              .eq("recipient_id", userSetting.user_id)
              .eq("type", "streak_nudge")
              .gte("created_at", startUTC)
              .lt("created_at", nextUTC);

            if ((existingNudge || 0) === 0) {
              const msg = "Tu n'as pas validé aujourd'hui. Garde ta série.";
              
              await supabase.from("notifications").insert({
                recipient_id: userSetting.user_id,
                type: "streak_nudge",
                meta: { msg }
              });

              // Send email
              const userEmail = (userSetting as any).profiles?.email;
              if (userEmail) {
                try {
                  await resend.emails.send({
                    from: "V-READ <notifications@vread.fr>",
                    to: [userEmail],
                    subject: "⏰ N'oublie pas ta lecture !",
                    html: `
                      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h2 style="color: #333;">⏰ Rappel lecture</h2>
                        <p style="font-size: 16px; color: #666;">${msg}</p>
                        <a href="https://v-read.fr" style="display: inline-block; margin-top: 20px; padding: 12px 24px; background: #000; color: #fff; text-decoration: none; border-radius: 8px;">
                          Valider maintenant
                        </a>
                      </div>
                    `
                  });
                  console.log(`Sent nudge email to ${userEmail}`);
                } catch (emailError) {
                  console.error(`Email error for ${userEmail}:`, emailError);
                }
              }
              
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