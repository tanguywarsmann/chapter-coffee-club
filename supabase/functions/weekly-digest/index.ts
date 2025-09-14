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
        // Get local time for user's timezone
        const localTime = new Date(nowUTC.toLocaleString("en-CA", { timeZone: tz }));
        const currentHour = localTime.getHours();
        const dayOfWeek = localTime.getDay(); // 0 = Sunday, 1 = Monday

        // Only send on Monday at 8:00 AM local time
        if (dayOfWeek !== 1 || currentHour !== 8) {
          continue;
        }

        const today = localTime.toISOString().slice(0, 10);
        
        // Check if we already sent digest today
        const { count: existingDigest } = await supabase
          .from("notifications")
          .select("*", { count: "exact", head: true })
          .eq("recipient_id", userSetting.user_id)
          .eq("type", "weekly_digest")
          .gte("created_at", `${today}T00:00:00Z`);

        if ((existingDigest || 0) > 0) {
          console.log(`Digest already sent today for user ${userSetting.user_id}`);
          continue;
        }

        // Calculate week boundaries (Monday to Sunday)
        const weekStart = new Date(localTime);
        weekStart.setDate(weekStart.getDate() - 7); // Last Monday
        weekStart.setHours(0, 0, 0, 0);
        
        const weekEnd = new Date(localTime);
        weekEnd.setDate(weekEnd.getDate() - 1); // Yesterday (Sunday)
        weekEnd.setHours(23, 59, 59, 999);

        const weekStartISO = weekStart.toISOString();
        const weekEndISO = weekEnd.toISOString();

        // Get weekly stats
        
        // 1. Lauriers received this week
        const { count: lauriersReceived } = await supabase
          .from("notifications")
          .select("*", { count: "exact", head: true })
          .eq("recipient_id", userSetting.user_id)
          .eq("type", "laurier_received")
          .gte("created_at", weekStartISO)
          .lte("created_at", weekEndISO);

        // 2. Validations this week
        const { count: validations } = await supabase
          .from("reading_validations")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userSetting.user_id)
          .gte("validated_at", weekStartISO)
          .lte("validated_at", weekEndISO);

        // 3. Active friends (followers who validated this week)
        const { data: activeFriendsData } = await supabase
          .from("followers")
          .select(`
            following_id,
            reading_validations!inner(validated_at)
          `)
          .eq("follower_id", userSetting.user_id)
          .gte("reading_validations.validated_at", weekStartISO)
          .lte("reading_validations.validated_at", weekEndISO);

        const activeFriends = new Set(activeFriendsData?.map(f => f.following_id) || []).size;

        // Create digest meta
        const digestMeta = {
          lauriers: lauriersReceived || 0,
          validations: validations || 0,
          activeFriends: activeFriends,
          weekStart: weekStartISO,
          weekEnd: weekEndISO,
          msg: `Semaine VREAD. ${lauriersReceived || 0} Lauriers. ${validations || 0} validations. ${activeFriends} amis actifs.`
        };

        // Only send if there's some activity
        if ((lauriersReceived || 0) > 0 || (validations || 0) > 0 || activeFriends > 0) {
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