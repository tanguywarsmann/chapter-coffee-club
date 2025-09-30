-- Corriger les warnings de sécurité
-- Activer RLS sur la table de sauvegarde
ALTER TABLE public._backup_reading_questions ENABLE ROW LEVEL SECURITY;

-- Créer une policy restrictive pour la sauvegarde (seuls les admins peuvent y accéder)
CREATE POLICY backup_admin_only ON public._backup_reading_questions
FOR ALL USING (get_current_user_admin_status());