
import { createContext, useContext, useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { syncUserProfile } from '@/services/user/userProfileService';

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
  pollForPremiumStatus: () => Promise<boolean>;
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
  setError: () => {},
  signUp: async () => {},
  signIn: async () => {},
  signOut: async () => {},
  refreshUserStatus: async () => {},
  pollForPremiumStatus: async () => false
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserStatus = useCallback(async (userId: string) => {
    try {
      if (!userId) return { isAdmin: false, isPremium: false };

      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin, is_premium, premium_since')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user status:', error);
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

        if (!mounted) {
          return;
        }

        if (error) {
          console.error("[AUTH CONTEXT] Error fetching session:", error);
          toast.error("Error connecting to Supabase");
          setError("Error connecting to Supabase");
        }

        // If user exists, sync their profile BEFORE updating state
        if (currentSession?.user) {
          const status = await syncUserData(currentSession.user.id, currentSession.user.email);

          if (!mounted) {
            return;
          }

          // Enrichir l'user avec les données du profil
          const enrichedUser = {
            ...currentSession.user,
            is_admin: status?.isAdmin || false,
            is_premium: status?.isPremium || false
          } as any;

          setUser(enrichedUser);
          setSession(currentSession);
        } else {
          setUser(null);
          setSession(null);
        }

        // Always set initialized to true and loading to false, regardless of session status
        setIsInitialized(true);
        setIsLoading(false);

        // NOW set up the auth state change listener for future changes
        const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
          if (!mounted) {
            return;
          }

          // If user exists, sync their profile BEFORE updating state
          if (newSession?.user) {
            const status = await syncUserData(newSession.user.id, newSession.user.email);

            if (!mounted) return;

            // Enrichir l'user avec les données du profil
            const enrichedUser = {
              ...newSession.user,
              is_admin: status?.isAdmin || false,
              is_premium: status?.isPremium || false
            } as any;

            setUser(enrichedUser);
            setSession(newSession);
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
    if (!user?.id) return;

    // Initialiser avec l'état actuel pour éviter un toast au démarrage
    prevPremiumRef.current = isPremium;

    console.log('[AUTH REALTIME] Setting up real-time listener for premium status...');
    console.log('[AUTH REALTIME] Initial premium state:', isPremium);

    const channel = supabase
      .channel(`premium-status-${user.id}`)
      .on('postgres_changes', {
        event: '*', // Écoute INSERT et UPDATE
        schema: 'public',
        table: 'profiles',
        filter: `id=eq.${user.id}`
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
  }, [user?.id]); // Retirer isPremium des deps pour éviter re-création

  const signUp = useCallback(async (email: string, password: string) => {
    setError(null);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw new Error(error.message);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
  }, []);

  const signOut = useCallback(async () => {
    setError(null);
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
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
  const pollForPremiumStatus = useCallback(async (): Promise<boolean> => {
    if (!user?.id) {
      console.warn('[AUTH POLL] Cannot poll: no user logged in');
      return false;
    }

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
          console.error(`[AUTH POLL] Error on attempt ${attempt}:`, error);
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

          // Afficher message de félicitations
          toast.success('🎉 Félicitations ! Vous êtes maintenant Premium !', {
            duration: 5000,
            style: {
              background: 'linear-gradient(to right, #f97316, #eab308)',
              color: 'white',
              fontWeight: 'bold'
            }
          });

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
  }, [user?.id]);

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
    pollForPremiumStatus
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
    pollForPremiumStatus
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
