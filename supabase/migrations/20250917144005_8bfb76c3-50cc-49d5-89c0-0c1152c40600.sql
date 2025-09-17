-- Drop anciennes versions pour éviter conflits de signatures
DROP FUNCTION IF EXISTS public.force_validate_segment_beta(uuid,uuid,text,uuid,boolean,boolean);
DROP FUNCTION IF EXISTS public.force_validate_segment_beta;

-- Fonction RPC robuste avec retour JSON (jamais d'erreur 400)
CREATE OR REPLACE FUNCTION public.force_validate_segment_beta(
  p_book_id      uuid,
  p_question_id  uuid,
  p_answer       text,
  p_user_id      uuid,
  p_used_joker   boolean DEFAULT false,
  p_correct      boolean DEFAULT true
) 
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_segment        integer;
  v_progress_id    uuid;
  v_validation_id  uuid;
  v_book_id_str    text;
BEGIN
  -- Validation arguments
  IF p_user_id IS NULL OR p_book_id IS NULL OR p_question_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'code', 'ARG_MISSING', 'message', 'Paramètres requis manquants');
  END IF;

  v_book_id_str := p_book_id::text;

  -- Récupérer segment (qualifier pour éviter ambiguïté)
  SELECT rq.segment INTO v_segment
  FROM public.reading_questions rq
  WHERE rq.id = p_question_id;
  
  v_segment := COALESCE(v_segment, 0);

  -- UPSERT progression atomique
  INSERT INTO public.reading_progress (
    user_id, book_id, current_page, total_pages, status, started_at, updated_at
  )
  VALUES (
    p_user_id, v_book_id_str, v_segment, 0, 'in_progress',
    COALESCE((SELECT started_at FROM reading_progress WHERE user_id = p_user_id AND book_id = v_book_id_str), now()),
    now()
  )
  ON CONFLICT (user_id, book_id) 
  DO UPDATE SET
    current_page = GREATEST(COALESCE(reading_progress.current_page, 0), EXCLUDED.current_page),
    updated_at = now()
  RETURNING id INTO v_progress_id;

  -- UPSERT validation idempotent
  INSERT INTO public.reading_validations (
    user_id, book_id, progress_id, question_id, answer, segment, used_joker, correct, validated_at
  )
  VALUES (
    p_user_id, v_book_id_str, v_progress_id, p_question_id, 
    COALESCE(p_answer, ''), v_segment,
    COALESCE(p_used_joker, false), COALESCE(p_correct, true), now()
  )
  ON CONFLICT ON CONSTRAINT reading_validations_user_id_book_id_segment_key 
  DO UPDATE SET
    question_id = EXCLUDED.question_id,
    answer = EXCLUDED.answer,
    used_joker = EXCLUDED.used_joker,
    correct = EXCLUDED.correct,
    progress_id = COALESCE(reading_validations.progress_id, EXCLUDED.progress_id),
    validated_at = now()
  RETURNING id INTO v_validation_id;

  RETURN jsonb_build_object(
    'ok', true,
    'validation_id', v_validation_id,
    'progress_id', v_progress_id,
    'validated_segment', v_segment
  );

EXCEPTION WHEN OTHERS THEN
  -- Encapsuler TOUTE erreur dans JSON (plus de 400!)
  RETURN jsonb_build_object('ok', false, 'code', SQLSTATE, 'message', SQLERRM);
END;
$$;

-- Permissions
GRANT EXECUTE ON FUNCTION public.force_validate_segment_beta(uuid,uuid,text,uuid,boolean,boolean) TO anon, authenticated;

-- CRITICAL: Policies RLS pour permettre l'accès aux données
ALTER TABLE public.reading_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_validations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_questions ENABLE ROW LEVEL SECURITY;

-- Policies reading_progress
DROP POLICY IF EXISTS "Users can view own progress" ON public.reading_progress;
DROP POLICY IF EXISTS "Users can insert own progress" ON public.reading_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON public.reading_progress;

CREATE POLICY "Users can view own progress" ON public.reading_progress
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON public.reading_progress
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON public.reading_progress
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Policies reading_validations
DROP POLICY IF EXISTS "Users can view own validations" ON public.reading_validations;
DROP POLICY IF EXISTS "Users can insert own validations" ON public.reading_validations;
DROP POLICY IF EXISTS "Users can update own validations" ON public.reading_validations;

CREATE POLICY "Users can view own validations" ON public.reading_validations
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own validations" ON public.reading_validations
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own validations" ON public.reading_validations
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Policy reading_questions (lecture pour tous)
DROP POLICY IF EXISTS "Questions are viewable by authenticated users" ON public.reading_questions;
CREATE POLICY "Questions are viewable by authenticated users" ON public.reading_questions
  FOR SELECT TO authenticated USING (true);