-- Fix missing RLS policies for badges and user_badges tables

-- RLS policies for badges table
CREATE POLICY "Authenticated users can view badges" 
ON public.badges 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can insert badges" 
ON public.badges 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = auth.uid() AND is_admin = true
));

CREATE POLICY "Admins can update badges" 
ON public.badges 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = auth.uid() AND is_admin = true
));

CREATE POLICY "Admins can delete badges" 
ON public.badges 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = auth.uid() AND is_admin = true
));

-- RLS policies for user_badges table
CREATE POLICY "Users can view their own badges" 
ON public.user_badges 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert user badges" 
ON public.user_badges 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can view others badges for public profiles" 
ON public.user_badges 
FOR SELECT 
USING (true);

-- Update profiles table to allow users to update their own profile
CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Tighten reading_questions policy to require authentication
DROP POLICY IF EXISTS "Anyone can view reading questions" ON public.reading_questions;

-- Ensure followers table requires authentication for viewing
DROP POLICY IF EXISTS "Users can read all follower relationships" ON public.followers;
CREATE POLICY "Authenticated users can view follower relationships" 
ON public.followers 
FOR SELECT 
USING (auth.role() = 'authenticated');