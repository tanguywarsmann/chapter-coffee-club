-- SEED FEED 20 JOURS GLISSANTS - VREAD
-- Génère événements + bookys avec alternance de densité

-- Variables
DO $$
DECLARE
  profiles_table TEXT := 'public.profiles';
  profiles_id_col TEXT := 'id';
  books_table TEXT := 'public.books';
  books_id_col TEXT := 'id';
  books_segments_col_preferred TEXT := 'expected_segments';
  feed_events_table TEXT := 'public.feed_events';
  feed_bookys_table TEXT := 'public.feed_bookys';
  timezone_name TEXT := 'Europe/Paris';
  
  v_day DATE;
  v_day_idx INT;
  v_events_count INT;
  v_event_type TEXT;
  v_actor_id UUID;
  v_book_id TEXT;
  v_segment INT;
  v_max_segment INT;
  v_event_ts TIMESTAMPTZ;
  v_event_id UUID;
  v_bookys_count INT;
  v_liker_id UUID;
  v_booky_ts TIMESTAMPTZ;
  v_hour INT;
  v_minute INT;
  
  v_users UUID[];
  v_books TEXT[];
  v_used_actors UUID[];
  v_available_likers UUID[];
  v_i INT;
  v_j INT;
BEGIN
  -- Créer table feed_events si absente
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'feed_events') THEN
    EXECUTE format('
      CREATE TABLE %s (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        actor_id UUID NOT NULL,
        event_type TEXT NOT NULL,
        book_id TEXT NOT NULL,
        segment INT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )', feed_events_table);
    
    EXECUTE format('CREATE INDEX idx_feed_events_created ON %s (created_at DESC)', feed_events_table);
    EXECUTE format('CREATE INDEX idx_feed_events_actor ON %s (actor_id)', feed_events_table);
  END IF;
  
  -- Créer table feed_bookys si absente
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'feed_bookys') THEN
    EXECUTE format('
      CREATE TABLE %s (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        event_id UUID NOT NULL,
        liker_id UUID NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        UNIQUE(event_id, liker_id)
      )', feed_bookys_table);
    
    EXECUTE format('CREATE INDEX idx_feed_bookys_event ON %s (event_id)', feed_bookys_table);
    EXECUTE format('CREATE INDEX idx_feed_bookys_liker ON %s (liker_id)', feed_bookys_table);
  END IF;
  
  -- Charger pool utilisateurs (130 aléatoires)
  EXECUTE format('SELECT ARRAY(SELECT %I FROM %s ORDER BY RANDOM() LIMIT 130)', profiles_id_col, profiles_table) INTO v_users;
  
  -- Charger pool livres
  EXECUTE format('SELECT ARRAY(SELECT %I FROM %s WHERE is_published = true ORDER BY RANDOM() LIMIT 50)', books_id_col, books_table) INTO v_books;
  
  IF array_length(v_users, 1) < 10 OR array_length(v_books, 1) < 5 THEN
    RAISE EXCEPTION 'Pas assez de données: % users, % books', array_length(v_users, 1), array_length(v_books, 1);
  END IF;
  
  -- Boucle sur 20 jours glissants
  FOR v_day_idx IN 0..19 LOOP
    v_day := CURRENT_DATE - v_day_idx;
    v_used_actors := ARRAY[]::UUID[];
    
    -- Alternance densité: pairs=basse(2-4), impairs=haute(8-10)
    IF v_day_idx % 2 = 0 THEN
      v_events_count := 2 + floor(random() * 3)::INT; -- 2-4
    ELSE
      v_events_count := 8 + floor(random() * 3)::INT; -- 8-10
    END IF;
    
    -- Générer événements du jour
    FOR v_i IN 1..v_events_count LOOP
      -- Acteur unique pour ce jour
      LOOP
        v_actor_id := v_users[1 + floor(random() * array_length(v_users, 1))::INT];
        EXIT WHEN NOT (v_actor_id = ANY(v_used_actors));
      END LOOP;
      v_used_actors := array_append(v_used_actors, v_actor_id);
      
      -- Type événement: 60% segment_validated, 40% book_completed
      IF random() < 0.6 THEN
        v_event_type := 'segment_validated';
      ELSE
        v_event_type := 'book_completed';
      END IF;
      
      -- Livre aléatoire
      v_book_id := v_books[1 + floor(random() * array_length(v_books, 1))::INT];
      
      -- Segment si applicable
      IF v_event_type = 'segment_validated' THEN
        EXECUTE format('SELECT COALESCE(%I, total_chapters, 20) FROM %s WHERE %I = $1', 
          books_segments_col_preferred, books_table, books_id_col) 
          INTO v_max_segment USING v_book_id;
        v_segment := 1 + floor(random() * v_max_segment)::INT;
      ELSE
        v_segment := NULL;
      END IF;
      
      -- Timestamp Europe/Paris entre 06:00 et 23:00
      v_hour := 6 + floor(random() * 17)::INT;
      v_minute := floor(random() * 60)::INT;
      v_event_ts := (v_day || ' ' || v_hour || ':' || v_minute || ':00')::TIMESTAMP AT TIME ZONE timezone_name;
      
      -- Insérer événement
      EXECUTE format('INSERT INTO %s (id, actor_id, event_type, book_id, segment, created_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id', 
        feed_events_table)
        INTO v_event_id
        USING gen_random_uuid(), v_actor_id, v_event_type, v_book_id, v_segment, v_event_ts;
      
      -- Bookys (~60% des événements, 1-6 bookys)
      IF random() < 0.6 THEN
        v_bookys_count := 1 + floor(random() * 6)::INT;
        v_available_likers := v_users;
        
        FOR v_j IN 1..LEAST(v_bookys_count, array_length(v_users, 1) - 1) LOOP
          -- Liker différent de l'acteur
          LOOP
            v_liker_id := v_available_likers[1 + floor(random() * array_length(v_available_likers, 1))::INT];
            EXIT WHEN v_liker_id IS NOT NULL AND v_liker_id != v_actor_id;
          END LOOP;
          
          -- Retirer liker du pool
          v_available_likers := array_remove(v_available_likers, v_liker_id);
          
          -- Timestamp booky: événement + 0-2h
          v_booky_ts := v_event_ts + (random() * INTERVAL '2 hours');
          
          -- Insérer booky (ON CONFLICT ignore)
          BEGIN
            EXECUTE format('INSERT INTO %s (event_id, liker_id, created_at) VALUES ($1, $2, $3)', 
              feed_bookys_table)
              USING v_event_id, v_liker_id, v_booky_ts;
          EXCEPTION WHEN unique_violation THEN
            -- Ignorer duplicatas
          END;
        END LOOP;
      END IF;
    END LOOP;
  END LOOP;
  
  RAISE NOTICE '✓ Seed terminé: 20 jours d''événements avec bookys';
END $$;

-- REQUÊTES DE CONTRÔLE

-- 1) Répartition par jour
SELECT 
  DATE(created_at AT TIME ZONE 'Europe/Paris') as jour,
  COUNT(*) as nb_events,
  COUNT(DISTINCT actor_id) as nb_acteurs_distincts,
  SUM(CASE WHEN event_type = 'segment_validated' THEN 1 ELSE 0 END) as segments,
  SUM(CASE WHEN event_type = 'book_completed' THEN 1 ELSE 0 END) as completions
FROM public.feed_events
WHERE created_at >= CURRENT_DATE - INTERVAL '20 days'
GROUP BY jour
ORDER BY jour DESC;

-- 2) Stats bookys
SELECT 
  COUNT(DISTINCT fe.id) as events_avec_bookys,
  COUNT(fl.id) as total_bookys,
  ROUND(AVG(bookys_per_event), 2) as avg_bookys_par_event
FROM public.feed_events fe
LEFT JOIN (
  SELECT event_id, COUNT(*) as bookys_per_event
  FROM public.feed_bookys
  GROUP BY event_id
) fl ON fl.event_id = fe.id
WHERE fe.created_at >= CURRENT_DATE - INTERVAL '20 days';
