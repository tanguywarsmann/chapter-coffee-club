
import { Database } from "@/integrations/supabase/types";
import { Book } from "@/types/book";

export type BookRecord = Database["public"]["Tables"]["books"]["Row"];
export type InsertableBook = Omit<Book, "id">;
