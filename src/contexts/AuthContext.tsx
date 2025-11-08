
import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
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
  signOut: async () => {}
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

  async function signUp(email: string, password: string) {
    setError(null);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw new Error(error.message);
  }

  async function signIn(email: string, password: string) {
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
  }

  async function signOut() {
    setError(null);
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
  }

  return (
    <AuthContext.Provider value={{ 
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
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
