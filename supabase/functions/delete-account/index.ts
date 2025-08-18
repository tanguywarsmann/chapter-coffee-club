import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
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
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!supabaseUrl || !anonKey || !serviceKey) {
      console.error("Missing required environment variables");
      return new Response("Server configuration error", { 
        status: 500,
        headers: corsHeaders 
      });
    }

    const authHeader = req.headers.get("Authorization") ?? "";
    const jwt = authHeader.replace("Bearer ", "");

    if (!jwt) {
      return new Response("Unauthorized", { 
        status: 401,
        headers: corsHeaders 
      });
    }

    // Verify user with anon client
    const anon = createClient(supabaseUrl, anonKey, { 
      auth: { persistSession: false } 
    });
    
    const { data: userData, error: userErr } = await anon.auth.getUser(jwt);
    if (userErr || !userData?.user) {
      console.error("User verification failed:", userErr);
      return new Response("Unauthorized", { 
        status: 401,
        headers: corsHeaders 
      });
    }

    const userId = userData.user.id;
    console.log(`Processing account deletion for user: ${userId}`);

    // Use service role client for data cleanup
    const service = createClient(supabaseUrl, serviceKey, { 
      auth: { persistSession: false } 
    });

    // Call our cleanup function
    const { error: cleanupError } = await service.rpc('cleanup_user_data', {
      target_user_id: userId
    });

    if (cleanupError) {
      console.error("Data cleanup failed:", cleanupError);
      return new Response("Data cleanup failed", { 
        status: 500,
        headers: corsHeaders 
      });
    }

    // Delete the auth user
    const { error: delErr } = await service.auth.admin.deleteUser(userId);
    if (delErr) {
      console.error("Auth user deletion failed:", delErr);
      return new Response("Account deletion failed", { 
        status: 500,
        headers: corsHeaders 
      });
    }

    console.log(`Successfully deleted account for user: ${userId}`);
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: "Account successfully deleted" 
    }), { 
      headers: { 
        ...corsHeaders, 
        "content-type": "application/json" 
      } 
    });

  } catch (error) {
    console.error("Unexpected error in delete-account function:", error);
    return new Response("Server error", { 
      status: 500,
      headers: corsHeaders 
    });
  }
});