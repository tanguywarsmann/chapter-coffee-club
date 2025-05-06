
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

  const fetchAdminStatus = async (userId: string) => {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log("Fetching admin status for user ID:", userId);
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', userId)
        .single();

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

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
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
        setTimeout(async () => {
          await syncUserProfile(currentSession.user.id, currentSession.user.email);
          await fetchAdminStatus(currentSession.user.id);
        }, 0);

        localStorage.setItem("user", JSON.stringify({ 
          id: currentSession.user.id,
          email: currentSession.user.email 
        }));
      } else if (event === 'SIGNED_OUT') {
        localStorage.removeItem("user");
        setSession(null);
        setUser(null);
        setIsAdmin(false);
      }

      if (!isInitialized) {
        setIsInitialized(true);
      }
      setIsLoading(false);
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
          // Synchroniser le profil utilisateur lors de l'initialisation
          await syncUserProfile(currentSession.user.id, currentSession.user.email);
          const adminStatus = await fetchAdminStatus(currentSession.user.id);
          setIsAdmin(adminStatus);
        }

        setIsInitialized(true);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching session:", error);
        toast.error("Erreur de connexion à Supabase");
        setError("Erreur de connexion à Supabase");
        setIsInitialized(true);
        setIsLoading(false);
      }
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ session, user, isLoading, isInitialized, isAdmin, error, setError }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
