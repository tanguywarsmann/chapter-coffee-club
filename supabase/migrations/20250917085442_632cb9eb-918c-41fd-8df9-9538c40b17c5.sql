-- ============ MODE BÊTA OUVERT ============

-- 1) Désactiver la RLS sur les tables critiques
ALTER TABLE public.reading_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_validations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.books DISABLE ROW LEVEL SECURITY;

-- 2) Accorder les privilèges nécessaires
-- Écritures pour utilisateurs connectés
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reading_progress TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reading_validations TO authenticated;

-- Lecture pour tout le monde (app, pages publiques)
GRANT SELECT ON public.books TO anon, authenticated;
GRANT SELECT ON public.reading_questions TO anon, authenticated;

-- 3) Donne l'accès aux séquences si nécessaire
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- 4) Optionnel: neutraliser les triggers "utilisateur" qui lèvent des exceptions (ex: joker)
-- Décommente si tu vois encore une erreur type 'P0001: Nombre maximum de jokers...'
-- ALTER TABLE public.reading_validations DISABLE TRIGGER USER;

-- 5) Indice utile si absent
CREATE INDEX IF NOT EXISTS idx_rp_user_book ON public.reading_progress(user_id, book_id);