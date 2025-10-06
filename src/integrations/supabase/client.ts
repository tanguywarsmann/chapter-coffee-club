
import { createClient } from "@supabase/supabase-js";
import type { Database } from './types';

// Tolérance aux différents noms d'ENV possibles après rollback
const url =
  import.meta.env.VITE_SUPABASE_URL
  ?? import.meta.env.PUBLIC_SUPABASE_URL
  ?? import.meta.env.NEXT_PUBLIC_SUPABASE_URL
  ?? (window as any).__SUPABASE_URL__         // fallback window pour debug local
  ?? "https://xjumsrjuyzvsixvfwoiz.supabase.co";                                      

let key =
  import.meta.env.VITE_SUPABASE_ANON_KEY
  ?? import.meta.env.PUBLIC_SUPABASE_ANON_KEY
  ?? import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ?? (window as any).__SUPABASE_ANON_KEY__    // fallback window pour debug local
  ?? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqdW1zcmp1eXp2c2l4dmZ3b2l6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUxNTU1NjYsImV4cCI6MjA2MDczMTU2Nn0.GXAF1p5iTeI3mLwwYi4rnXLsWHSUwglmdQJ7SoC3rH8";

// BÊTA: si tu veux forcer en dur pour débloquer tout de suite, décommente et colle ta clé anon ci-dessous
// key = key || "PASTE_YOUR_ANON_KEY_HERE";

if (!url || !key) {
  // On loggue sans exposer la clé
  console.error("[Supabase] ENV manquants",
    { hasUrl: !!url, hasKey: !!key, keyLen: key ? String(key).length : 0 }
  );
}

// Create a safe storage fallback to handle PWA storage errors
const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn(`Failed to retrieve ${key} from localStorage:`, error);
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.warn(`Failed to set ${key} in localStorage:`, error);
    }
  },
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn(`Failed to remove ${key} from localStorage:`, error);
    }
  }
};

// Configuration du client Supabase avec auth correctement configuré
export const supabase = createClient<Database>(url, key, {
  auth: {
    storage: safeStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  global: {
    headers: {
      apikey: key,
      // NE PAS forcer Authorization ici - Supabase gère automatiquement le JWT
    },
  },
});

// Sanity check à chaud, désactive après debug
(async () => {
  try {
    const { error } = await supabase.from("books").select("id").limit(1);
    if (error) {
      console.error("[Supabase] Sanity check KO:", {
        message: error.message, code: (error as any).code, details: (error as any).details
      });
    } else {
      console.info("[Supabase] Sanity check OK. URL:", url.replace(/\/\/([^/]+)/, "//***"));
    }
  } catch (e) {
    console.error("[Supabase] Sanity check exception:", e);
  }
})();
