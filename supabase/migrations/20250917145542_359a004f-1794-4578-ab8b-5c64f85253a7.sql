-- DÉSACTIVER RLS COMPLÈTEMENT (temporaire pour debug)
ALTER TABLE public.reading_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_validations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_questions DISABLE ROW LEVEL SECURITY;

-- Permissions totales (temporaire)
GRANT ALL ON public.reading_progress TO anon, authenticated;
GRANT ALL ON public.reading_validations TO anon, authenticated;
GRANT ALL ON public.reading_questions TO anon, authenticated;

-- Fonction simplifiée au maximum
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
AS $$
BEGIN
  -- Juste insérer sans vérifications complexes
  INSERT INTO reading_validations (user_id, book_id, question_id, answer, segment, used_joker, correct, validated_at)
  VALUES (p_user_id, p_book_id::text, p_question_id, p_answer, 0, p_used_joker, p_correct, now())
  ON CONFLICT DO NOTHING;

  INSERT INTO reading_progress (user_id, book_id, current_page, status, updated_at)
  VALUES (p_user_id, p_book_id::text, 1, 'in_progress', now())
  ON CONFLICT (user_id, book_id) DO UPDATE SET updated_at = now();

  RETURN jsonb_build_object('ok', true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.force_validate_segment_beta TO anon, authenticated;