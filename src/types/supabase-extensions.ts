
import { Database as OriginalDatabase } from "@/integrations/supabase/types";

// Extended Database type that includes user_badges
export type ExtendedDatabase = {
  public: {
    Tables: {
      user_badges: {
        Row: {
          id: string;
          user_id: string;
          badge_id: string;
          unlocked_at: string;
        };
        Insert: {
          user_id: string;
          badge_id: string;
          unlocked_at?: string;
        };
        Update: Partial<{
          user_id?: string;
          badge_id?: string;
          unlocked_at?: string;
        }>;
        Relationships: [
          {
            foreignKeyName: "user_badges_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
    } & OriginalDatabase["public"]["Tables"];
    Views: OriginalDatabase["public"]["Views"];
    Functions: OriginalDatabase["public"]["Functions"];
    Enums: OriginalDatabase["public"]["Enums"];
    CompositeTypes: OriginalDatabase["public"]["CompositeTypes"];
  };
};
