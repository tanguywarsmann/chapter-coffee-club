-- Ajouter le champ used_joker à la table reading_validations
ALTER TABLE public.reading_validations 
ADD COLUMN used_joker boolean NOT NULL DEFAULT false;

-- Commentaire pour documenter le nouveau champ
COMMENT ON COLUMN public.reading_validations.used_joker IS 'Indique si ce segment a été validé grâce à un joker (tolérance en cas de mauvaise réponse)';