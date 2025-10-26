-- Migration complète du système de quêtes VREAD (v2 - avec nettoyage)
-- Tables: quests + user_quests + 14 quêtes

-- 1. Créer la table quests si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.quests (
  slug TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'award',
  category TEXT NOT NULL DEFAULT 'general',
  xp_reward INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Créer la table user_quests si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.user_quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quest_slug TEXT NOT NULL REFERENCES public.quests(slug) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, quest_slug)
);

-- 3. Index pour performances
CREATE INDEX IF NOT EXISTS idx_user_quests_user_id ON public.user_quests(user_id);
CREATE INDEX IF NOT EXISTS idx_user_quests_slug ON public.user_quests(quest_slug);

-- 4. RLS: Nettoyer les policies existantes et les recréer
ALTER TABLE public.quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_quests ENABLE ROW LEVEL SECURITY;

-- Supprimer les policies existantes si présentes
DROP POLICY IF EXISTS "Authenticated users can view all quests" ON public.quests;
DROP POLICY IF EXISTS "Users can view their own quests" ON public.user_quests;
DROP POLICY IF EXISTS "Users can insert their own quests" ON public.user_quests;
DROP POLICY IF EXISTS "Users can delete their own quests" ON public.user_quests;

-- Recréer les policies
CREATE POLICY "Authenticated users can view all quests"
  ON public.quests FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can view their own quests"
  ON public.user_quests FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own quests"
  ON public.user_quests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own quests"
  ON public.user_quests FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 5. Insérer les 14 quêtes (ON CONFLICT DO NOTHING pour éviter doublons)
INSERT INTO public.quests (slug, title, description, icon, category, xp_reward) VALUES
  ('marathon_reader', 'Marathon du Lecteur', '10 validations en une seule journée', 'zap', 'marathons', 150),
  ('binge_reading', 'Binge Reading', 'Terminer 3 livres en 1 semaine', 'books', 'marathons', 200),
  ('night_marathon', 'Marathon Nocturne', '5 validations entre 22h et 6h', 'moon', 'marathons', 175),
  ('lightning_reader', 'Lecteur Éclair', 'Livre de 300+ pages en moins de 3 jours', 'zap', 'vitesse', 200),
  ('speed_demon', 'Démon de Vitesse', 'Terminer un livre en moins de 24h', 'flame', 'vitesse', 250),
  ('sprinter', 'Sprinter', 'Valider 50 pages en une seule session', 'rocket', 'vitesse', 150),
  ('explorer', 'Explorateur Littéraire', 'Lire 3 genres différents en 1 mois', 'compass', 'variete', 175),
  ('completionist', 'Complétionniste', 'Série complète (3+ livres du même auteur)', 'library', 'variete', 200),
  ('unstoppable', 'Inarrêtable', '30 jours consécutifs sans interruption', 'fire', 'regularite', 300),
  ('punctual', 'Ponctuel', 'Même heure (±1h) pendant 7 jours', 'clock', 'regularite', 150),
  ('perfect_month', 'Mois Parfait', 'Au moins 1 validation chaque jour pendant 30 jours', 'calendar', 'regularite', 250),
  ('early_bird', 'Lève-tôt Littéraire', 'Valider avant 7h du matin', 'sunrise', 'horaires', 75),
  ('night_owl', 'Hibou de Nuit', 'Valider après 23h', 'moon', 'horaires', 75),
  ('weekend_warrior', 'Guerrier du Week-end', 'Valider samedi ET dimanche du même weekend', 'calendar', 'horaires', 100)
ON CONFLICT (slug) DO NOTHING;