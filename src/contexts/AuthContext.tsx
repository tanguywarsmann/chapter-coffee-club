
import { createContext, useContext, useEffect, useState } from 'react';
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
  isPremium: boolean;
  error: string | null;
  setError: (error: string | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  isLoading: true,
  isInitialized: false,
  isAdmin: false,
  isPremium: false,
  error: null,
  setError: () => {}
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserStatus = async (userId: string) => {
    try {
      if (!userId) return { isAdmin: false, isPremium: false };
      
      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin, is_premium')
        .eq('id', userId)
        .maybeSingle();

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
      return { isAdmin: adminStatus, isPremium: premiumStatus };
    } catch (error) {
      console.error('Exception when fetching user status:', error);
      setIsAdmin(false);
      setIsPremium(false);
      return { isAdmin: false, isPremium: false };
    }
  };

  useEffect(() => {
    console.info("[AUTH CONTEXT] Initializing");
    
    // First set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.info(`[AUTH CONTEXT] Auth state change event: ${event}`);
      
      // Update state with current session data
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      // If user exists, sync their profile
      if (currentSession?.user) {
        // Use setTimeout to avoid potential deadlock with Supabase auth
        setTimeout(async () => {
          try {
            await syncUserProfile(currentSession.user.id, currentSession.user.email);
            await fetchUserStatus(currentSession.user.id);
          } catch (err) {
            console.error("[AUTH CONTEXT] Error during profile sync:", err);
          }
        }, 0);
      }
      
      // Always set initialized to true and loading to false
      setIsInitialized(true);
      setIsLoading(false);
      
      console.info("[AUTH CONTEXT]", { 
        isInitialized: true, 
        isLoading: false, 
        user: currentSession?.user?.id || null 
      });
    });
    
    // Then check for existing session
    const initializeAuth = async () => {
      try {
        console.info("[AUTH CONTEXT] Fetching initial session");
        
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("[AUTH CONTEXT] Error fetching session:", error);
          toast.error("Error connecting to Supabase");
          setError("Error connecting to Supabase");
        }
        
        // Update state with session data
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // If user exists, sync their profile
        if (currentSession?.user) {
          // Use setTimeout to avoid potential deadlock with Supabase auth
          setTimeout(async () => {
            try {
              await syncUserProfile(currentSession.user.id, currentSession.user.email);
              await fetchUserStatus(currentSession.user.id);
            } catch (err) {
              console.error("[AUTH CONTEXT] Error during profile sync:", err);
            }
          }, 0);
        }
        
        // Always set initialized to true and loading to false, regardless of session status
        setIsInitialized(true);
        setIsLoading(false);
        
        console.info("[AUTH CONTEXT]", { 
          isInitialized: true, 
          isLoading: false, 
          user: currentSession?.user?.id || null 
        });
        
      } catch (error) {
        console.error("[AUTH CONTEXT] Error in initializeAuth:", error);
        
        // Even on error, we need to mark initialization as complete
        setIsInitialized(true);
        setIsLoading(false);
        
        console.info("[AUTH CONTEXT]", { 
          isInitialized: true, 
          isLoading: false, 
          user: null,
          error: "Initialization error"
        });
      }
    };
    
    // Initialize auth
    initializeAuth();
    
    // Clean up subscription
    return () => {
      console.info("[AUTH CONTEXT] Cleaning up auth subscription");
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ session, user, isLoading, isInitialized, isAdmin, isPremium, error, setError }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
