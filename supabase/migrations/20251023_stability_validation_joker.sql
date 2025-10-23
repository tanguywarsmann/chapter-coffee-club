-- 2025-10-23 — Stabilité Validation/Joker/Freeze

-- 0) Prérequis
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1) Index et schéma minimaux attendus
-- reading_validations: unicité par user+book+segment
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM   pg_indexes
    WHERE  schemaname = 'public'
    AND    tablename  = 'reading_validations'
    AND    indexname  = 'reading_validations_user_book_segment_uniq'
  ) THEN
    EXECUTE 'CREATE UNIQUE INDEX reading_validations_user_book_segment_uniq
             ON public.reading_validations(user_id, book_id, segment)';
  END IF;
END$$;

-- Defaults sûrs
ALTER TABLE public.reading_validations
  ALTER COLUMN used_joker SET DEFAULT false,
  ALTER COLUMN used_joker SET NOT NULL,
  ALTER COLUMN correct    SET DEFAULT true,
  ALTER COLUMN correct    SET NOT NULL;

-- Optionnel mais recommandé: assure l’unicité (user,book) dans reading_progress
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname='public' AND tablename='reading_progress'
      AND indexname='reading_progress_user_book_uniq'
  ) THEN
    BEGIN
      EXECUTE 'CREATE UNIQUE INDEX reading_progress_user_book_uniq
               ON public.reading_progress(user_id, book_id)';
    EXCEPTION WHEN duplicate_table THEN
      -- rien
    END;
  END IF;
END$$;

-- 2) Nettoyage des variantes de RPC parasites
DROP FUNCTION IF EXISTS public.force_validate_segment_beta(uuid, uuid, text);
DROP FUNCTION IF EXISTS public.force_validate_segment_beta(uuid, uuid, text, uuid);
DROP FUNCTION IF EXISTS public.force_validate_segment_beta(uuid, uuid, text, uuid, boolean, boolean);
DROP FUNCTION IF EXISTS public.force_validate_segment_beta(text, uuid, text); -- au cas où
DROP FUNCTION IF EXISTS public.force_validate_segment_beta(text, uuid, text, uuid);
DROP FUNCTION IF EXISTS public.force_validate_segment_beta(text, uuid, text, uuid, boolean, boolean);

-- 3) Version unique, idempotente, avec verrou et upsert "OR"
-- NB: p_book_id est TEXT pour rester compatible avec ton schéma actuel
CREATE OR REPLACE FUNCTION public.force_validate_segment_beta(
  p_book_id      text,
  p_question_id  uuid,
  p_answer       text,
  p_user_id      uuid,
  p_used_joker   boolean DEFAULT false,
  p_correct      boolean DEFAULT true
)
RETURNS TABLE(validation_id uuid, progress_id uuid, segment integer, action text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $func$
DECLARE
  v_segment      integer := 0;
  v_progress_id  uuid;
BEGIN
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'missing_user_id';
  END IF;
  IF p_book_id IS NULL OR length(p_book_id) = 0 THEN
    RAISE EXCEPTION 'missing_book_id';
  END IF;

  -- Verrou transactionnel contre double-clics/concurrence sur (user,book)
  PERFORM pg_advisory_xact_lock(
    ('x' || substr(encode(digest(p_user_id::text || '|' || p_book_id, 'sha1'),'hex'),1,16))::bit(64)::bigint
  );

  -- Segment depuis la question
  SELECT rq.segment
  INTO v_segment
  FROM public.reading_questions rq
  WHERE rq.id = p_question_id
    AND rq.book_id = p_book_id
  LIMIT 1;

  v_segment := COALESCE(v_segment, 0);

  -- Progress: upsert doux
  INSERT INTO public.reading_progress (user_id, book_id, status, current_page, total_pages, started_at)
  VALUES (p_user_id, p_book_id, 'in_progress', 0, 1, COALESCE(now(), now()))
  ON CONFLICT (user_id, book_id) DO UPDATE
    SET status = CASE WHEN reading_progress.status='completed' THEN 'completed' ELSE 'in_progress' END
  RETURNING id INTO v_progress_id;

  -- Validation idempotente. OR sur used_joker et correct pour empêcher tout "roll back"
  WITH up AS (
    INSERT INTO public.reading_validations (
      user_id, book_id, progress_id, question_id, answer, segment, used_joker, correct, validated_at
    ) VALUES (
      p_user_id, p_book_id, v_progress_id, p_question_id, p_answer, v_segment, p_used_joker, p_correct, now()
    )
    ON CONFLICT (user_id, book_id, segment)
    DO UPDATE SET
      question_id  = EXCLUDED.question_id,
      answer       = EXCLUDED.answer,
      used_joker   = (reading_validations.used_joker OR EXCLUDED.used_joker),
      correct      = (reading_validations.correct    OR EXCLUDED.correct),
      progress_id  = COALESCE(reading_validations.progress_id, EXCLUDED.progress_id),
      validated_at = now()
    RETURNING id, progress_id, (xmax = 0) AS inserted
  )
  SELECT id, progress_id, v_segment,
         CASE WHEN inserted THEN 'inserted' ELSE 'updated' END
  FROM up;

  -- Avancement monotone
  UPDATE public.reading_progress
  SET current_page = GREATEST(COALESCE(current_page,0), (v_segment + 1) * 20),
      updated_at   = now(),
      status       = CASE WHEN status='completed' THEN 'completed' ELSE 'in_progress' END
  WHERE id = v_progress_id;

END;
$func$;

REVOKE ALL ON FUNCTION public.force_validate_segment_beta(text, uuid, text, uuid, boolean, boolean) FROM public;
GRANT EXECUTE ON FUNCTION public.force_validate_segment_beta(text, uuid, text, uuid, boolean, boolean) TO anon, authenticated;

-- 4) Post-checks non bloquants
DO $$
BEGIN
  RAISE NOTICE 'Migration 20251023_stability_validation_joker appliquée.';
END$$;
