export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      _backup_reading_questions: {
        Row: {
          answer: string | null
          book_id: string | null
          book_slug: string | null
          id: string | null
          question: string | null
          segment: number | null
        }
        Insert: {
          answer?: string | null
          book_id?: string | null
          book_slug?: string | null
          id?: string | null
          question?: string | null
          segment?: number | null
        }
        Update: {
          answer?: string | null
          book_id?: string | null
          book_slug?: string | null
          id?: string | null
          question?: string | null
          segment?: number | null
        }
        Relationships: []
      }
      activity_likes: {
        Row: {
          created_at: string
          id: string
          liker_id: string
          progress_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          liker_id: string
          progress_id: string
        }
        Update: {
          created_at?: string
          id?: string
          liker_id?: string
          progress_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_likes_liker_id_fkey"
            columns: ["liker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_likes_liker_id_fkey"
            columns: ["liker_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_likes_progress_id_fkey"
            columns: ["progress_id"]
            isOneToOne: false
            referencedRelation: "reading_progress"
            referencedColumns: ["id"]
          },
        ]
      }
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
      blog_featured: {
        Row: {
          created_at: string
          end_at: string | null
          position: number
          post_id: string
          start_at: string
          updated_at: string
          weight: number
        }
        Insert: {
          created_at?: string
          end_at?: string | null
          position: number
          post_id: string
          start_at?: string
          updated_at?: string
          weight?: number
        }
        Update: {
          created_at?: string
          end_at?: string | null
          position?: number
          post_id?: string
          start_at?: string
          updated_at?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "blog_featured_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: true
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_featured_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: true
            referencedRelation: "v_featured_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_featured_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: true
            referencedRelation: "v_featured_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_featured_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: true
            referencedRelation: "v_news_recent"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author: string | null
          content: string
          created_at: string
          excerpt: string | null
          featured: boolean
          featured_at: string | null
          featured_weight: number
          id: string
          image_alt: string | null
          image_url: string | null
          is_news: boolean
          published: boolean
          published_at: string | null
          section: string | null
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
          featured?: boolean
          featured_at?: string | null
          featured_weight?: number
          id?: string
          image_alt?: string | null
          image_url?: string | null
          is_news?: boolean
          published?: boolean
          published_at?: string | null
          section?: string | null
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
          featured?: boolean
          featured_at?: string | null
          featured_weight?: number
          id?: string
          image_alt?: string | null
          image_url?: string | null
          is_news?: boolean
          published?: boolean
          published_at?: string | null
          section?: string | null
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      book_chats: {
        Row: {
          book_slug: string
          content: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          book_slug: string
          content: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          book_slug?: string
          content?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      book_requests: {
        Row: {
          book_author: string | null
          book_title: string
          created_at: string
          id: string
          isbn: string | null
          reason: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          book_author?: string | null
          book_title: string
          created_at?: string
          id?: string
          isbn?: string | null
          reason?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          book_author?: string | null
          book_title?: string
          created_at?: string
          id?: string
          isbn?: string | null
          reason?: string | null
          status?: string
          updated_at?: string
          user_id?: string
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
      feed_events: {
        Row: {
          actor_id: string
          book_id: string | null
          created_at: string
          event_type: string
          id: string
          seed_tag: string | null
          segment: number | null
        }
        Insert: {
          actor_id: string
          book_id?: string | null
          created_at?: string
          event_type: string
          id?: string
          seed_tag?: string | null
          segment?: number | null
        }
        Update: {
          actor_id?: string
          book_id?: string | null
          created_at?: string
          event_type?: string
          id?: string
          seed_tag?: string | null
          segment?: number | null
        }
        Relationships: []
      }
      feed_lauriers: {
        Row: {
          created_at: string
          event_id: string
          id: string
          liker_id: string
          seed_tag: string | null
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          liker_id: string
          seed_tag?: string | null
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          liker_id?: string
          seed_tag?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feed_lauriers_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "feed_events"
            referencedColumns: ["id"]
          },
        ]
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
      notifications: {
        Row: {
          actor_id: string
          book_id: string | null
          book_title: string | null
          created_at: string
          id: string
          meta: Json | null
          progress_id: string | null
          read_at: string | null
          recipient_id: string
          type: Database["public"]["Enums"]["notification_type"]
        }
        Insert: {
          actor_id: string
          book_id?: string | null
          book_title?: string | null
          created_at?: string
          id?: string
          meta?: Json | null
          progress_id?: string | null
          read_at?: string | null
          recipient_id: string
          type: Database["public"]["Enums"]["notification_type"]
        }
        Update: {
          actor_id?: string
          book_id?: string | null
          book_title?: string | null
          created_at?: string
          id?: string
          meta?: Json | null
          progress_id?: string | null
          read_at?: string | null
          recipient_id?: string
          type?: Database["public"]["Enums"]["notification_type"]
        }
        Relationships: [
          {
            foreignKeyName: "notifications_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_progress_id_fkey"
            columns: ["progress_id"]
            isOneToOne: false
            referencedRelation: "reading_progress"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          id: string
          is_admin: boolean | null
          is_premium: boolean | null
          onboarding_seen_at: string | null
          onboarding_version: number | null
          premium_since: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          id: string
          is_admin?: boolean | null
          is_premium?: boolean | null
          onboarding_seen_at?: string | null
          onboarding_version?: number | null
          premium_since?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_admin?: boolean | null
          is_premium?: boolean | null
          onboarding_seen_at?: string | null
          onboarding_version?: number | null
          premium_since?: string | null
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
            referencedRelation: "book_segment_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reading_progress_book_fk"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reading_progress_book_fk"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books_explore"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reading_progress_book_fk"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books_public"
            referencedColumns: ["id"]
          },
        ]
      }
      reading_questions: {
        Row: {
          answer: string
          book_id: string | null
          book_slug: string
          id: string
          question: string
          segment: number
        }
        Insert: {
          answer: string
          book_id?: string | null
          book_slug: string
          id?: string
          question: string
          segment: number
        }
        Update: {
          answer?: string
          book_id?: string | null
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
          revealed_answer_at: string | null
          segment: number | null
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
          revealed_answer_at?: string | null
          segment?: number | null
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
          revealed_answer_at?: string | null
          segment?: number | null
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
            foreignKeyName: "fk_reading_validations_question"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "reading_questions_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reading_validations_book_fk"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "book_segment_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reading_validations_book_fk"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reading_validations_book_fk"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books_explore"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reading_validations_book_fk"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books_public"
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
          {
            foreignKeyName: "user_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
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
      user_settings: {
        Row: {
          daily_push_cap: number | null
          enable_digest: boolean | null
          enable_social: boolean | null
          enable_streak: boolean | null
          nudge_hour: number | null
          quiet_end: number | null
          quiet_start: number | null
          tz: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          daily_push_cap?: number | null
          enable_digest?: boolean | null
          enable_social?: boolean | null
          enable_streak?: boolean | null
          nudge_hour?: number | null
          quiet_end?: number | null
          quiet_start?: number | null
          tz?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          daily_push_cap?: number | null
          enable_digest?: boolean | null
          enable_social?: boolean | null
          enable_streak?: boolean | null
          nudge_hour?: number | null
          quiet_end?: number | null
          quiet_start?: number | null
          tz?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
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
            referencedRelation: "book_segment_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "validation_locks_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "validation_locks_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books_explore"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "validation_locks_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books_public"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      book_segment_status: {
        Row: {
          available_questions: number | null
          expected_segments: number | null
          id: string | null
          missing_segments: number[] | null
          slug: string | null
          status: string | null
          title: string | null
        }
        Relationships: []
      }
      books_explore: {
        Row: {
          author: string | null
          category: string | null
          cover_url: string | null
          created_at: string | null
          description: string | null
          expected_segments: number | null
          id: string | null
          is_published: boolean | null
          slug: string | null
          tags: string[] | null
          title: string | null
          total_chapters: number | null
          total_pages: number | null
        }
        Insert: {
          author?: string | null
          category?: never
          cover_url?: string | null
          created_at?: string | null
          description?: string | null
          expected_segments?: number | null
          id?: string | null
          is_published?: boolean | null
          slug?: string | null
          tags?: string[] | null
          title?: string | null
          total_chapters?: number | null
          total_pages?: number | null
        }
        Update: {
          author?: string | null
          category?: never
          cover_url?: string | null
          created_at?: string | null
          description?: string | null
          expected_segments?: number | null
          id?: string | null
          is_published?: boolean | null
          slug?: string | null
          tags?: string[] | null
          title?: string | null
          total_chapters?: number | null
          total_pages?: number | null
        }
        Relationships: []
      }
      books_public: {
        Row: {
          author: string | null
          cover_url: string | null
          description: string | null
          expected_segments: number | null
          id: string | null
          slug: string | null
          tags: string[] | null
          title: string | null
          total_chapters: number | null
          total_pages: number | null
        }
        Insert: {
          author?: string | null
          cover_url?: string | null
          description?: string | null
          expected_segments?: number | null
          id?: string | null
          slug?: string | null
          tags?: string[] | null
          title?: string | null
          total_chapters?: number | null
          total_pages?: number | null
        }
        Update: {
          author?: string | null
          cover_url?: string | null
          description?: string | null
          expected_segments?: number | null
          id?: string | null
          slug?: string | null
          tags?: string[] | null
          title?: string | null
          total_chapters?: number | null
          total_pages?: number | null
        }
        Relationships: []
      }
      profiles_public: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          id: string | null
          is_admin: boolean | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: never
          id?: string | null
          is_admin?: never
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: never
          id?: string | null
          is_admin?: never
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      reading_questions_public: {
        Row: {
          book_id: string | null
          book_slug: string | null
          id: string | null
          question: string | null
          segment: number | null
        }
        Insert: {
          book_id?: string | null
          book_slug?: string | null
          id?: string | null
          question?: string | null
          segment?: number | null
        }
        Update: {
          book_id?: string | null
          book_slug?: string | null
          id?: string | null
          question?: string | null
          segment?: number | null
        }
        Relationships: []
      }
      v_featured_posts: {
        Row: {
          author: string | null
          content: string | null
          created_at: string | null
          excerpt: string | null
          id: string | null
          image_alt: string | null
          image_url: string | null
          position: number | null
          published: boolean | null
          published_at: string | null
          slug: string | null
          tags: string[] | null
          title: string | null
          updated_at: string | null
          weight: number | null
        }
        Relationships: []
      }
      v_featured_public: {
        Row: {
          excerpt: string | null
          id: string | null
          image_alt: string | null
          image_url: string | null
          published_at: string | null
          slug: string | null
          title: string | null
        }
        Insert: {
          excerpt?: string | null
          id?: string | null
          image_alt?: string | null
          image_url?: string | null
          published_at?: string | null
          slug?: string | null
          title?: string | null
        }
        Update: {
          excerpt?: string | null
          id?: string | null
          image_alt?: string | null
          image_url?: string | null
          published_at?: string | null
          slug?: string | null
          title?: string | null
        }
        Relationships: []
      }
      v_news_recent: {
        Row: {
          author: string | null
          excerpt: string | null
          id: string | null
          image_alt: string | null
          image_url: string | null
          published_at: string | null
          slug: string | null
          title: string | null
        }
        Insert: {
          author?: string | null
          excerpt?: string | null
          id?: string | null
          image_alt?: string | null
          image_url?: string | null
          published_at?: string | null
          slug?: string | null
          title?: string | null
        }
        Update: {
          author?: string | null
          excerpt?: string | null
          id?: string | null
          image_alt?: string | null
          image_url?: string | null
          published_at?: string | null
          slug?: string | null
          title?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      cleanup_user_data: {
        Args: { target_user_id: string }
        Returns: undefined
      }
      discover_feed: {
        Args: { lim?: number; uid: string }
        Returns: Json
      }
      feed_get_v1: {
        Args:
          | { p_limit: number; p_offset: number }
          | { p_limit?: number; p_offset?: number; p_viewer?: string }
        Returns: {
          actor_avatar_url: string
          actor_id: string
          actor_name: string
          book_id: string
          book_title: string
          created_at: string
          event_type: string
          id: string
          lauriers_count: number
          liked_by_me: boolean
          segment: number
        }[]
      }
      force_validate_segment: {
        Args: { p_answer: string; p_book_id: string; p_question_id: string }
        Returns: {
          progress_id: string
          validation_id: string
        }[]
      }
      force_validate_segment_beta: {
        Args: {
          p_answer?: string
          p_book_id: string
          p_correct?: boolean
          p_question_id: string
          p_used_joker?: boolean
          p_user_id?: string
        }
        Returns: Json
      }
      get_activity_feed: {
        Args: { lim?: number; uid: string }
        Returns: {
          actor_avatar: string
          actor_id: string
          actor_name: string
          kind: string
          payload_id: string
          payload_title: string
          posted_at: string
        }[]
      }
      get_all_public_profiles: {
        Args: { profile_limit?: number }
        Returns: {
          avatar_url: string
          created_at: string
          id: string
          username: string
        }[]
      }
      get_current_user_admin_status: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      get_public_profile: {
        Args: { target_id: string }
        Returns: {
          avatar_url: string
          created_at: string
          id: string
          username: string
        }[]
      }
      get_public_profile_safe: {
        Args: { target_user_id: string }
        Returns: {
          avatar_url: string
          created_at: string
          id: string
          username: string
        }[]
      }
      get_public_profiles_for_ids: {
        Args: { ids: string[] }
        Returns: {
          avatar_url: string
          created_at: string
          id: string
          username: string
        }[]
      }
      get_safe_public_profiles: {
        Args: { limit_count?: number }
        Returns: {
          avatar_url: string
          created_at: string
          id: string
          username: string
        }[]
      }
      get_user_stats: {
        Args: { uid: string }
        Returns: {
          badges_count: number
          books_read: number
          lvl: number
          pages_read: number
          quests_done: number
          streak_best: number
          streak_current: number
          xp: number
        }[]
      }
      use_joker: {
        Args: { p_book_id: string; p_segment: number; p_user_id: string }
        Returns: {
          jokers_remaining: number
          message: string
          success: boolean
        }[]
      }
    }
    Enums: {
      notification_type:
        | "friend_finished"
        | "laurier_received"
        | "streak_nudge"
        | "streak_kept"
        | "streak_lost"
        | "weekly_digest"
        | "booky_received"
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
      notification_type: [
        "friend_finished",
        "laurier_received",
        "streak_nudge",
        "streak_kept",
        "streak_lost",
        "weekly_digest",
        "booky_received",
      ],
      reading_status: ["to_read", "in_progress", "completed"],
    },
  },
} as const
