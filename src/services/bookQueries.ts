import { supabase } from "@/integrations/supabase/client";

/**
 * Secure book queries that handle slug vs id correctly
 * and check for authentication when needed
 */

export async function getBookBySlug(slug: string) {
  const { data, error } = await supabase
    .from("books")
    .select("*")
    .eq("is_published", true)
    .eq("slug", slug)
    .single();
  
  if (error) {
    console.error("Error fetching book by slug:", error);
    throw error;
  }
  
  return data;
}

export async function getBookById(id: string) {
  const { data, error } = await supabase
    .from("books")
    .select("*")
    .eq("is_published", true)
    .eq("id", id)
    .single();
  
  if (error) {
    console.error("Error fetching book by id:", error);
    throw error;
  }
  
  return data;
}

export async function getBookExpectedSegments(bookSlug: string) {
  const { data, error } = await supabase
    .from("books")
    .select("expected_segments")
    .eq("is_published", true)
    .eq("slug", bookSlug)
    .single();
  
  if (error) {
    console.error("Error fetching expected segments:", error);
    return 0;
  }
  
  return data?.expected_segments || 0;
}

export async function getUserProfile(userId: string) {
  // Always check session before accessing profiles
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    console.warn("No session available for profile access");
    return null;
  }
  
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  
  if (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
  
  return data;
}
