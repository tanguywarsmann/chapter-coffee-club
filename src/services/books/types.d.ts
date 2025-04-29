
import { Database } from "@/integrations/supabase/types";
import { Book } from "@/types/book";

export type BookRecord = Database["public"]["Tables"]["books"]["Row"];
export type InsertableBook = Omit<Book, "id">;

// Create extended Database type that includes the user_badges table
export interface ExtendedDatabase extends Database {
  public: {
    Tables: {
      user_badges: {
        Row: {
          id: string;
          user_id: string;
          badge_key: string;
          unlocked_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          badge_key: string;
          unlocked_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          badge_key?: string;
          unlocked_at?: string;
        };
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
    Views: Database["public"]["Views"];
    Functions: Database["public"]["Functions"];
    Enums: Database["public"]["Enums"];
    CompositeTypes: Database["public"]["CompositeTypes"];
  };
}
