-- A1) Backfill book_id à partir du slug (avec cast UUID)
UPDATE public.reading_questions rq
SET book_id = b.id::uuid
FROM public.books b
WHERE rq.book_id IS NULL
  AND rq.book_slug = b.slug;

-- A1bis) Dédoublonnage sécurisé avant l'index unique
WITH d AS (
  SELECT book_id, segment, id, 
         ROW_NUMBER() OVER (PARTITION BY book_id, segment ORDER BY id) as rn
  FROM public.reading_questions
  WHERE book_id IS NOT NULL AND segment >= 1
)
DELETE FROM public.reading_questions rq
WHERE rq.id IN (
  SELECT d.id FROM d WHERE d.rn > 1
);

-- A2) Garde-fous: unicité et perfs
CREATE UNIQUE INDEX IF NOT EXISTS uq_rq_book_segment
  ON public.reading_questions(book_id, segment);
CREATE INDEX IF NOT EXISTS idx_rq_slug_segment
  ON public.reading_questions(book_slug, segment);

-- A3) Trigger: remplir book_id automatiquement si seul le slug est fourni
CREATE OR REPLACE FUNCTION public.set_rq_book_id_from_slug()
RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.book_id IS NULL AND NEW.book_slug IS NOT NULL THEN
    SELECT id::uuid INTO NEW.book_id
    FROM public.books
    WHERE slug = NEW.book_slug;
  END IF;
  RETURN NEW;
END
$$;

DROP TRIGGER IF EXISTS trg_rq_set_book_id ON public.reading_questions;
CREATE TRIGGER trg_rq_set_book_id
BEFORE INSERT OR UPDATE ON public.reading_questions
FOR EACH ROW EXECUTE FUNCTION public.set_rq_book_id_from_slug();

-- A4) Vue d'état admin
CREATE OR REPLACE VIEW public.book_segment_status AS
SELECT
  b.id,
  b.slug,
  b.title,
  b.expected_segments,
  COALESCE(q.available_questions, 0) AS available_questions,
  CASE
    WHEN b.expected_segments IS NULL THEN ARRAY[]::int[]
    ELSE (
      SELECT ARRAY(
        SELECT gs
        FROM generate_series(1, b.expected_segments) gs
        EXCEPT
        SELECT DISTINCT rq.segment
        FROM public.reading_questions rq
        WHERE rq.book_id = b.id::uuid
        ORDER BY 1
      )
    )
  END AS missing_segments,
  CASE
    WHEN b.expected_segments IS NULL THEN 'unknown'
    WHEN COALESCE(q.available_questions, 0) = 0 THEN 'missing'
    WHEN COALESCE(q.available_questions, 0) = b.expected_segments THEN 'complete'
    ELSE 'incomplete'
  END AS status
FROM public.books b
LEFT JOIN (
  SELECT book_id, COUNT(DISTINCT segment) AS available_questions
  FROM public.reading_questions
  WHERE segment >= 1 AND book_id IS NOT NULL
  GROUP BY book_id
) q ON q.book_id = b.id::uuid;

-- A5) Vue publique légère (sans answer) pour lectures côté client
DROP VIEW IF EXISTS public.reading_questions_public;
CREATE VIEW public.reading_questions_public AS
SELECT id, book_id, book_slug, segment, question
FROM public.reading_questions
WHERE segment >= 1;