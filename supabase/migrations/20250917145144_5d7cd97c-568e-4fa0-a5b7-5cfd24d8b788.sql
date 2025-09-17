-- DIAGNOSTIC: Vérifier et corriger les types de colonnes
DO $$
BEGIN
  -- Si book_id est UUID dans reading_progress, le convertir en TEXT
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reading_progress' 
    AND column_name = 'book_id' 
    AND data_type = 'uuid'
  ) THEN
    ALTER TABLE reading_progress ALTER COLUMN book_id TYPE text USING book_id::text;
  END IF;
  
  -- Si book_id est UUID dans reading_validations, le convertir en TEXT
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reading_validations' 
    AND column_name = 'book_id' 
    AND data_type = 'uuid'
  ) THEN
    ALTER TABLE reading_validations ALTER COLUMN book_id TYPE text USING book_id::text;
  END IF;
END $$;

-- Recréer la fonction avec les bons types
DROP FUNCTION IF EXISTS public.force_validate_segment_beta CASCADE;

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
AS $$
DECLARE
  v_segment        integer;
  v_progress_id    uuid;
  v_validation_id  uuid;
  v_book_id_str    text;
BEGIN
  -- Log pour debug
  RAISE NOTICE 'force_validate_segment_beta called with book_id=%, question_id=%, user_id=%', p_book_id, p_question_id, p_user_id;
  
  IF p_user_id IS NULL OR p_book_id IS NULL OR p_question_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'code', 'ARG_MISSING', 'message', 'Paramètres requis manquants');
  END IF;

  v_book_id_str := p_book_id::text;

  -- Récupérer le segment
  SELECT rq.segment INTO v_segment
  FROM public.reading_questions rq
  WHERE rq.id = p_question_id;
  
  IF NOT FOUND THEN
    RAISE NOTICE 'Question % not found', p_question_id;
    v_segment := 0;
  END IF;
  
  v_segment := COALESCE(v_segment, 0);
  RAISE NOTICE 'Segment found: %', v_segment;

  -- Créer ou mettre à jour la progression
  INSERT INTO public.reading_progress (
    user_id, book_id, current_page, total_pages, status, started_at, updated_at
  )
  VALUES (
    p_user_id, 
    v_book_id_str, 
    v_segment, 
    0, 
    'in_progress',
    now(),
    now()
  )
  ON CONFLICT (user_id, book_id) 
  DO UPDATE SET
    current_page = GREATEST(COALESCE(reading_progress.current_page, 0), EXCLUDED.current_page),
    updated_at = now()
  RETURNING id INTO v_progress_id;
  
  RAISE NOTICE 'Progress ID: %', v_progress_id;

  -- Créer ou mettre à jour la validation
  INSERT INTO public.reading_validations (
    user_id, book_id, progress_id, question_id, answer, segment, used_joker, correct, validated_at
  )
  VALUES (
    p_user_id, 
    v_book_id_str, 
    v_progress_id, 
    p_question_id, 
    COALESCE(p_answer, ''), 
    v_segment,
    COALESCE(p_used_joker, false), 
    COALESCE(p_correct, true), 
    now()
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
  
  RAISE NOTICE 'Validation ID: %', v_validation_id;

  RETURN jsonb_build_object(
    'ok', true,
    'validation_id', v_validation_id,
    'progress_id', v_progress_id,
    'validated_segment', v_segment
  );

EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Error in force_validate_segment_beta: % %', SQLSTATE, SQLERRM;
  RETURN jsonb_build_object('ok', false, 'code', SQLSTATE, 'message', SQLERRM);
END;
$$;

-- Permissions
GRANT EXECUTE ON FUNCTION public.force_validate_segment_beta(uuid,uuid,text,uuid,boolean,boolean) TO anon, authenticated;

-- DÉSACTIVER temporairement RLS pour debug
ALTER TABLE public.reading_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_validations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_questions DISABLE ROW LEVEL SECURITY;

-- Permissions directes temporaires (pour debug)
GRANT ALL ON public.reading_progress TO authenticated;
GRANT ALL ON public.reading_validations TO authenticated;
GRANT ALL ON public.reading_questions TO authenticated;

-- Vérification finale
SELECT 'Tables sans RLS pour debug' as status;