// src/pages/settings/DeleteAccount.tsx
import * as React from "react";
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { requestAccountDeletion } from "@/services/accountDeletion";
import { toast } from "sonner";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { logger } from "@/utils/logger";

export function DeleteAccount() {
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleDelete = useCallback(async () => {
    logger.info("🗑️ handleDelete: Starting account deletion flow");

    try {
      setIsDeleting(true);

      // 1) Supprime côté serveur (données + compte Auth via Edge Function)
      logger.info("Step 1: Calling requestAccountDeletion");
      await requestAccountDeletion();
      logger.info("Step 1: ✅ Account deleted on server");

      // 2) Purge immédiate de la session locale (évite un état "fantôme" en WebView)
      logger.info("Step 2: Signing out locally");
      try {
        await supabase.auth.signOut({ scope: "local" });
        logger.info("Step 2: ✅ Local signout successful");
      } catch (signOutError) {
        // L'utilisateur est déjà supprimé côté serveur, on ignore
        logger.info("Step 2: ⚠️ Signout error (expected if user already deleted):", signOutError);
      }

      // 3) Nettoyage du stockage local éventuel
      logger.info("Step 3: Clearing local storage");
      try {
        localStorage.clear();
        sessionStorage.clear();
        logger.info("Step 3: ✅ Local storage cleared");
      } catch (storageError) {
        logger.warn("Step 3: ⚠️ Storage clearing error:", storageError);
      }

      // 4) Feedback + redirection
      logger.info("Step 4: ✅ Account deletion complete, redirecting");
      toast.success("Compte supprimé avec succès", {
        duration: 3000
      });

      // Use setTimeout to ensure toast is visible before redirect
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 500);

    } catch (e: any) {
      logger.error("❌ Account deletion failed:", e);

      // Use the error message from the service (already localized)
      const msg = e?.message || "Erreur lors de la suppression du compte";

      toast.error(msg, {
        duration: 5000,
        description: "Si le problème persiste, contactez le support"
      });
    } finally {
      setIsDeleting(false);
      setConfirmOpen(false);
      logger.info("🗑️ handleDelete: Flow completed");
    }
  }, [navigate]);

  return (
    <div className="mx-auto w-full max-w-xl p-4 md:p-6">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour
      </button>

      <h1 className="mb-2 text-2xl font-semibold">Supprimer mon compte</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Cette action est <span className="font-semibold text-red-600">définitive</span> et{" "}
        <span className="font-semibold">irréversible</span>.
      </p>

      <div className="rounded-2xl border p-4 md:p-6">
        <div className="mb-4 flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 text-red-600" />
          <div>
            <p className="font-medium">Conséquences de la suppression</p>
            <ul className="mt-2 list-disc pl-5 text-sm text-muted-foreground">
              <li>Suppression de votre profil et de vos données de lecture</li>
              <li>Perte de votre progression, historique et badges</li>
              <li>Aucune récupération possible</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            onClick={() => setConfirmOpen(true)}
            disabled={isDeleting}
            className="inline-flex h-10 items-center justify-center rounded-lg bg-red-600 px-4 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
          >
            {isDeleting ? "Suppression..." : "Supprimer définitivement mon compte"}
          </button>

          <button
            onClick={() => navigate(-1)}
            className="inline-flex h-10 items-center justify-center rounded-lg border px-4 text-sm font-medium hover:bg-accent"
          >
            Annuler
          </button>
        </div>
      </div>

      {/* Confirmation minimaliste sans dépendance UI externe */}
      {confirmOpen && (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-background p-5 shadow-xl">
            <p className="text-lg font-semibold">Confirmer la suppression</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Êtes-vous absolument certain de vouloir supprimer votre compte VREAD ? Cette action est
              définitive.
            </p>
            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                onClick={() => setConfirmOpen(false)}
                className="inline-flex h-9 items-center justify-center rounded-lg border px-4 text-sm font-medium hover:bg-accent"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="inline-flex h-9 items-center justify-center rounded-lg bg-red-600 px-4 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
              >
                {isDeleting ? "Suppression..." : "Oui, supprimer mon compte"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DeleteAccount;
