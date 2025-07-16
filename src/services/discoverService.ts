import { supabase } from "@/integrations/supabase/client";

export async function getInProgressBooks(userId: string) {
  return supabase
    .from('reading_progress')
    .select(`
      id, 
      current_page,
      book:books(id, title, author, cover_url, total_pages)
    `)
    .eq('user_id', userId)
    .not('status', 'eq', 'completed')
    .gt('current_page', 0)
    .order('updated_at', { ascending: false })
    .limit(3);
}

export async function getNewestBooks(limit = 6) {
  return supabase
    .from('books')
    .select('id, title, author, cover_url, total_pages, description')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(limit);
}

export async function getFavoriteBooks(userId: string) {
  return supabase
    .from('user_favorite_books')
    .select(`
      book_title,
      position
    `)
    .eq('user_id', userId)
    .order('position', { ascending: true });
}