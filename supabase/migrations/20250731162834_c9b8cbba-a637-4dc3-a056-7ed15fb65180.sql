-- Create table for book chat messages
CREATE TABLE public.book_chats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  book_slug TEXT NOT NULL,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.book_chats ENABLE ROW LEVEL SECURITY;

-- Create policies for book chats
CREATE POLICY "Users can view all book chat messages"
ON public.book_chats
FOR SELECT
USING (true);

CREATE POLICY "Users can create their own messages"
ON public.book_chats
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_book_chats_book_slug ON public.book_chats(book_slug);
CREATE INDEX idx_book_chats_created_at ON public.book_chats(created_at);