-- SEED FEED ADAPTIVE - VREAD
-- Script one-shot avec introspection schéma et cast adaptatif
-- Mode: reset (efface N jours puis reseed) ou topup (complète jusqu'au quota)

DO $$
DECLARE
  -- Configuration tables
  v_profiles_table TEXT := 'public.profiles';
  v_profiles_id_col TEXT := 'id';
  v_books_table TEXT := 'public.books';
  v_books_id_col TEXT := 'id';
  v_feed_events_table TEXT := 'public.feed_events';
  v_feed_bookys_table TEXT := 'public.feed_bookys';
  
  -- Configuration fonctionnelle
  v_seed_mode TEXT := 'reset'; -- 'reset' ou 'topup'
  v_days_back INT := 20;
  v_timezone TEXT := 'Europe/Paris';
  v_hour_start TIME := '06:00';
  v_hour_span_seconds INT := 61200; -- 17h (jusqu'à 23:00)
  v_events_low_min INT := 2;
  v_events_low_max INT := 4;
  v_events_high_min INT := 8;
  v_events_high_max INT := 10;
  v_segment_ratio NUMERIC := 0.6;
  v_likes_prob NUMERIC := 0.6;
  v_likes_min INT := 1;
  v_likes_max INT := 6;
  v_likes_delay_max INT := 7200; -- 2h
  
  -- Variables de travail
  v_seed_tag UUID := gen_random_uuid();
  v_day DATE;
  v_day_idx INT;
  v_events_target INT;
  v_events_existing INT;
  v_events_to_create INT;
  v_event_type TEXT;
  v_actor_id UUID;
  v_book_id TEXT;
  v_book_uuid UUID;
  v_segment INT;
  v_max_segment INT;
  v_event_ts TIMESTAMPTZ;
  v_event_id UUID;
  v_liker_id UUID;
  v_booky_ts TIMESTAMPTZ;
  v_bookys_count INT;
  v_hour_offset INT;
  v_i INT;
  v_j INT;
  
  -- Pools
  v_users UUID[];
  v_books TEXT[];
  v_used_actors UUID[];
  v_available_likers UUID[];
  
  -- Introspection
  v_books_id_type TEXT;
  v_profiles_name_col TEXT;
  v_profiles_avatar_col TEXT;
  v_books_title_col TEXT;
  v_books_segments_col TEXT;
  v_has_seed_tag_events BOOLEAN := FALSE;
  v_has_seed_tag_likes BOOLEAN := FALSE;
BEGIN
  RAISE NOTICE '=== SEED FEED ADAPTIVE - Tag: % ===', v_seed_tag;
  
  -- 1) INTROSPECTION SCHEMA
  RAISE NOTICE '1. Introspection du schéma...';
  
  -- Détecter le type de books.id
  SELECT data_type INTO v_books_id_type
  FROM information_schema.columns
  WHERE table_schema = 'public' 
    AND table_name = 'books' 
    AND column_name = 'id';
  
  IF v_books_id_type IS NULL THEN
    RAISE EXCEPTION 'Table books ou colonne id introuvable';
  END IF;
  
  RAISE NOTICE '  - books.id type: %', v_books_id_type;
  
  -- Détecter colonne nom profile (priorité: full_name, display_name, username, name)
  SELECT column_name INTO v_profiles_name_col
  FROM information_schema.columns
  WHERE table_schema = 'public' 
    AND table_name = 'profiles'
    AND column_name IN ('full_name', 'display_name', 'username', 'name')
  ORDER BY CASE column_name
    WHEN 'full_name' THEN 1
    WHEN 'display_name' THEN 2
    WHEN 'username' THEN 3
    WHEN 'name' THEN 4
  END
  LIMIT 1;
  
  v_profiles_name_col := COALESCE(v_profiles_name_col, 'username');
  RAISE NOTICE '  - profiles name column: %', v_profiles_name_col;
  
  -- Détecter colonne avatar profile
  SELECT column_name INTO v_profiles_avatar_col
  FROM information_schema.columns
  WHERE table_schema = 'public' 
    AND table_name = 'profiles'
    AND column_name IN ('avatar_url', 'avatar', 'image_url', 'picture')
  ORDER BY CASE column_name
    WHEN 'avatar_url' THEN 1
    WHEN 'avatar' THEN 2
    WHEN 'image_url' THEN 3
    WHEN 'picture' THEN 4
  END
  LIMIT 1;
  
  v_profiles_avatar_col := COALESCE(v_profiles_avatar_col, 'avatar_url');
  RAISE NOTICE '  - profiles avatar column: %', v_profiles_avatar_col;
  
  -- Détecter colonne titre book
  SELECT column_name INTO v_books_title_col
  FROM information_schema.columns
  WHERE table_schema = 'public' 
    AND table_name = 'books'
    AND column_name IN ('title', 'name', 'book_title')
  ORDER BY CASE column_name
    WHEN 'title' THEN 1
    WHEN 'name' THEN 2
    WHEN 'book_title' THEN 3
  END
  LIMIT 1;
  
  v_books_title_col := COALESCE(v_books_title_col, 'title');
  RAISE NOTICE '  - books title column: %', v_books_title_col;
  
  -- Détecter colonne segments book
  SELECT column_name INTO v_books_segments_col
  FROM information_schema.columns
  WHERE table_schema = 'public' 
    AND table_name = 'books'
    AND column_name IN ('expected_segments', 'total_chapters')
  ORDER BY CASE column_name
    WHEN 'expected_segments' THEN 1
    WHEN 'total_chapters' THEN 2
  END
  LIMIT 1;
  
  RAISE NOTICE '  - books segments column: %', COALESCE(v_books_segments_col, 'NULL (défaut 20)');
  
  -- 2) CRÉATION TABLES SI ABSENTES
  RAISE NOTICE '2. Vérification/création des tables...';
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables 
                 WHERE table_schema = 'public' AND table_name = 'feed_events') THEN
    RAISE NOTICE '  - Création table feed_events';
    CREATE TABLE public.feed_events (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      actor_id UUID NOT NULL,
      event_type TEXT NOT NULL CHECK (event_type IN ('segment_validated', 'book_completed')),
      book_id UUID,
      segment INT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      seed_tag UUID
    );
    
    CREATE INDEX idx_feed_events_created ON public.feed_events (created_at DESC);
    CREATE INDEX idx_feed_events_actor ON public.feed_events (actor_id);
    CREATE INDEX idx_feed_events_book ON public.feed_events (book_id);
    CREATE INDEX idx_feed_events_seed_tag ON public.feed_events (seed_tag) WHERE seed_tag IS NOT NULL;
    
    v_has_seed_tag_events := TRUE;
  ELSE
    -- Vérifier si seed_tag existe
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' 
        AND table_name = 'feed_events' 
        AND column_name = 'seed_tag'
    ) INTO v_has_seed_tag_events;
    
    IF NOT v_has_seed_tag_events THEN
      RAISE NOTICE '  - Ajout colonne seed_tag à feed_events';
      ALTER TABLE public.feed_events ADD COLUMN seed_tag UUID;
      CREATE INDEX idx_feed_events_seed_tag ON public.feed_events (seed_tag) WHERE seed_tag IS NOT NULL;
      v_has_seed_tag_events := TRUE;
    END IF;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables 
                 WHERE table_schema = 'public' AND table_name = 'feed_bookys') THEN
    RAISE NOTICE '  - Création table feed_bookys';
    CREATE TABLE public.feed_bookys (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      event_id UUID NOT NULL,
      liker_id UUID NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      seed_tag UUID,
      UNIQUE(event_id, liker_id)
    );
    
    CREATE INDEX idx_feed_bookys_event ON public.feed_bookys (event_id);
    CREATE INDEX idx_feed_bookys_liker ON public.feed_bookys (liker_id);
    CREATE INDEX idx_feed_bookys_seed_tag ON public.feed_bookys (seed_tag) WHERE seed_tag IS NOT NULL;
    
    v_has_seed_tag_likes := TRUE;
  ELSE
    -- Vérifier si seed_tag existe
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' 
        AND table_name = 'feed_bookys' 
        AND column_name = 'seed_tag'
    ) INTO v_has_seed_tag_likes;
    
    IF NOT v_has_seed_tag_likes THEN
      RAISE NOTICE '  - Ajout colonne seed_tag à feed_bookys';
      ALTER TABLE public.feed_bookys ADD COLUMN seed_tag UUID;
      CREATE INDEX idx_feed_bookys_seed_tag ON public.feed_bookys (seed_tag) WHERE seed_tag IS NOT NULL;
      v_has_seed_tag_likes := TRUE;
    END IF;
  END IF;
  
  -- 3) MODE RESET OU TOPUP
  IF v_seed_mode = 'reset' THEN
    RAISE NOTICE '3. Mode RESET - Suppression des % derniers jours', v_days_back;
    
    DELETE FROM public.feed_bookys
    WHERE event_id IN (
      SELECT id FROM public.feed_events
      WHERE created_at >= (CURRENT_DATE - v_days_back || ' days')::INTERVAL + CURRENT_DATE
    );
    
    DELETE FROM public.feed_events
    WHERE created_at >= (CURRENT_DATE - v_days_back || ' days')::INTERVAL + CURRENT_DATE;
    
    RAISE NOTICE '  - Données supprimées';
  ELSE
    RAISE NOTICE '3. Mode TOPUP - Complétion jusqu''au quota';
  END IF;
  
  -- 4) CHARGEMENT POOLS
  RAISE NOTICE '4. Chargement des pools...';
  
  -- Pool utilisateurs (max 130)
  EXECUTE format('SELECT ARRAY(SELECT %I FROM %s ORDER BY RANDOM() LIMIT 130)', 
    v_profiles_id_col, v_profiles_table) INTO v_users;
  
  -- Pool livres (50 publiés)
  EXECUTE format('SELECT ARRAY(SELECT %I FROM %s WHERE is_published = true ORDER BY RANDOM() LIMIT 50)', 
    v_books_id_col, v_books_table) INTO v_books;
  
  IF array_length(v_users, 1) < 5 OR array_length(v_books, 1) < 3 THEN
    RAISE EXCEPTION 'Pools insuffisants: % users, % books', 
      array_length(v_users, 1), array_length(v_books, 1);
  END IF;
  
  RAISE NOTICE '  - % utilisateurs, % livres', array_length(v_users, 1), array_length(v_books, 1);
  
  -- 5) GÉNÉRATION ÉVÉNEMENTS
  RAISE NOTICE '5. Génération des événements sur % jours...', v_days_back;
  
  FOR v_day_idx IN 0..(v_days_back - 1) LOOP
    v_day := CURRENT_DATE - v_day_idx;
    v_used_actors := ARRAY[]::UUID[];
    
    -- Calcul target selon alternance
    IF v_day_idx % 2 = 0 THEN
      v_events_target := v_events_low_min + floor(random() * (v_events_low_max - v_events_low_min + 1))::INT;
    ELSE
      v_events_target := v_events_high_min + floor(random() * (v_events_high_max - v_events_high_min + 1))::INT;
    END IF;
    
    -- Mode topup: calculer l'existant
    IF v_seed_mode = 'topup' THEN
      SELECT COUNT(*) INTO v_events_existing
      FROM public.feed_events
      WHERE DATE(created_at AT TIME ZONE v_timezone) = v_day;
      
      v_events_to_create := GREATEST(0, v_events_target - v_events_existing);
    ELSE
      v_events_to_create := v_events_target;
    END IF;
    
    -- Générer les événements du jour
    FOR v_i IN 1..v_events_to_create LOOP
      -- Acteur distinct pour ce jour
      LOOP
        v_actor_id := v_users[1 + floor(random() * array_length(v_users, 1))::INT];
        EXIT WHEN NOT (v_actor_id = ANY(v_used_actors));
      END LOOP;
      v_used_actors := array_append(v_used_actors, v_actor_id);
      
      -- Type événement
      IF random() < v_segment_ratio THEN
        v_event_type := 'segment_validated';
      ELSE
        v_event_type := 'book_completed';
      END IF;
      
      -- Livre aléatoire
      v_book_id := v_books[1 + floor(random() * array_length(v_books, 1))::INT];
      
      -- Conversion book_id en UUID si nécessaire
      IF v_books_id_type LIKE '%uuid%' THEN
        BEGIN
          v_book_uuid := v_book_id::UUID;
        EXCEPTION WHEN OTHERS THEN
          v_book_uuid := NULL;
        END;
      ELSE
        -- books.id est text, essayer de le convertir en UUID pour feed_events.book_id
        BEGIN
          v_book_uuid := v_book_id::UUID;
        EXCEPTION WHEN OTHERS THEN
          v_book_uuid := NULL;
        END;
      END IF;
      
      -- Segment si segment_validated
      IF v_event_type = 'segment_validated' THEN
        IF v_books_segments_col IS NOT NULL THEN
          EXECUTE format('SELECT COALESCE(%I, 20) FROM %s WHERE %I = $1', 
            v_books_segments_col, v_books_table, v_books_id_col) 
            INTO v_max_segment USING v_book_id;
        ELSE
          v_max_segment := 20;
        END IF;
        v_segment := 1 + floor(random() * v_max_segment)::INT;
      ELSE
        v_segment := NULL;
      END IF;
      
      -- Timestamp dans la fenêtre horaire
      v_hour_offset := floor(random() * v_hour_span_seconds)::INT;
      v_event_ts := (v_day || ' ' || v_hour_start)::TIMESTAMP AT TIME ZONE v_timezone 
                    + (v_hour_offset || ' seconds')::INTERVAL;
      
      -- Insérer événement
      INSERT INTO public.feed_events (id, actor_id, event_type, book_id, segment, created_at, seed_tag)
      VALUES (gen_random_uuid(), v_actor_id, v_event_type, v_book_uuid, v_segment, v_event_ts, v_seed_tag)
      RETURNING id INTO v_event_id;
      
      -- Bookys (~60% des événements)
      IF random() < v_likes_prob THEN
        v_bookys_count := v_likes_min + floor(random() * (v_likes_max - v_likes_min + 1))::INT;
        v_available_likers := v_users;
        
        FOR v_j IN 1..LEAST(v_bookys_count, array_length(v_users, 1) - 1) LOOP
          -- Liker différent de l'acteur
          LOOP
            v_liker_id := v_available_likers[1 + floor(random() * array_length(v_available_likers, 1))::INT];
            EXIT WHEN v_liker_id IS NOT NULL AND v_liker_id != v_actor_id;
          END LOOP;
          
          v_available_likers := array_remove(v_available_likers, v_liker_id);
          
          -- Timestamp booky: événement + 0-2h
          v_booky_ts := v_event_ts + (floor(random() * v_likes_delay_max) || ' seconds')::INTERVAL;
          
          -- Insérer booky
          BEGIN
            INSERT INTO public.feed_bookys (event_id, liker_id, created_at, seed_tag)
            VALUES (v_event_id, v_liker_id, v_booky_ts, v_seed_tag);
          EXCEPTION WHEN unique_violation THEN
            -- Ignorer duplicatas
          END;
        END LOOP;
      END IF;
    END LOOP;
  END LOOP;
  
  RAISE NOTICE '  - Événements générés';
  
  -- 6) CRÉATION/MISE À JOUR RPC
  RAISE NOTICE '6. Création de la RPC feed_get_v1...';
  
  EXECUTE format($sql$
    CREATE OR REPLACE FUNCTION public.feed_get_v1(
      p_limit INT DEFAULT 100,
      p_offset INT DEFAULT 0,
      p_viewer UUID DEFAULT NULL
    )
    RETURNS TABLE (
      id UUID,
      created_at TIMESTAMPTZ,
      event_type TEXT,
      segment INT,
      actor_id UUID,
      actor_name TEXT,
      actor_avatar_url TEXT,
      book_id UUID,
      book_title TEXT,
      bookys_count BIGINT,
      liked_by_me BOOLEAN
    )
    LANGUAGE SQL
    SECURITY DEFINER
    SET search_path = public
    AS $$
      SELECT
        e.id,
        e.created_at,
        e.event_type,
        e.segment,
        e.actor_id,
        COALESCE(NULLIF(p.%I, ''), 'Lecteur') AS actor_name,
        p.%I AS actor_avatar_url,
        e.book_id,
        b.%I AS book_title,
        (SELECT COUNT(*) FROM public.feed_bookys l WHERE l.event_id = e.id) AS bookys_count,
        CASE
          WHEN p_viewer IS NOT NULL
           AND EXISTS (SELECT 1 FROM public.feed_bookys l
                          WHERE l.event_id = e.id AND l.liker_id = p_viewer)
          THEN TRUE ELSE FALSE
        END AS liked_by_me
      FROM public.feed_events e
      JOIN public.profiles p ON p.id = e.actor_id
      LEFT JOIN public.books b ON b.id::TEXT = e.book_id::TEXT
      ORDER BY e.created_at DESC
      LIMIT p_limit OFFSET p_offset;
    $$;
    
    REVOKE ALL ON FUNCTION public.feed_get_v1 FROM public;
    GRANT EXECUTE ON FUNCTION public.feed_get_v1 TO anon, authenticated;
  $sql$, v_profiles_name_col, v_profiles_avatar_col, v_books_title_col);
  
  RAISE NOTICE '  - RPC créée et permissions accordées';
  
  RAISE NOTICE '=== SEED TERMINÉ - Tag: % ===', v_seed_tag;
