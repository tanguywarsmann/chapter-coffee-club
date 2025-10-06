
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
      
      console.log('[AUTH] Fetching profile for user:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin, is_premium, premium_since')
        .eq('id', userId)
        .maybeSingle();

      // DEBUG TEMPORAIRE
      const debugDiv = document.getElementById('debug-premium') || document.createElement('div');
      debugDiv.id = 'debug-premium';
      debugDiv.style.cssText = 'position:fixed;top:50px;left:0;background:blue;color:white;padding:10px;zIndex:9999;fontSize:16px;maxWidth:400px';
      debugDiv.innerHTML = `
        <div>userId: ${userId}</div>
        <div>data: ${JSON.stringify(data)}</div>
        <div>error: ${JSON.stringify(error)}</div>
        <div>data?.is_premium: ${data?.is_premium}</div>
      `;
      document.body.appendChild(debugDiv);

      console.log('[AUTH] Profile data fetched:', data);
      console.log('[AUTH] Profile error:', error);

      if (error) {
        console.error('Error fetching user status:', error);
        setIsAdmin(false);
        setIsPremium(false);
        return { isAdmin: false, isPremium: false };
      }

      const adminStatus = data?.is_admin || false;
      const premiumStatus = data?.is_premium || false;
      
      console.log('[AUTH] Setting isPremium to:', premiumStatus);
      console.log('[AUTH] Setting isAdmin to:', adminStatus);
      
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
        console.log('[AUTH] Enriched user object:', enrichedUser);
        return enrichedUser;
      });
      
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
