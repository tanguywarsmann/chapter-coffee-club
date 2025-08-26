-- Fix security issue: Restrict book chat access to users who completed the book
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Users can view all book chat messages" ON public.book_chats;

-- Create a secure policy that only allows users who completed the book to view messages
CREATE POLICY "Users can view book chat if they completed the book"
ON public.book_chats
FOR SELECT
USING (
  EXISTS (
    SELECT 1 
    FROM public.reading_progress rp 
    JOIN public.books b ON b.id = rp.book_id 
    WHERE rp.user_id = auth.uid() 
      AND b.slug = book_chats.book_slug 
      AND rp.status = 'completed'
  )
);