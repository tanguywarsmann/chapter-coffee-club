import { supabase } from "@/integrations/supabase/client";

/**
 * Smoke test: vérifie la connexion Supabase et affiche un diagnostic en console.
 * Appelable depuis la console du navigateur : window.__supabaseHealthCheck()
 */
export async function supabaseHealthCheck() {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  console.group("🔍 Supabase Health Check");

  // 1. Env vars
  if (!url || !key) {
    console.error("❌ VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY manquant !");
    console.groupEnd();
    return { ok: false, reason: "missing_env" };
  }
  const maskedUrl = url.replace(/^(https:\/\/[a-z]{4}).*?(\.supabase\.co)$/, "$1****$2");
  console.log(`✅ URL: ${maskedUrl}`);
  console.log(`✅ Key: ${key.slice(0, 20)}…`);

  // 2. Auth session
  const { data: { session } } = await supabase.auth.getSession();
  console.log(session ? `✅ Session active (user: ${session.user.id.slice(0, 8)}…)` : "ℹ️ Pas de session (anonyme)");

  // 3. Smoke test: count published books
  const { count, error } = await supabase
    .from("books")
    .select("*", { count: "exact", head: true })
    .eq("is_published", true);

  if (error) {
    console.error("❌ Requête books échouée:", error.message);
    console.groupEnd();
    return { ok: false, reason: "query_failed", error: error.message };
  }

  console.log(`✅ ${count} livres publiés trouvés`);
  console.groupEnd();

  return { ok: true, booksCount: count, authenticated: !!session };
}

// Expose globally for console access
if (typeof window !== "undefined") {
  (window as any).__supabaseHealthCheck = supabaseHealthCheck;
}
