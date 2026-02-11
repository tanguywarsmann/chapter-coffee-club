
-- ============================================================
-- PHASE 1+3 : Reparation donnees perdues + backfill progress_id
-- ============================================================

-- Desactiver le trigger joker pour eviter l'erreur lors du backfill progress_id
ALTER TABLE reading_validations DISABLE TRIGGER check_joker_usage_trigger;

-- Phase 1: Garde-fou - verifier le nombre de paires orphelines
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM (
    SELECT DISTINCT rv.user_id, rv.book_id
    FROM reading_validations rv
    WHERE NOT EXISTS (
      SELECT 1 FROM reading_progress rp
      WHERE rp.user_id = rv.user_id AND rp.book_id = rv.book_id
    )
  ) orphans;

  IF v_count > 100 THEN
    RAISE EXCEPTION 'Trop de paires orphelines (%), abandon par securite', v_count;
  END IF;
  RAISE NOTICE 'Phase 1: % paires orphelines a reparer', v_count;
END;
$$;

-- Inserer les progress manquants (idempotent grace au WHERE NOT EXISTS)
INSERT INTO reading_progress (user_id, book_id, current_page, total_pages, status, started_at, completed_at, updated_at)
SELECT
  rv.user_id,
  rv.book_id,
  COALESCE(MAX(rv.segment) + 1, 1) * 30,
  COALESCE(b.total_pages, 1000),
  CASE
    WHEN COUNT(DISTINCT rv.segment) >= COALESCE(b.expected_segments, b.total_chapters, 999999)
    THEN 'completed'::reading_status
    ELSE 'in_progress'::reading_status
  END,
  MIN(rv.validated_at),
  CASE
    WHEN COUNT(DISTINCT rv.segment) >= COALESCE(b.expected_segments, b.total_chapters, 999999)
    THEN MAX(rv.validated_at)
    ELSE NULL
  END,
  MAX(rv.validated_at)
FROM reading_validations rv
LEFT JOIN books b ON b.id = rv.book_id
WHERE NOT EXISTS (
  SELECT 1 FROM reading_progress rp
  WHERE rp.user_id = rv.user_id AND rp.book_id = rv.book_id
)
GROUP BY rv.user_id, rv.book_id, b.total_pages, b.expected_segments, b.total_chapters;

-- Phase 3 : Backfill progress_id NULL sur toutes les validations
UPDATE reading_validations rv
SET progress_id = rp.id
FROM reading_progress rp
WHERE rv.user_id = rp.user_id
  AND rv.book_id = rp.book_id
  AND rv.progress_id IS NULL;

-- Reactiver le trigger
ALTER TABLE reading_validations ENABLE TRIGGER check_joker_usage_trigger;

-- Rebuild XP pour tous les users impactes (ceux qui avaient des validations orphelines)
-- On utilise une approche simple : rebuild pour tout user ayant eu un progress_id NULL backfilled
DO $$
DECLARE
  v_uid UUID;
  v_result JSONB;
BEGIN
  FOR v_uid IN
    SELECT DISTINCT user_id FROM reading_progress
    WHERE updated_at >= NOW() - INTERVAL '2 minutes'
  LOOP
    SELECT rebuild_user_xp(v_uid) INTO v_result;
    RAISE NOTICE 'XP rebuilt for %: %', v_uid, v_result;
  END LOOP;
END;
$$;
