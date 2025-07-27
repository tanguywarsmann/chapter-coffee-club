
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function AdminDebugPanel() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkAdminStatus() {
      if (!user) {
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
        } else {
          setIsAdmin(data?.is_admin || false);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    }

    checkAdminStatus();
  }, [user]);
  
  if (isLoading) {
    return (
      <Card className="p-4 mb-6 bg-amber-50 border-amber-300">
        <h3 className="text-h4 font-medium mb-2 text-amber-800">Panneau de débogage administrateur</h3>
        <p className="text-body-sm">Vérification des permissions...</p>
      </Card>
    );
  }

  return (
    <Card className="p-4 mb-6 bg-amber-50 border-amber-300">
      <h3 className="text-h4 font-medium mb-2 text-amber-800">Panneau de débogage administrateur</h3>
      <div className="space-y-1 text-body-sm">
        <p><span className="font-semibold">Email utilisateur :</span> {user?.email || 'Non connecté'}</p>
        <p><span className="font-semibold">Accès administrateur autorisé :</span> {isAdmin ? 'Oui' : 'Non'}</p>
        <p><span className="font-semibold">ID utilisateur :</span> {user?.id || 'N/A'}</p>
        <p className="text-caption text-amber-600 mt-2">Statut basé sur la base de données</p>
      </div>
    </Card>
  );
}
