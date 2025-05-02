
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";

export function AdminDebugPanel() {
  const { user, isAdmin } = useAuth();
  
  return (
    <Card className="p-4 mb-6 bg-amber-50 border-amber-300">
      <h3 className="text-lg font-medium mb-2 text-amber-800">Panneau de débogage administrateur</h3>
      <div className="space-y-1 text-sm">
        <p><span className="font-semibold">Email utilisateur :</span> {user?.email || 'Non connecté'}</p>
        <p><span className="font-semibold">Statut administrateur :</span> {isAdmin ? 'Oui' : 'Non'}</p>
        <p><span className="font-semibold">ID utilisateur :</span> {user?.id || 'N/A'}</p>
        <p className="text-xs text-amber-600 mt-2">Ce panneau est temporaire et peut être supprimé après les tests.</p>
      </div>
    </Card>
  );
}
