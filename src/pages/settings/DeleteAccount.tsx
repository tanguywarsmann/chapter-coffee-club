import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ArrowLeft, Trash2, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { requestAccountDeletion } from "@/services/accountDeletion";

export function DeleteAccount() {
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      await requestAccountDeletion();
      
      toast.success("Compte supprimé avec succès");
      
      // Clear local storage and redirect to landing
      localStorage.clear();
      navigate("/", { replace: true });
    } catch (error) {
      toast.error("Erreur lors de la suppression du compte");
      console.error("Account deletion error:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
        </div>

        <Card className="border-destructive/20">
          <CardHeader>
            <CardTitle className="text-2xl font-serif text-destructive flex items-center gap-2">
              <Trash2 className="h-6 w-6" />
              Supprimer mon compte
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-destructive/10 p-4 rounded-lg border border-destructive/20">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <h3 className="font-semibold text-destructive">
                    Attention : Cette action est irréversible
                  </h3>
                  <ul className="text-sm text-coffee-darker/80 space-y-1">
                    <li>• Toutes vos données de lecture seront définitivement supprimées</li>
                    <li>• Votre progression et vos badges seront perdus</li>
                    <li>• Votre compte ne pourra pas être récupéré</li>
                    <li>• Vous devrez créer un nouveau compte pour utiliser VREAD</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-coffee-darker/80">
                Si vous souhaitez vraiment supprimer votre compte VREAD et toutes les données associées, 
                cliquez sur le bouton ci-dessous. Cette action supprimera définitivement :
              </p>
              
              <ul className="text-sm text-coffee-darker/80 space-y-1 pl-4">
                <li>• Votre profil utilisateur</li>
                <li>• Toute votre progression de lecture</li>
                <li>• Vos validations et historique</li>
                <li>• Vos badges et récompenses</li>
                <li>• Vos préférences et paramètres</li>
              </ul>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  className="w-full"
                  disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer définitivement mon compte
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-destructive">
                    Confirmer la suppression du compte
                  </AlertDialogTitle>
                  <AlertDialogDescription className="space-y-2">
                    <p>
                      Êtes-vous absolument certain de vouloir supprimer votre compte VREAD ?
                    </p>
                    <p className="font-semibold text-destructive">
                      Cette action est définitive et irréversible.
                    </p>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>
                    Annuler
                  </AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDeleteAccount}
                    className="bg-destructive hover:bg-destructive/90"
                    disabled={isDeleting}
                  >
                    {isDeleting ? "Suppression..." : "Oui, supprimer mon compte"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}