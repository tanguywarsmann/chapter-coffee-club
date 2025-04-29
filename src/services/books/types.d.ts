
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

// Extend the Database type to include the user_badges table definition
declare module "@/integrations/supabase/types" {
  interface Database {
    public: {
      Tables: {
        user_badges: {
          Row: UserBadge;
          Insert: Omit<UserBadge, "id" | "unlocked_at">;
          Update: Partial<UserBadge>;
          Relationships: [
            {
              foreignKeyName: "user_badges_user_id_fkey";
              columns: ["user_id"];
              referencedRelation: "users";
              referencedColumns: ["id"];
            }
          ];
        };
      } & Database["public"]["Tables"];
    };
  }
}
