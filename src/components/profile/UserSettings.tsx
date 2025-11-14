
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Bell, Lock, LogOut, Trash2, FileText, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { NotificationSettings } from "@/components/settings/NotificationSettings";

export function UserSettings() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error("Erreur lors de la déconnexion");
        return;
      }
      
      toast.success("Déconnexion réussie");
      navigate("/");
    } catch (error) {
      toast.error("Erreur lors de la déconnexion");
    }
  };

  return (
    <div className="space-y-6">
      <NotificationSettings />
      
      <Card className="border-coffee-light sticky top-20">
        <CardHeader>
          <CardTitle className="text-xl font-serif text-coffee-darker flex items-center gap-2">
            <Settings className="h-5 w-5 text-coffee-dark" />
            Réglages
          </CardTitle>
        </CardHeader>
      <CardContent className="space-y-4">
        <Button variant="outline" className="w-full justify-start">
          <Lock className="h-4 w-4 mr-2" />
          Changer le mot de passe
        </Button>
        
        <Button 
          variant="outline" 
          className="w-full justify-start"
          onClick={() => navigate("/legal/privacy")}
        >
          <Shield className="h-4 w-4 mr-2" />
          Politique de confidentialité
        </Button>
        
        <Button 
          variant="outline" 
          className="w-full justify-start"
          onClick={() => navigate("/legal/terms")}
        >
          <FileText className="h-4 w-4 mr-2" />
          Conditions d'utilisation
        </Button>
        
        <Button 
          variant="outline" 
          className="w-full justify-start text-destructive hover:text-destructive"
          onClick={() => navigate("/settings/delete-account")}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Supprimer mon compte
        </Button>
        
        <Button 
          variant="outline" 
          className="w-full justify-start text-destructive hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Se déconnecter
        </Button>
      </CardContent>
    </Card>
    </div>
  );
}
