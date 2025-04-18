
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Bell, Lock, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function UserSettings() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    toast.success("Déconnexion réussie");
    navigate("/");
  };

  return (
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
        
        <Button variant="outline" className="w-full justify-start">
          <Bell className="h-4 w-4 mr-2" />
          Gérer les notifications
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
  );
}
