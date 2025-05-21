
import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { syncUserProfile } from '@/services/user/userProfileService';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  isAdmin: boolean;
  error: string | null;
  setError: (error: string | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  isLoading: true,
  isInitialized: false,
  isAdmin: false,
  error: null,
  setError: () => {}
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const authChecked = useRef(false);
  const stateChangeHandled = useRef(false);
  const initTimeoutRef = useRef<number | null>(null);

  const fetchAdminStatus = async (userId: string) => {
    try {
      if (!userId) return false;
      
      if (process.env.NODE_ENV === 'development') {
        console.log("Fetching admin status for user ID:", userId);
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Erreur lors de la récupération du statut admin:', error);
        setIsAdmin(false);
        return false;
      }

      const adminStatus = data?.is_admin || false;
      setIsAdmin(adminStatus);
      return adminStatus;
    } catch (error) {
      console.error('Exception lors de la récupération du statut admin:', error);
      setIsAdmin(false);
      return false;
    }
  };

  // Safety mechanism to ensure we don't get stuck
  useEffect(() => {
    console.info("[AUTH CONTEXT] Safety initialization timeout started");
    
    // Set a safety timeout to mark initialization as complete if it takes too long
    initTimeoutRef.current = window.setTimeout(() => {
      if (!isInitialized) {
        console.warn("[AUTH CONTEXT] Auth initialization timed out - forcing completion");
        setIsInitialized(true);
        setIsLoading(false);
      }
    }, 5000);

    return () => {
      if (initTimeoutRef.current !== null) {
        clearTimeout(initTimeoutRef.current);
      }
    };
  }, [isInitialized]);

  useEffect(() => {
    console.info("[AUTH CONTEXT] Initial setup starting");
    
    // Set up auth state change listener FIRST
    console.info("[AUTH CONTEXT] Setting up auth state change listener");
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      try {
        console.info(`[AUTH CONTEXT] Auth state change event: ${event}, user: ${currentSession?.user?.id || 'none'}`);
        
        // Debounce to avoid multiple rapid updates
        if (!stateChangeHandled.current) {
          stateChangeHandled.current = true;
          setTimeout(() => {
            stateChangeHandled.current = false;
          }, 100);
        }
  
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
  
        if (currentSession?.user) {
          console.info(`[AUTH CONTEXT] User authenticated: ${currentSession.user.id}`);
          
          // Use setTimeout to avoid potential deadlock with Supabase auth state change
          setTimeout(async () => {
            try {
              await syncUserProfile(currentSession.user.id, currentSession.user.email);
              await fetchAdminStatus(currentSession.user.id);
            } catch (err) {
              console.error("[AUTH CONTEXT] Error syncing user profile:", err);
            }
          }, 0);
  
          localStorage.setItem("user", JSON.stringify({ 
            id: currentSession.user.id,
            email: currentSession.user.email 
          }));
        } else if (event === 'SIGNED_OUT') {
          console.info("[AUTH CONTEXT] User signed out");
          try {
            localStorage.removeItem("user");
          } catch (e) {
            console.warn("[AUTH CONTEXT] Could not remove user from localStorage:", e);
          }
          setSession(null);
          setUser(null);
          setIsAdmin(false);
        }
  
        // Always set isInitialized to true and isLoading to false, regardless of session status
        if (!isInitialized) {
          console.info("[AUTH CONTEXT] Setting isInitialized to true from onAuthStateChange");
          setIsInitialized(true);
        }
        setIsLoading(false);
      } catch (err) {
        console.error("[AUTH CONTEXT] Error handling auth state change:", err);
        // Ensure initialization completes even on error
        console.info("[AUTH CONTEXT] Forcing isInitialized to true after error");
        setIsInitialized(true);
        setIsLoading(false);
      }
    });

    const initializeAuth = async () => {
      try {
        if (authChecked.current) {
          console.info("[AUTH CONTEXT] Auth already checked, skipping initialization");
          return;
        }
        console.info("[AUTH CONTEXT] Starting auth initialization");
        authChecked.current = true;

        const { data: { session: currentSession }, error } = await supabase.auth.getSession();

        if (error) {
          console.error("[AUTH CONTEXT] Error fetching session:", error);
          throw error;
        }

        console.info(`[AUTH CONTEXT] Session fetched, user: ${currentSession?.user?.id || 'none'}`);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          // Use setTimeout to avoid potential deadlock with Supabase auth
          setTimeout(async () => {
            try {
              await syncUserProfile(currentSession.user.id, currentSession.user.email);
              await fetchAdminStatus(currentSession.user.id);
            } catch (err) {
              console.error("[AUTH CONTEXT] Error during user profile sync:", err);
            }
          }, 0);
        }

        // Always set isInitialized to true, regardless of session status
        console.info("[AUTH CONTEXT] Setting isInitialized to true from getSession");
        setIsInitialized(true);
        setIsLoading(false);
      } catch (error) {
        console.error("[AUTH CONTEXT] Error in initializeAuth:", error);
        toast.error("Erreur de connexion à Supabase");
        setError("Erreur de connexion à Supabase");
        // Ensure initialization completes even on error
        console.info("[AUTH CONTEXT] Forcing isInitialized to true after initialization error");
        setIsInitialized(true);
        setIsLoading(false);
      }
    };

    initializeAuth().catch(err => {
      console.error("[AUTH CONTEXT] Failed to initialize auth:", err);
      console.info("[AUTH CONTEXT] Forcing isInitialized to true after unhandled error");
      setIsInitialized(true);
      setIsLoading(false);
    });

    return () => {
      console.info("[AUTH CONTEXT] Cleaning up auth subscription");
      subscription.unsubscribe();
      if (initTimeoutRef.current !== null) {
        clearTimeout(initTimeoutRef.current);
      }
    };
  }, []);

  return (
    <AuthContext.Provider value={{ session, user, isLoading, isInitialized, isAdmin, error, setError }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
