-- Remplace toute version précédente de la RPC par une version UPSERT.
CREATE OR REPLACE FUNCTION public.force_validate_segment_beta(
  p_book_id uuid,
  p_question_id uuid,
  p_answer text,
  p_user_id uuid,
  p_used_joker boolean DEFAULT false,
  p_correct boolean DEFAULT true
)
RETURNS TABLE(validation_id uuid, progress_id uuid, segment integer, action text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_segment integer := 0;
  v_progress_id uuid;
BEGIN
  -- Pas d'auth: on exige p_user_id depuis le front
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'missing_user_id';
  END IF;

  -- Segment depuis la question (fallback à 0)
  SELECT rq.segment INTO v_segment
  FROM public.reading_questions rq
  WHERE rq.id = p_question_id;
  v_segment := COALESCE(v_segment, 0);

  -- Best-effort: assurer la progression (ne bloque jamais)
  BEGIN
    SELECT id INTO v_progress_id
    FROM public.reading_progress
    WHERE user_id = p_user_id AND book_id = p_book_id::text
    LIMIT 1;

    IF v_progress_id IS NULL THEN
      INSERT INTO public.reading_progress (user_id, book_id, current_page, total_pages, status, started_at, updated_at)
      VALUES (p_user_id, p_book_id::text, 0, 0, 'in_progress', now(), now())
      RETURNING id INTO v_progress_id;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    v_progress_id := NULL;
  END;

  -- UPSERT: une seule validation par (user_id, book_id, segment)
  RETURN QUERY
  WITH up AS (
    INSERT INTO public.reading_validations (
      user_id, book_id, progress_id, question_id, answer, segment, used_joker, correct, validated_at
    )
    VALUES (
      p_user_id, p_book_id::text, v_progress_id, p_question_id, p_answer, v_segment, p_used_joker, p_correct, now()
    )
    ON CONFLICT (user_id, book_id, segment)
    DO UPDATE SET
      question_id  = EXCLUDED.question_id,
      answer       = EXCLUDED.answer,
      used_joker   = EXCLUDED.used_joker,
      correct      = EXCLUDED.correct,
      progress_id  = COALESCE(reading_validations.progress_id, EXCLUDED.progress_id),
      validated_at = now()
    RETURNING id, progress_id, (xmax = 0) AS inserted
  )
  SELECT id AS validation_id,
         progress_id,
         v_segment AS segment,
         CASE WHEN inserted THEN 'inserted' ELSE 'updated' END AS action
  FROM up;

  -- Best-effort: bump progress (non bloquant)
  BEGIN
    IF v_segment IS NOT NULL AND v_progress_id IS NOT NULL THEN
      UPDATE public.reading_progress
      SET current_page = GREATEST(COALESCE(current_page, 0), v_segment),
          updated_at   = now(),
          status       = CASE WHEN status = 'completed' THEN 'completed' ELSE 'in_progress' END
      WHERE id = v_progress_id;
    END IF;
  EXCEPTION WHEN OTHERS THEN 
    NULL; 
  END;

END;
$$;

-- Exécution autorisée pour anon + authenticated (bêta)
REVOKE ALL ON FUNCTION public.force_validate_segment_beta(uuid, uuid, text, uuid, boolean, boolean) FROM public;
GRANT EXECUTE ON FUNCTION public.force_validate_segment_beta(uuid, uuid, text, uuid, boolean, boolean) TO anon, authenticated;

-- Bêta: s'assurer que validations ne bloque pas
ALTER TABLE public.reading_validations DISABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reading_validations TO anon, authenticated;

-- Indices/contraintes (si non présents)
CREATE UNIQUE INDEX IF NOT EXISTS reading_validations_user_book_segment_idx
  ON public.reading_validations(user_id, book_id, segment);

-- S'assurer que segment a un default et que progress_id est nullable
ALTER TABLE public.reading_validations
  ALTER COLUMN segment SET DEFAULT 0;

ALTER TABLE public.reading_validations
  ALTER COLUMN progress_id DROP NOT NULL;