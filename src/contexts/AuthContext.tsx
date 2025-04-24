
import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  isLoading: true,
  isInitialized: false
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const authChecked = useRef(false);
  
  useEffect(() => {
    // Important: First establish the auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      if (process.env.NODE_ENV === 'development') {
        console.log("Auth state changed:", event, currentSession?.user?.id);
      }
      
      // Update state with new session data
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      // For compatibility with existing code that uses localStorage
      if (currentSession?.user) {
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
        // This prevents race conditions where the event fires before the getSession completes
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // For compatibility with existing code that uses localStorage
        if (currentSession?.user) {
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
    <AuthContext.Provider value={{ session, user, isLoading, isInitialized }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
