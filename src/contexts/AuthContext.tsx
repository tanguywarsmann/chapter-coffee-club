
import { createContext, useContext, useEffect, useState } from 'react';
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
  
  useEffect(() => {
    // Important: Établir d'abord l'écouteur de changement d'état d'auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      console.log("Auth state changed:", event, currentSession?.user?.id);
      
      // Mettre à jour l'état avec les nouvelles données de session
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      // Pour compatibilité avec le code existant qui utilise localStorage
      if (currentSession?.user) {
        localStorage.setItem("user", JSON.stringify({ 
          id: currentSession.user.id,
          email: currentSession.user.email 
        }));
      } else if (event === 'SIGNED_OUT') {
        localStorage.removeItem("user");
      }
    });

    // Ensuite, vérifier si une session existe déjà
    const initializeAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        console.log("Initial session check:", currentSession?.user?.id || "No session found");
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // Pour compatibilité avec le code existant qui utilise localStorage
        if (currentSession?.user) {
          localStorage.setItem("user", JSON.stringify({ 
            id: currentSession.user.id,
            email: currentSession.user.email 
          }));
        }
      } catch (error) {
        console.error("Error fetching session:", error);
        toast.error("Erreur de connexion à Supabase");
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    initializeAuth();

    return () => {
      // Nettoyer l'écouteur lors du démontage du composant
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
