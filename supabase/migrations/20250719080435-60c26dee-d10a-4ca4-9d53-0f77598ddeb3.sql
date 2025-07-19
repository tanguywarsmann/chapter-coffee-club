-- Supprimer la contrainte de clé étrangère sur reading_progress.user_id puis générer les données
DO $$
BEGIN
    -- Supprimer la contrainte si elle existe
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'reading_progress_user_id_fkey' 
               AND table_name = 'reading_progress') THEN
        ALTER TABLE reading_progress DROP CONSTRAINT reading_progress_user_id_fkey;
    END IF;
END $$;

-- Maintenant générer les données de lecture pour les 30 comptes factices
DO $$
DECLARE
    profile_record RECORD;
    book_record RECORD;
    books_array text[];
    selected_books text[];
    book_id text;
    reading_id uuid;
    start_date timestamp;
    end_date timestamp;
    segment_count integer;
    i integer;
BEGIN
    -- Récupérer les livres disponibles
    SELECT array_agg(id) INTO books_array 
    FROM books 
    WHERE is_published = true AND expected_segments IS NOT NULL;
    
    -- Pour chaque profil factice
    FOR profile_record IN 
        SELECT id, username, created_at FROM profiles 
        WHERE username IN ('mdussommier', 'emarotte', 'selaidi', 'jlbouritte', 'nvanschou',
                          'lgriselin', 'ibhsalah', 'okervern', 'fmontavon', 'aboutetlebon',
                          'croussange', 'yabouzeid', 'glegleuher', 'aprevostgrall', 'mdesrousseaux',
                          'velguea', 'izaidi', 'aportelance', 'sdubuisson', 'mchenot',
                          'ksoret', 'lbenkacem', 'rostermann', 'tchevrot', 'tnguyenba',
                          'sbelloc', 'jmontassier', 'ybensoussan', 'mreversat', 'fcaradec')
    LOOP
        -- Sélectionner 1-3 livres aléatoires
        selected_books := array(
            SELECT unnest(books_array) 
            ORDER BY random() 
            LIMIT (1 + floor(random() * 3))::integer
        );
        
        -- Pour chaque livre sélectionné
        FOREACH book_id IN ARRAY selected_books
        LOOP
            SELECT total_pages, expected_segments INTO book_record
            FROM books WHERE id = book_id;
            
            start_date := profile_record.created_at + (random() * interval '30 days');
            end_date := start_date + (random() * interval '15 days');
            reading_id := gen_random_uuid();
            
            -- Insérer la progression
            INSERT INTO reading_progress (
                id, user_id, book_id, current_page, total_pages, 
                status, started_at, updated_at, 
                streak_current, streak_best
            ) VALUES (
                reading_id, profile_record.id, book_id,
                book_record.total_pages, book_record.total_pages,
                'completed', start_date, end_date,
                1 + floor(random() * 7)::integer,
                1 + floor(random() * 10)::integer
            );
            
            -- Créer les validations
            segment_count := LEAST(1 + floor(random() * 4)::integer, COALESCE(book_record.expected_segments, 4));
            
            FOR i IN 1..segment_count LOOP
                INSERT INTO reading_validations (
                    id, user_id, book_id, segment, 
                    question_id, answer, correct, 
                    validated_at, used_joker, progress_id
                ) VALUES (
                    gen_random_uuid(), profile_record.id, book_id, i,
                    NULL, NULL, true,
                    start_date + (random() * (end_date - start_date)),
                    false, reading_id
                );
            END LOOP;
        END LOOP;
    END LOOP;
    
    RAISE NOTICE 'Données générées avec succès!';
END $$;