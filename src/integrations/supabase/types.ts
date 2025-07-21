export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      badges: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          icon: string
          icon_url: string | null
          id: string
          label: string
          name: string
          rarity: string | null
          slug: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string
          icon_url?: string | null
          id?: string
          label: string
          name?: string
          rarity?: string | null
          slug: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string
          icon_url?: string | null
          id?: string
          label?: string
          name?: string
          rarity?: string | null
          slug?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author: string | null
          content: string
          created_at: string
          excerpt: string | null
          id: string
          image_alt: string | null
          image_url: string | null
          published: boolean
          slug: string
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          author?: string | null
          content: string
          created_at?: string
          excerpt?: string | null
          id?: string
          image_alt?: string | null
          image_url?: string | null
          published?: boolean
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          author?: string | null
          content?: string
          created_at?: string
          excerpt?: string | null
          id?: string
          image_alt?: string | null
          image_url?: string | null
          published?: boolean
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      books: {
        Row: {
          author: string
          cover_url: string | null
          created_at: string | null
          description: string | null
          expected_segments: number | null
          id: string
          is_published: boolean
          slug: string
          tags: string[] | null
          title: string
          total_chapters: number | null
          total_pages: number
        }
        Insert: {
          author: string
          cover_url?: string | null
          created_at?: string | null
          description?: string | null
          expected_segments?: number | null
          id: string
          is_published?: boolean
          slug: string
          tags?: string[] | null
          title: string
          total_chapters?: number | null
          total_pages?: number
        }
        Update: {
          author?: string
          cover_url?: string | null
          created_at?: string | null
          description?: string | null
          expected_segments?: number | null
          id?: string
          is_published?: boolean
          slug?: string
          tags?: string[] | null
          title?: string
          total_chapters?: number | null
          total_pages?: number
        }
        Relationships: []
      }
      followers: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          id: string
          is_admin: boolean | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          id: string
          is_admin?: boolean | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_admin?: boolean | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      reading_progress: {
        Row: {
          book_id: string
          current_page: number
          id: string
          started_at: string | null
          status: Database["public"]["Enums"]["reading_status"] | null
          streak_best: number | null
          streak_current: number | null
          total_pages: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          book_id: string
          current_page?: number
          id?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["reading_status"] | null
          streak_best?: number | null
          streak_current?: number | null
          total_pages?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          book_id?: string
          current_page?: number
          id?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["reading_status"] | null
          streak_best?: number | null
          streak_current?: number | null
          total_pages?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reading_progress_book_fk"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      reading_questions: {
        Row: {
          answer: string
          book_slug: string
          id: string
          question: string
          segment: number
        }
        Insert: {
          answer: string
          book_slug: string
          id?: string
          question: string
          segment: number
        }
        Update: {
          answer?: string
          book_slug?: string
          id?: string
          question?: string
          segment?: number
        }
        Relationships: []
      }
      reading_validations: {
        Row: {
          answer: string | null
          book_id: string
          correct: boolean
          id: string
          progress_id: string | null
          question_id: string | null
          segment: number
          used_joker: boolean
          user_id: string
          validated_at: string
        }
        Insert: {
          answer?: string | null
          book_id: string
          correct?: boolean
          id?: string
          progress_id?: string | null
          question_id?: string | null
          segment: number
          used_joker?: boolean
          user_id: string
          validated_at?: string
        }
        Update: {
          answer?: string | null
          book_id?: string
          correct?: boolean
          id?: string
          progress_id?: string | null
          question_id?: string | null
          segment?: number
          used_joker?: boolean
          user_id?: string
          validated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_reading_progress"
            columns: ["progress_id"]
            isOneToOne: false
            referencedRelation: "reading_progress"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_reading_validations_progress"
            columns: ["progress_id"]
            isOneToOne: false
            referencedRelation: "reading_progress"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_reading_validations_question"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "reading_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reading_validations_book_fk"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      user_badges: {
        Row: {
          badge_id: string | null
          earned_at: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          badge_id?: string | null
          earned_at?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          badge_id?: string | null
          earned_at?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_favorite_badges: {
        Row: {
          badge_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          badge_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_favorite_books: {
        Row: {
          added_at: string | null
          book_title: string
          id: string
          position: number
          user_id: string
        }
        Insert: {
          added_at?: string | null
          book_title: string
          id?: string
          position: number
          user_id: string
        }
        Update: {
          added_at?: string | null
          book_title?: string
          id?: string
          position?: number
          user_id?: string
        }
        Relationships: []
      }
      user_levels: {
        Row: {
          id: string
          last_updated: string | null
          level: number
          user_id: string
          xp: number
        }
        Insert: {
          id?: string
          last_updated?: string | null
          level?: number
          user_id: string
          xp?: number
        }
        Update: {
          id?: string
          last_updated?: string | null
          level?: number
          user_id?: string
          xp?: number
        }
        Relationships: []
      }
      user_monthly_rewards: {
        Row: {
          badge_id: string
          id: string
          month: string
          unlocked_at: string | null
          user_id: string
        }
        Insert: {
          badge_id: string
          id?: string
          month: string
          unlocked_at?: string | null
          user_id: string
        }
        Update: {
          badge_id?: string
          id?: string
          month?: string
          unlocked_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_quests: {
        Row: {
          id: string
          quest_slug: string
          unlocked_at: string | null
          user_id: string
        }
        Insert: {
          id?: string
          quest_slug: string
          unlocked_at?: string | null
          user_id: string
        }
        Update: {
          id?: string
          quest_slug?: string
          unlocked_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      validation_locks: {
        Row: {
          book_id: string
          created_at: string
          id: string
          locked_until: string
          segment: number
          user_id: string
        }
        Insert: {
          book_id: string
          created_at?: string
          id?: string
          locked_until: string
          segment: number
          user_id: string
        }
        Update: {
          book_id?: string
          created_at?: string
          id?: string
          locked_until?: string
          segment?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "validation_locks_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      discover_feed: {
        Args: { uid: string; lim?: number }
        Returns: Json
      }
      get_activity_feed: {
        Args: { uid: string; lim?: number }
        Returns: {
          actor_id: string
          actor_name: string
          actor_avatar: string
          kind: string
          payload_id: string
          payload_title: string
          posted_at: string
        }[]
      }
      get_user_stats: {
        Args: { uid: string }
        Returns: {
          books_read: number
          pages_read: number
          badges_count: number
          streak_current: number
          streak_best: number
          quests_done: number
          xp: number
          lvl: number
        }[]
      }
      use_joker: {
        Args: { p_book_id: string; p_user_id: string; p_segment: number }
        Returns: {
          jokers_remaining: number
          success: boolean
          message: string
        }[]
      }
    }
    Enums: {
      reading_status: "to_read" | "in_progress" | "completed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      reading_status: ["to_read", "in_progress", "completed"],
    },
  },
} as const
