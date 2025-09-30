-- Créer une vue publique sécurisée pour reading_questions (sans la colonne 'answer')
CREATE OR REPLACE VIEW public.reading_questions_public AS
SELECT id, book_slug, segment, question, book_id
FROM public.reading_questions;

-- Donner accès à la vue aux utilisateurs authentifiés
GRANT SELECT ON public.reading_questions_public TO authenticated, anon;

-- Créer les index manquants pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_reading_questions_book_slug_segment 
ON public.reading_questions(book_slug, segment);

CREATE INDEX IF NOT EXISTS idx_reading_questions_book_id_segment 
ON public.reading_questions(book_id, segment);

-- Index pour les jokers révélés
CREATE INDEX IF NOT EXISTS idx_reading_validations_joker_revealed 
ON public.reading_validations (user_id, used_joker, revealed_answer_at) 
WHERE used_joker = true;