
import { supabase } from '@/integrations/supabase/client';
import { handleSupabaseError } from '@/services/supabaseErrorHandler';
import { syncUserProfile } from '@/services/user/userProfileService';
import { Session, User } from '@supabase/supabase-js';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

interface AuthContextType {
  supabase: typeof supabase;
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  isAdmin: boolean;
  isPremium: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUserStatus: () => Promise<void>;
  pollForPremiumStatus: (showToastOnUpgrade?: boolean) => Promise<boolean>;
  requestPasswordReset: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  supabase,
  session: null,
  user: null,
  isLoading: true,
  isInitialized: false,
  isAdmin: false,
  isPremium: false,
  error: null,
  setError: () => { },
  signUp: async () => { },
  signIn: async () => { },
  signOut: async () => { },
  refreshUserStatus: async () => { },
  pollForPremiumStatus: async () => false,
  requestPasswordReset: async () => { },
  updatePassword: async () => { }
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const WATCHDOG_SKIP_THRESHOLD_MS = 90_000; // 90s safety buffer before expiry

  const logSessionSnapshot = useCallback((label: string, snapshot: Session | null) => {
    const hasSession = !!snapshot;
    const expiresAt = snapshot?.expires_at ? new Date(snapshot.expires_at * 1000).toISOString() : 'unknown';
    const userId = snapshot?.user?.id ?? 'anon';
    console.info(`[AUTH][SESSION][${label}] has=${hasSession} user=${userId} expiresAt=${expiresAt}`);
  }, []);

  const fetchUserStatus = useCallback(async (userId: string) => {
    try {
      if (!userId) return { isAdmin: false, isPremium: false };

      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin, is_premium, premium_since')
        .eq('id', userId)
        .single();

      if (error) {
        const errorInfo = handleSupabaseError('fetchUserStatus', error);
        console.error('Error fetching user status:', errorInfo);

        // If auth expired, dispatch event and trigger signout
        if (errorInfo.isAuthExpired) {
          console.log("[AUTH] Auth expired in fetchUserStatus, dispatching event");
          window.dispatchEvent(new Event('auth-expired'));
          setTimeout(() => signOut(), 0);
        }

        setIsAdmin(false);
        setIsPremium(false);
        return { isAdmin: false, isPremium: false };
      }

      const adminStatus = data?.is_admin || false;
      const premiumStatus = data?.is_premium || false;

      setIsAdmin(adminStatus);
      setIsPremium(premiumStatus);

      // Enrichir l'objet user avec les données du profil
      setUser(prev => {
        if (!prev) return prev;
        const enrichedUser = {
          ...prev,
          is_admin: adminStatus,
          is_premium: premiumStatus,
          premium_since: data?.premium_since
        } as any;
        return enrichedUser;
      });

      return { isAdmin: adminStatus, isPremium: premiumStatus };
    } catch (error) {
      console.error('Exception when fetching user status:', error);
      setIsAdmin(false);
      setIsPremium(false);
      return { isAdmin: false, isPremium: false };
    }
  }, []);

  // FIX P0-2 & P0-3: Éviter double sync et race conditions
  const syncInProgressRef = useRef(false);

  const syncUserData = useCallback(async (userId: string, email?: string) => {
    if (syncInProgressRef.current) {
      return;
    }

    syncInProgressRef.current = true;

    try {
      await syncUserProfile(userId, email);
      const status = await fetchUserStatus(userId);
      return status;
    } catch (err) {
      console.error("[AUTH CONTEXT] Error during profile sync:", err);
      return { isAdmin: false, isPremium: false };
    } finally {
      syncInProgressRef.current = false;
    }
  }, [fetchUserStatus]);

