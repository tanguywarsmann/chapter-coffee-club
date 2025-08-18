import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_ORIGINS = [
  "https://www.vread.fr",
  "https://vread.fr",
  // Ajoute ici ton domaine d’aperçu Lovable si besoin
  // "https://id-preview--xxxx.lovable.app"
];

function makeCorsHeaders(origin: string | null) {
  const allowOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : "*";
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin"
  };
}

serve(async (req) => {
  const origin = req.headers.get("Origin");
  const corsHeaders = makeCorsHeaders(origin);

  // Preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Méthode strictement POST
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      status: 405,
      headers: {
        ...corsHeaders,
        "content-type": "application/json",
        "Cache-Control": "no-store"
      }
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!supabaseUrl || !anonKey || !serviceKey) {
      console.error("Missing required environment variables");
      return new Response(JSON.stringify({ error: "Server configuration error" }), {
        status: 500,
        headers: {
          ...corsHeaders,
          "content-type": "application/json",
          "Cache-Control": "no-store"
        }
      });
    }

    const authHeader = req.headers.get("Authorization") ?? "";
    const jwt = authHeader.replace("Bearer ", "").trim();

    if (!jwt) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: {
          ...corsHeaders,
          "content-type": "application/json",
          "Cache-Control": "no-store"
        }
      });
    }

    // Vérifie l’utilisateur avec le client anon
    const anon = createClient(supabaseUrl, anonKey, { auth: { persistSession: false } });
    const { data: userData, error: userErr } = await anon.auth.getUser(jwt);
    if (userErr || !userData?.user) {
      console.error("User verification failed:", userErr);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: {
          ...corsHeaders,
          "content-type": "application/json",
          "Cache-Control": "no-store"
        }
      });
    }

    const userId = userData.user.id;
    console.log(`Processing account deletion for user: ${userId}`);

    // Service role pour purge + suppression Auth
    const service = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

    // 1) Purge data applicative (fonction SQL transactionnelle)
    const { error: cleanupError } = await service.rpc("cleanup_user_data", { target_user_id: userId });
    if (cleanupError) {
      console.error("Data cleanup failed:", cleanupError);
      return new Response(JSON.stringify({ error: "Data cleanup failed" }), {
        status: 500,
        headers: {
          ...corsHeaders,
          "content-type": "application/json",
          "Cache-Control": "no-store"
        }
      });
    }

    // 2) Suppression du compte Auth
    const { error: delErr } = await service.auth.admin.deleteUser(userId);
    if (delErr) {
      console.error("Auth user deletion failed:", delErr);
      return new Response(JSON.stringify({ error: "Account deletion failed" }), {
        status: 500,
        headers: {
          ...corsHeaders,
          "content-type": "application/json",
          "Cache-Control": "no-store"
        }
      });
    }

    console.log(`Successfully deleted account for user: ${userId}`);
    return new Response(JSON.stringify({ success: true, message: "Account successfully deleted" }), {
      headers: {
        ...corsHeaders,
        "content-type": "application/json",
        "Cache-Control": "no-store"
      }
    });

  } catch (error) {
    console.error("Unexpected error in delete-account function:", error);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: {
        ...makeCorsHeaders(req.headers.get("Origin")),
        "content-type": "application/json",
        "Cache-Control": "no-store"
      }
    });
  }
});
