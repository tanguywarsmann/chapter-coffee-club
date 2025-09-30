-- Fix RLS policies for reading_questions table to allow admin access

-- First, drop all existing policies to start clean
DROP POLICY IF EXISTS "Admins can insert reading questions" ON reading_questions;
DROP POLICY IF EXISTS "Allow read access to authenticated users" ON reading_questions;
DROP POLICY IF EXISTS "Users can view reading questions" ON reading_questions;
DROP POLICY IF EXISTS "rq_select" ON reading_questions;

-- Set up proper grants
REVOKE ALL ON reading_questions FROM anon, authenticated;
GRANT SELECT ON reading_questions TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON reading_questions TO authenticated;

-- Public read policy: questions for published books
CREATE POLICY "public_read_questions"
ON reading_questions FOR SELECT
TO PUBLIC
USING (
  EXISTS (
    SELECT 1
    FROM books b
    WHERE b.id = reading_questions.book_id::text
      AND COALESCE(b.is_published, false) = true
  )
);

-- Admin full access policies
CREATE POLICY "admin_read_all_questions"
ON reading_questions FOR SELECT
TO authenticated
USING (public.get_current_user_admin_status() = true);

CREATE POLICY "admin_insert_questions"
ON reading_questions FOR INSERT
TO authenticated
WITH CHECK (public.get_current_user_admin_status() = true);

CREATE POLICY "admin_update_questions"
ON reading_questions FOR UPDATE
TO authenticated
USING (public.get_current_user_admin_status() = true)
WITH CHECK (public.get_current_user_admin_status() = true);

CREATE POLICY "admin_delete_questions"
ON reading_questions FOR DELETE
TO authenticated
USING (public.get_current_user_admin_status() = true);