  useEffect(() => {
    // FIX: Prevent double initialization in React StrictMode and race conditions
    let mounted = true;
    let subscription: any = null;

    console.info("[AUTH CONTEXT] Initializing");

    // Initialize auth session FIRST, THEN set up listener
    const initializeAuth = async () => {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();

        logSessionSnapshot('bootstrap:getSession', currentSession ?? null);

        if (!mounted) {
          return;
        }

        if (error) {
          console.error("[AUTH CONTEXT] Error fetching session:", error);
          toast.error("Error connecting to Supabase");
          setError("Error connecting to Supabase");
        }

        // Set auth state immediately based on session only (non-blocking)
        if (currentSession?.user) {
          setUser(currentSession.user as any);
          setSession(currentSession);
        } else {
          setUser(null);
          setSession(null);
        }

        // Always set initialized to true and loading to false, regardless of session status
        setIsInitialized(true);
        setIsLoading(false);

        // Enrich profile/admin/premium in background (do not block init)
        if (currentSession?.user) {
          void syncUserData(currentSession.user.id, currentSession.user.email).then((status) => {
            if (!mounted) return;
            setIsAdmin(!!status?.isAdmin);
            setIsPremium(!!status?.isPremium);
            setUser(prev => {
              if (!prev) return prev;
              return {
                ...prev,
                is_admin: !!status?.isAdmin,
                is_premium: !!status?.isPremium
              } as any;
            });
          });
        }

        // NOW set up the auth state change listener for future changes
        const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
          if (!mounted) {
            return;
          }

          console.log("[AUTH CONTEXT] Auth state change:", event);

          logSessionSnapshot(`auth-state:${event}`, newSession ?? null);

          // Détecter token expiré / session invalide
          if (event === "TOKEN_REFRESHED") {
            console.log("[AUTH CONTEXT] Token refreshed successfully");
          }

          // Si pas de session et que ce n'est pas l'état initial, forcer clear
          if (!newSession && event !== "INITIAL_SESSION") {
            console.warn("[AUTH CONTEXT] Session lost, clearing auth state");
            setUser(null);
            setSession(null);
            setIsAdmin(false);
            setIsPremium(false);
            return;
          }

          // If user exists, set auth state immediately, then enrich in background
          if (newSession?.user) {
            setUser(newSession.user as any);
            setSession(newSession);
            void syncUserData(newSession.user.id, newSession.user.email).then((status) => {
              if (!mounted) return;
              setIsAdmin(!!status?.isAdmin);
              setIsPremium(!!status?.isPremium);
              setUser(prev => {
                if (!prev) return prev;
                return {
                  ...prev,
                  is_admin: !!status?.isAdmin,
                  is_premium: !!status?.isPremium
                } as any;
              });
            });
          } else {
            setUser(null);
            setSession(null);
          }
        });

        subscription = authSubscription;

      } catch (error) {
        console.error("[AUTH CONTEXT] Error in initializeAuth:", error);

        if (!mounted) return;

        // Even on error, we need to mark initialization as complete
        setIsInitialized(true);
        setIsLoading(false);
      }
    };

    // Initialize auth
    initializeAuth();

    // Clean up subscription
    return () => {
      mounted = false;
      if (subscription) {
        subscription.unsubscribe();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // REALTIME: Écoute en temps réel des changements de statut premium dans Supabase
  const prevPremiumRef = useRef<boolean>(false);

  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId) return;

    // Initialiser avec l'état actuel pour éviter un toast au démarrage
    prevPremiumRef.current = isPremium;

    console.log('[AUTH REALTIME] Setting up real-time listener for premium status...');
    console.log('[AUTH REALTIME] Initial premium state:', isPremium);

    const channel = supabase
      .channel(`premium-status-${userId}`)
      .on('postgres_changes', {
        event: '*', // Écoute INSERT et UPDATE
        schema: 'public',
        table: 'profiles',
        filter: `id=eq.${userId}`
      }, (payload) => {
        console.log('[AUTH REALTIME] 📡 Received profile change:', payload.eventType, payload);

        const newData = payload.new as { is_premium?: boolean; is_admin?: boolean; premium_since?: string | null };

        const nowPremium = !!(newData.is_premium);
        const wasPremium = prevPremiumRef.current;

        console.log(`[AUTH REALTIME] Premium transition: ${wasPremium} → ${nowPremium}`);

        // Mettre à jour les états
        setIsPremium(nowPremium);
        if (newData.is_admin !== undefined) {
          setIsAdmin(newData.is_admin);
        }

        // Enrichir l'user
        setUser(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            is_premium: nowPremium,
            is_admin: newData.is_admin ?? (prev as any).is_admin,
            premium_since: newData.premium_since ?? (prev as any).premium_since
          } as any;
        });

        // Toast UNIQUEMENT si transition de non-premium à premium
        if (!wasPremium && nowPremium) {
          console.log('[AUTH REALTIME] 🎉 User just became premium!');
          toast.success('🎉 Félicitations ! Vous êtes maintenant Premium !', {
            duration: 5000,
            style: {
              background: 'linear-gradient(to right, #f97316, #eab308)',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '16px'
            }
          });
        }

        // Mettre à jour la référence
        prevPremiumRef.current = nowPremium;
      })
      .subscribe((status) => {
        console.log('[AUTH REALTIME] Subscription status:', status);
      });

    return () => {
      console.log('[AUTH REALTIME] Cleaning up real-time listener');
      supabase.removeChannel(channel);
    };
  }, [session?.user?.id]); // Retirer isPremium des deps pour éviter re-création

  // Établit une session valide à partir des paramètres du lien de récupération Supabase
  const ensureRecoverySession = useCallback(async () => {
    // Si une session existe déjà, rien à faire
    const { data: { session: existingSession } } = await supabase.auth.getSession();
    if (existingSession) {
      return existingSession;
    }

    // Supabase envoie access_token/refresh_token ou un code selon la config
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const searchParams = new URLSearchParams(window.location.search);

    const accessToken = hashParams.get("access_token") ?? searchParams.get("access_token");
    const refreshToken = hashParams.get("refresh_token") ?? searchParams.get("refresh_token");
    const code = searchParams.get("code") ?? hashParams.get("code");

    if (code) {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (error || !data?.session) {
        throw new Error(error?.message || "Lien de réinitialisation invalide ou expiré.");
      }
      return data.session;
    }

    if (accessToken && refreshToken) {
      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      });
      if (error || !data?.session) {
        throw new Error(error?.message || "Session invalide pour la réinitialisation du mot de passe.");
      }
      return data.session;
    }

    throw new Error("Lien de réinitialisation invalide ou expiré.");
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    setError(null);
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      throw new Error(error.message);
    }

    // Certains projets Supabase renvoient déjà une session après signUp.
    // Mettre à jour l'état auth immédiatement, enrichir en arrière-plan.
    if (data?.session?.user) {
      const currentUser = data.session.user;
      setUser(currentUser as any);
      setSession(data.session);
      setIsInitialized(true);
      setIsLoading(false);
      void syncUserData(currentUser.id, currentUser.email ?? undefined).then((status) => {
        setIsAdmin(!!status?.isAdmin);
        setIsPremium(!!status?.isPremium);
        setUser(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            is_admin: !!status?.isAdmin,
            is_premium: !!status?.isPremium
          } as any;
        });
      });
    }
  }, [syncUserData]);

  const signIn = useCallback(async (email: string, password: string) => {
    setError(null);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      throw new Error(error.message);
    }

    if (data?.session?.user) {
      const currentUser = data.session.user;
      setUser(currentUser as any);
      setSession(data.session);
      setIsInitialized(true);
      setIsLoading(false);
      void syncUserData(currentUser.id, currentUser.email ?? undefined).then((status) => {
        setIsAdmin(!!status?.isAdmin);
        setIsPremium(!!status?.isPremium);
        setUser(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            is_admin: !!status?.isAdmin,
            is_premium: !!status?.isPremium
          } as any;
        });
      });
    }
  }, [syncUserData]);

  const requestPasswordReset = useCallback(async (email: string) => {
    setError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      throw new Error(error.message);
    }
  }, []);

  const updatePassword = useCallback(async (newPassword: string) => {
    setError(null);
    try {
      await ensureRecoverySession();

      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        throw new Error(error.message);
      }

      // Rafraîchir la session après mise à jour du mot de passe
      const { data: { session: refreshed } } = await supabase.auth.getSession();
      if (refreshed?.user) {
        const status = await syncUserData(refreshed.user.id, refreshed.user.email ?? undefined);
        const enrichedUser = {
          ...refreshed.user,
          is_admin: status?.isAdmin || false,
          is_premium: status?.isPremium || false,
        } as any;
        setUser(enrichedUser);
        setSession(refreshed);
      }
    } catch (err: any) {
      const message = err?.message || "Erreur lors de la mise à jour du mot de passe";
      setError(message);
      throw err instanceof Error ? err : new Error(message);
    }
  }, [ensureRecoverySession, syncUserData]);

  const signOut = useCallback(async () => {
    setError(null);

    // Clear local auth state eagerly to avoid sticky sessions in case
    // the Supabase auth listener does not fire or the storage adapter glitches
    setUser(null);
    setSession(null);
    setIsAdmin(false);
    setIsPremium(false);

    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("[AUTH CONTEXT] Error during signOut:", error);
        throw new Error(error.message);
      }
    } catch (err) {
      console.error("[AUTH CONTEXT] Exception during signOut:", err);
      // Surface a generic error but keep local state cleared
      setError("Erreur lors de la déconnexion");
      throw err;
    }
  }, []);

  const refreshUserStatus = useCallback(async () => {
    if (!user?.id) {
      console.warn('[AUTH] Cannot refresh user status: no user logged in');
      return;
    }

    console.log('[AUTH] Forcing full session refresh to update premium status...');

    // Forcer un rechargement complet de la session depuis Supabase
    try {
      const { data: { session: currentSession }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('[AUTH] Error refreshing session:', error);
        return;
      }

      if (currentSession?.user) {
        console.log('[AUTH] Session refreshed, syncing user data...');
        const status = await syncUserData(currentSession.user.id, currentSession.user.email);

        // Mettre à jour l'état avec les nouvelles données
        const enrichedUser = {
          ...currentSession.user,
          is_admin: status?.isAdmin || false,
          is_premium: status?.isPremium || false
        } as any;

        setUser(enrichedUser);
        setSession(currentSession);

        console.log('[AUTH] ✅ Full refresh complete - isPremium:', status?.isPremium);
      }
    } catch (error) {
      console.error('[AUTH] Error during full refresh:', error);
    }
  }, [user?.id, syncUserData]);

  // NOUVELLE FONCTION: Polling robuste pour détecter le statut premium après achat iOS
  const pollForPremiumStatus = useCallback(async (showToastOnUpgrade: boolean = true): Promise<boolean> => {
    if (!user?.id) {
      console.warn('[AUTH POLL] Cannot poll: no user logged in');
      return false;
    }

    const wasPremium = isPremium; // capture current state before polling
    console.log('[AUTH POLL] 🔄 Starting aggressive polling for premium status...');

    const maxAttempts = 6; // 6 tentatives = 12 secondes max
    const delayMs = 2000; // 2 secondes entre chaque tentative

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      console.log(`[AUTH POLL] Attempt ${attempt}/${maxAttempts} - Checking Supabase...`);

      try {
        // Lecture DIRECTE de la table profiles (pas de cache, pas de verrou)
        const { data, error } = await supabase
          .from('profiles')
          .select('is_premium, is_admin, premium_since')
          .eq('id', user.id)
          .single();

        if (error) {
          const errorInfo = handleSupabaseError('pollForPremiumStatus', error);
          console.error(`[AUTH POLL] Error on attempt ${attempt}:`, errorInfo);

          // If auth expired, dispatch event, stop polling and trigger signout
          if (errorInfo.isAuthExpired) {
            console.log("[AUTH POLL] Auth expired, dispatching event and stopping poll");
            window.dispatchEvent(new Event('auth-expired'));
            setTimeout(() => signOut(), 0);
            return false;
          }
        } else if (data?.is_premium) {
          // 🎉 PREMIUM DÉTECTÉ !
          console.log('[AUTH POLL] 🎉 PREMIUM DETECTED IN SUPABASE!');

          // Force update immédiat de tous les états
          setIsAdmin(data.is_admin || false);
          setIsPremium(true);

          setUser(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              is_admin: data.is_admin || false,
              is_premium: true,
              premium_since: data.premium_since
            } as any;
          });

          console.log('[AUTH POLL] ✅ All states updated - User is now PREMIUM!');

          // Afficher message de félicitations UNIQUEMENT si transition non-premium → premium ET si demandé
          if (showToastOnUpgrade && !wasPremium) {
            toast.success('🎉 Félicitations ! Vous êtes maintenant Premium !', {
              duration: 5000,
              style: {
                background: 'linear-gradient(to right, #f97316, #eab308)',
                color: 'white',
                fontWeight: 'bold'
              }
            });
          }

          return true;
        } else {
          console.log(`[AUTH POLL] Attempt ${attempt}: Not premium yet (is_premium=${data?.is_premium})`);
        }
      } catch (err) {
        console.error(`[AUTH POLL] Exception on attempt ${attempt}:`, err);
      }

      // Attendre avant la prochaine tentative (sauf si c'est la dernière)
      if (attempt < maxAttempts) {
        console.log(`[AUTH POLL] Waiting ${delayMs}ms before next attempt...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }

    console.log('[AUTH POLL] ❌ Max attempts reached - Premium not detected');
    toast.error('Le statut premium n\'a pas été détecté. Essayez de vous déconnecter puis reconnecter.', {
      duration: 6000
    });
    return false;
  }, [user?.id, isPremium, signOut]);

  // Removed custom auth watchdog: Supabase autoRefresh handles session lifecycle

  const contextValue = useMemo(() => ({
    supabase,
    session,
    user,
    isLoading,
    isInitialized,
    isAdmin,
    isPremium,
    error,
    setError,
    signUp,
    signIn,
    signOut,
    refreshUserStatus,
    pollForPremiumStatus,
    requestPasswordReset,
    updatePassword
  }), [
    session,
    user,
    isLoading,
    isInitialized,
    isAdmin,
    isPremium,
    error,
    signUp,
    signIn,
    signOut,
    refreshUserStatus,
    pollForPremiumStatus,
    requestPasswordReset,
    updatePassword
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
