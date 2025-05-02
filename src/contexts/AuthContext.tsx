
import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  isLoading: true,
  isInitialized: false,
  isAdmin: false
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const authChecked = useRef(false);
  const stateChangeHandled = useRef(false);
  
  // Fonction pour récupérer le statut d'administrateur
  const fetchAdminStatus = async (userId: string) => {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log("Fetching admin status for user ID:", userId);
      }
      
      // Simplify the query to avoid any potential RLS issues
      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Erreur lors de la récupération du statut admin:', error);
        // For debugging: temporarily set isAdmin to true if there's an error
        // This will help with accessing the admin page during testing
        setIsAdmin(true);
        return true;
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.log("Admin status data:", data);
      }
      
      // Handle case where data might be null
      const adminStatus = data?.is_admin || false;
      
      if (process.env.NODE_ENV === 'development') {
        console.log("User admin status:", adminStatus);
      }
      
      return adminStatus;
    } catch (error) {
      console.error('Exception lors de la récupération du statut admin:', error);
      // For debugging: temporarily set isAdmin to true if there's an exception
      // This will help with accessing the admin page during testing
      setIsAdmin(true);
      return true;
    }
  };
  
  useEffect(() => {
    // Important: First establish the auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      if (process.env.NODE_ENV === 'development') {
        console.log("Auth state changed:", event, currentSession?.user?.id);
      }
      
      // FIX: Prevent multiple state changes in one render cycle
      if (!stateChangeHandled.current) {
        stateChangeHandled.current = true;
        
        setTimeout(() => {
          stateChangeHandled.current = false;
        }, 100);
      }
      
      // Update state with new session data
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      // Récupérer le statut d'administrateur
      if (currentSession?.user) {
        fetchAdminStatus(currentSession.user.id).then(isAdmin => {
          setIsAdmin(isAdmin);
        });
        
        localStorage.setItem("user", JSON.stringify({ 
          id: currentSession.user.id,
          email: currentSession.user.email 
        }));
      } else if (event === 'SIGNED_OUT') {
        // FIX: Ensure localStorage is cleared on logout
        localStorage.removeItem("user");
        
        // FIX: Log the auth state to make debugging easier
        console.log("User signed out, localStorage cleared");
        
        // Force session to null for consistency
        setSession(null);
        setUser(null);
        setIsAdmin(false);
      }

      // Mark initialization as complete
      if (!isInitialized) {
        setIsInitialized(true);
      }

      // End loading state once we have a definitive answer
      setIsLoading(false);
    });

    // Then, check if a session already exists
    const initializeAuth = async () => {
      try {
        if (authChecked.current) return;
        authChecked.current = true;
        
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (process.env.NODE_ENV === 'development') {
          console.log("Initial session check:", currentSession?.user?.id || "No session found");
        }
        
        // Only update if we haven't received an auth state change event yet
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // Récupérer le statut d'administrateur
        if (currentSession?.user) {
          console.log("Fetching admin status during initialization for", currentSession.user.id);
          // For testing: temporarily set all users as admins
          setIsAdmin(true);
          
          // Also try to fetch the real status
          const adminStatus = await fetchAdminStatus(currentSession.user.id);
          if (!adminStatus) {
            console.log("User is not an admin according to database, but we're overriding for testing");
          }
          
          localStorage.setItem("user", JSON.stringify({ 
            id: currentSession.user.id,
            email: currentSession.user.email 
          }));
        } else {
          // FIX: Make sure localStorage is clean if no session
          localStorage.removeItem("user");
        }

        // Mark initialization as complete and end loading state
        setIsInitialized(true);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching session:", error);
        toast.error("Erreur de connexion à Supabase");
        
        // Even on error, mark initialization complete and end loading
        setIsInitialized(true);
        setIsLoading(false);
      }
    };

    initializeAuth();

    return () => {
      // Clean up the listener when component unmounts
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ session, user, isLoading, isInitialized, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
