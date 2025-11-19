
import { createClient } from "@supabase/supabase-js";
import { Capacitor } from "@capacitor/core";
import { Preferences } from "@capacitor/preferences";
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

// Detect localStorage availability once at startup
let storageAvailable = false;
try {
  const test = '__storage_test__';
  localStorage.setItem(test, test);
  localStorage.removeItem(test);
  storageAvailable = true;
} catch {
  storageAvailable = false;
  console.warn('[Supabase] localStorage unavailable (private browsing?), using memory fallback');
}

// Memory fallback for when localStorage is unavailable
const memoryStorage = new Map<string, string>();

// Create a safe storage fallback to handle PWA storage errors
const safeStorage = {
  getItem: (key: string): string | null => {
    if (!storageAvailable) {
      return memoryStorage.get(key) || null;
    }
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn(`Failed to retrieve ${key} from localStorage:`, error);
      return memoryStorage.get(key) || null;
    }
  },
  setItem: (key: string, value: string): void => {
    if (!storageAvailable) {
      memoryStorage.set(key, value);
      return;
    }
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.warn(`Failed to set ${key} in localStorage:`, error);
      memoryStorage.set(key, value);
    }
  },
  removeItem: (key: string): void => {
    if (!storageAvailable) {
      memoryStorage.delete(key);
      return;
    }
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn(`Failed to remove ${key} from localStorage:`, error);
      memoryStorage.delete(key);
    }
  }
};

const capacitorStorage = {
  getItem: async (key: string): Promise<string | null> => {
    const { value } = await Preferences.get({ key });
    return value ?? null;
  },
  setItem: async (key: string, value: string): Promise<void> => {
    await Preferences.set({ key, value });
  },
  removeItem: async (key: string): Promise<void> => {
    await Preferences.remove({ key });
  }
};

const isIOSNative = typeof window !== 'undefined' &&
  !!Capacitor?.isNativePlatform?.() &&
  Capacitor.getPlatform() === 'ios';

const authStorage = isIOSNative ? capacitorStorage : safeStorage;

// FIX P0-1: Singleton pattern pour éviter Multiple GoTrueClient instances
let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null;

const getSupabaseClient = () => {
  if (!supabaseInstance) {
    supabaseInstance = createClient<Database>(url, key, {
      auth: {
        storage: authStorage,
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
  }
  return supabaseInstance;
};

// Configuration du client Supabase avec auth correctement configuré
export const supabase = getSupabaseClient();

// FIX: Removed immediate sanity check IIFE that was running on every module import
// This was causing database queries to fire on every page refresh, contributing to freeze
// If you need to test connectivity, call supabase.from("books").select("id").limit(1) manually
