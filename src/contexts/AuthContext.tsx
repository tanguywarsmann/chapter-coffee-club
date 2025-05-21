
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
    // Set a safety timeout to mark initialization as complete if it takes too long
    initTimeoutRef.current = window.setTimeout(() => {
      if (!isInitialized) {
        console.warn("Auth initialization timed out - forcing completion");
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
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      try {
        if (!stateChangeHandled.current) {
          stateChangeHandled.current = true;
          setTimeout(() => {
            stateChangeHandled.current = false;
          }, 100);
        }
  
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
  
        if (currentSession?.user) {
          // Synchroniser le profil utilisateur (mettre à jour l'email)
          // Use setTimeout to avoid potential deadlock with Supabase auth state change
          setTimeout(async () => {
            try {
              await syncUserProfile(currentSession.user.id, currentSession.user.email);
              await fetchAdminStatus(currentSession.user.id);
            } catch (err) {
              console.error("Error syncing user profile:", err);
            }
          }, 0);
  
          localStorage.setItem("user", JSON.stringify({ 
            id: currentSession.user.id,
            email: currentSession.user.email 
          }));
        } else if (event === 'SIGNED_OUT') {
          try {
            localStorage.removeItem("user");
          } catch (e) {
            console.warn("Could not remove user from localStorage:", e);
          }
          setSession(null);
          setUser(null);
          setIsAdmin(false);
        }
  
        // Always set isInitialized to true, even if no session is found
        if (!isInitialized) {
          setIsInitialized(true);
        }
        setIsLoading(false);
      } catch (err) {
        console.error("Error handling auth state change:", err);
        setIsInitialized(true);  // Ensure initialization completes even on error
        setIsLoading(false);
      }
    });

    const initializeAuth = async () => {
      try {
        if (authChecked.current) return;
        authChecked.current = true;

        const { data: { session: currentSession }, error } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          // Use setTimeout to avoid potential deadlock with Supabase auth
          setTimeout(async () => {
            try {
              await syncUserProfile(currentSession.user.id, currentSession.user.email);
              await fetchAdminStatus(currentSession.user.id);
            } catch (err) {
              console.error("Error during user profile sync:", err);
            }
          }, 0);
        }

        // Always set isInitialized to true, regardless of session status
        setIsInitialized(true);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching session:", error);
        toast.error("Erreur de connexion à Supabase");
        setError("Erreur de connexion à Supabase");
        // Ensure initialization completes even on error
        setIsInitialized(true);
        setIsLoading(false);
      }
    };

    initializeAuth().catch(err => {
      console.error("Failed to initialize auth:", err);
      setIsInitialized(true);  // Ensure initialization completes on error
      setIsLoading(false);
    });

    return () => {
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
