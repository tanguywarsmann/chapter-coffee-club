
import { Database } from "@/integrations/supabase/types";
import { Book } from "@/types/book";

export type BookRecord = Database["public"]["Tables"]["books"]["Row"];
export type InsertableBook = Omit<Book, "id">;

// Define user_badges types that align with our database table
export interface UserBadge {
  id: string;
  user_id: string;
  badge_key: string;
  unlocked_at: string;
}