END $$;

-- REQUÊTES DE VÉRIFICATION

-- 1) Répartition quotidienne sur N jours glissants
SELECT 
  DATE(created_at AT TIME ZONE 'Europe/Paris') AS jour,
  COUNT(*) AS nb_events,
  COUNT(DISTINCT actor_id) AS nb_acteurs_distincts,
  SUM(CASE WHEN event_type = 'segment_validated' THEN 1 ELSE 0 END) AS segments,
  SUM(CASE WHEN event_type = 'book_completed' THEN 1 ELSE 0 END) AS completions
FROM public.feed_events
WHERE created_at >= CURRENT_DATE - INTERVAL '20 days'
GROUP BY jour
ORDER BY jour DESC;

-- 2) Vérification acteurs uniques par jour
SELECT 
  jour,
  nb_events,
  nb_acteurs,
  CASE 
    WHEN nb_events = nb_acteurs THEN '✓ OK'
    ELSE '✗ ÉCHEC'
  END AS test_unicite
FROM (
  SELECT 
    DATE(created_at AT TIME ZONE 'Europe/Paris') AS jour,
    COUNT(*) AS nb_events,
    COUNT(DISTINCT actor_id) AS nb_acteurs
  FROM public.feed_events
  WHERE created_at >= CURRENT_DATE - INTERVAL '20 days'
  GROUP BY jour
) sub
ORDER BY jour DESC;

-- 3) Stats bookys
SELECT 
  COUNT(DISTINCT fe.id) AS events_avec_bookys,
  COUNT(fl.id) AS total_bookys,
  ROUND(AVG(bookys_per_event)::NUMERIC, 2) AS avg_bookys_par_event,
  MIN(bookys_per_event) AS min_bookys,
  MAX(bookys_per_event) AS max_bookys
FROM public.feed_events fe
LEFT JOIN (
  SELECT event_id, COUNT(*) AS bookys_per_event
  FROM public.feed_bookys
  GROUP BY event_id
) fl ON fl.event_id = fe.id
WHERE fe.created_at >= CURRENT_DATE - INTERVAL '20 days';

-- 4) Sample d'événements récents
SELECT 
  e.id,
  e.created_at,
  e.event_type,
  e.segment,
  p.username AS actor,
  b.title AS book,
  (SELECT COUNT(*) FROM public.feed_bookys l WHERE l.event_id = e.id) AS bookys
FROM public.feed_events e
JOIN public.profiles p ON p.id = e.actor_id
LEFT JOIN public.books b ON b.id::TEXT = e.book_id::TEXT
ORDER BY e.created_at DESC
LIMIT 10;
