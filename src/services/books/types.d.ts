
import { Database } from "@/integrations/supabase/types";
import { Book } from "@/types/book";

export type BookRecord = Database["public"]["Tables"]["books"]["Row"];
export type InsertableBook = Omit<Book, "id">;

// Define user_badges types that align with our database table
export type UserBadge = {
  id: string;
  user_id: string;
  badge_key: string;
  unlocked_at: string;
};

// We're no longer using module augmentation here to avoid duplicate identifier errors
