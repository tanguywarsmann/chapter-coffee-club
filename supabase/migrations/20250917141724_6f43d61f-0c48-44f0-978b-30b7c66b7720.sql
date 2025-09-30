-- Drop existing function to recreate with robust error handling
DROP FUNCTION IF EXISTS public.force_validate_segment_beta(uuid, uuid, text, uuid, boolean, boolean);

-- Create robust RPC function that returns jsonb and handles all errors gracefully
CREATE OR REPLACE FUNCTION public.force_validate_segment_beta(
  p_book_id uuid,
  p_question_id uuid,
  p_answer text,
  p_user_id uuid,
  p_used_joker boolean DEFAULT false,
  p_correct boolean DEFAULT true
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_segment integer;
  v_progress_id uuid;
  v_validation_id uuid;
  v_book_id_text text;
BEGIN
  -- Validation des paramètres
  IF p_user_id IS NULL OR p_book_id IS NULL OR p_question_id IS NULL THEN
    RETURN jsonb_build_object(
      'ok', false,
      'code', 'ARG_MISSING',
      'message', 'missing_required_arg'
    );
  END IF;

  -- Récupérer le segment depuis reading_questions
  SELECT rq.segment INTO v_segment
  FROM public.reading_questions rq
  WHERE rq.id = p_question_id;

  IF v_segment IS NULL THEN
    RETURN jsonb_build_object(
      'ok', false,
      'code', 'QUESTION_NOT_FOUND',
      'message', 'question inconnue'
    );
  END IF;

  -- Convertir book_id en text pour les tables qui l'attendent
  v_book_id_text := p_book_id::text;

  -- 1) Upsert progression (book_id est text dans reading_progress)
  INSERT INTO public.reading_progress AS rp
    (user_id, book_id, current_page, total_pages, status, started_at, updated_at)
  VALUES
    (p_user_id, v_book_id_text, v_segment, 0, 'in_progress', now(), now())
  ON CONFLICT (user_id, book_id)
  DO UPDATE SET
    current_page = GREATEST(COALESCE(rp.current_page, 0), EXCLUDED.current_page),
    updated_at = now()
  RETURNING rp.id INTO v_progress_id;

  -- 2) Upsert validation (book_id est text dans reading_validations)
  INSERT INTO public.reading_validations AS rv
    (user_id, book_id, progress_id, question_id, answer, segment, used_joker, correct, validated_at)
  VALUES
    (p_user_id, v_book_id_text, v_progress_id, p_question_id, p_answer, v_segment,
     COALESCE(p_used_joker, false), COALESCE(p_correct, true), now())
  ON CONFLICT ON CONSTRAINT reading_validations_user_id_book_id_segment_key
  DO UPDATE SET
    question_id = EXCLUDED.question_id,
    answer = EXCLUDED.answer,
    used_joker = EXCLUDED.used_joker,
    correct = EXCLUDED.correct,
    progress_id = COALESCE(rv.progress_id, EXCLUDED.progress_id),
    validated_at = now()
  RETURNING rv.id INTO v_validation_id;

  -- Succès
  RETURN jsonb_build_object(
    'ok', true,
    'validation_id', v_validation_id,
    'progress_id', v_progress_id,
    'validated_segment', v_segment
  );

EXCEPTION WHEN OTHERS THEN
  -- Capturer toute erreur et la retourner dans le JSON
  RETURN jsonb_build_object(
    'ok', false,
    'code', SQLSTATE,
    'message', SQLERRM
  );
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.force_validate_segment_beta(uuid,uuid,text,uuid,boolean,boolean) TO anon, authenticated;

-- Ensure RLS policies exist for reading_progress
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'reading_progress' 
    AND policyname = 'Allow insert own progress'
  ) THEN
    CREATE POLICY "Allow insert own progress" ON public.reading_progress
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'reading_progress' 
    AND policyname = 'Allow read own progress'
  ) THEN
    CREATE POLICY "Allow read own progress" ON public.reading_progress
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- Ensure RLS policies exist for reading_validations
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'reading_validations' 
    AND policyname = 'Allow insert own validation'
  ) THEN
    CREATE POLICY "Allow insert own validation" ON public.reading_validations
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'reading_validations' 
    AND policyname = 'Allow read own validations'
  ) THEN
    CREATE POLICY "Allow read own validations" ON public.reading_validations
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- Ensure RLS policy exists for profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles' 
    AND policyname = 'read own profile'
  ) THEN
    CREATE POLICY "read own profile" ON public.profiles
    FOR SELECT TO authenticated
    USING (id = auth.uid());
  END IF;
END $$;