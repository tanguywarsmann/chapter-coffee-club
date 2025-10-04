import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

function lastWeekBoundsUTC(nowUTC: Date, tz: string) {
  const local = new Date(nowUTC.toLocaleString("en-CA", { timeZone: tz }));
  const tzOffsetMs = local.getTime() - nowUTC.getTime();
  const dow = local.getDay(); // 0=Dim,1=Lun
  const monThis = new Date(local); monThis.setDate(monThis.getDate() - ((dow + 6) % 7)); monThis.setHours(0,0,0,0);
  const monLast = new Date(monThis); monLast.setDate(monLast.getDate() - 7);
  return {
    startUTC: new Date(monLast.getTime() - tzOffsetMs).toISOString(),
    endUTC:   new Date(monThis.getTime() - tzOffsetMs).toISOString(), // exclusif
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
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    console.log("Starting weekly digest job...");
    
    // Get all user settings with digest enabled
    const { data: settings, error: settingsError } = await supabase
      .from("user_settings")
      .select("user_id, tz, enable_digest, daily_push_cap");

    if (settingsError) {
      console.error("Error fetching settings:", settingsError);
      throw settingsError;
    }

    const nowUTC = new Date();
    let processedUsers = 0;
    let digestsSent = 0;

    for (const userSetting of settings || []) {
      if (!userSetting.enable_digest) continue;

      const tz = userSetting.tz || "Europe/Paris";
      
      try {
        // Get local time bounds and check if Monday 8AM
        const { startUTC, nextUTC, hour } = dayBoundsUTC(nowUTC, tz);
        const localTime = new Date(nowUTC.toLocaleString("en-CA", { timeZone: tz }));
        const dayOfWeek = localTime.getDay(); // 0 = Sunday, 1 = Monday

        // Only send on Monday at 8:00 AM local time
        if (dayOfWeek !== 1 || hour !== 8) {
          continue;
        }

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
        
        // Check if we already sent digest today
        const { count: existingDigest } = await supabase
          .from("notifications")
          .select("*", { count: "exact", head: true })
          .eq("recipient_id", userSetting.user_id)
          .eq("type", "weekly_digest")
          .gte("created_at", startUTC)
          .lt("created_at", nextUTC);

        if ((existingDigest || 0) > 0) {
          console.log(`Digest already sent today for user ${userSetting.user_id}`);
          continue;
        }

        // Calculate last week boundaries (Monday to Sunday)
        const { startUTC: weekStartUTC, endUTC: weekEndUTC } = lastWeekBoundsUTC(nowUTC, tz);

        // Get weekly stats
        
        // 1. Bookys received this week
        const { count: bookysReceived } = await supabase
          .from("notifications")
          .select("*", { count: "exact", head: true })
          .eq("recipient_id", userSetting.user_id)
          .eq("type", "booky_received")
          .gte("created_at", weekStartUTC)
          .lt("created_at", weekEndUTC);

        // 2. Validations this week
        const { count: validations } = await supabase
          .from("reading_validations")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userSetting.user_id)
          .gte("validated_at", weekStartUTC)
          .lt("validated_at", weekEndUTC);

        // 3. Active friends (followers who validated this week) - reliable approach
        const { data: followersData } = await supabase
          .from("followers")
          .select("following_id")
          .eq("follower_id", userSetting.user_id);

        const followingIds = followersData?.map(f => f.following_id) || [];
        let activeFriends = 0;

        if (followingIds.length > 0) {
          const { data: activeValidations } = await supabase
            .from("reading_validations")
            .select("user_id")
            .in("user_id", followingIds)
            .gte("validated_at", weekStartUTC)
            .lt("validated_at", weekEndUTC);

          activeFriends = new Set(activeValidations?.map(v => v.user_id) || []).size;
        }

        // Create digest meta
        const digestMeta = {
          bookys: bookysReceived || 0,
          validations: validations || 0,
          activeFriends: activeFriends,
          weekStart: weekStartUTC,
          weekEnd: weekEndUTC,
          msg: `Semaine VREAD. ${bookysReceived || 0} Bookys. ${validations || 0} validations. ${activeFriends} amis actifs.`
        };

        // Only send if there's some activity
        if ((bookysReceived || 0) > 0 || (validations || 0) > 0 || activeFriends > 0) {
          await supabase.from("notifications").insert({
            recipient_id: userSetting.user_id,
            type: "weekly_digest",
            meta: digestMeta
          });

          digestsSent++;
          console.log(`Sent weekly digest to user ${userSetting.user_id}: ${digestMeta.msg}`);
        }

        processedUsers++;
      } catch (userError) {
        console.error(`Error processing user ${userSetting.user_id}:`, userError);
      }
    }

    console.log(`Weekly digest completed: ${processedUsers} users processed, ${digestsSent} digests sent`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        processedUsers, 
        digestsSent 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        } 
      }
    );

  } catch (error) {
    console.error("Weekly digest error:", error);
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