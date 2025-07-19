-- Génération de lectures complètes pour les 30 comptes factices (correction avec book_id text)
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
    -- Récupérer les livres disponibles (IDs en text)
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
        -- Sélectionner 1-3 livres aléatoires pour ce profil
        selected_books := array(
            SELECT unnest(books_array) 
            ORDER BY random() 
            LIMIT (1 + floor(random() * 3))::integer
        );
        
        -- Pour chaque livre sélectionné
        FOREACH book_id IN ARRAY selected_books
        LOOP
            -- Récupérer les détails du livre
            SELECT total_pages, expected_segments INTO book_record
            FROM books WHERE id = book_id;
            
            -- Générer des dates cohérentes
            start_date := profile_record.created_at + (random() * interval '30 days');
            end_date := start_date + (random() * interval '15 days');
            
            -- Créer l'ID de lecture
            reading_id := gen_random_uuid();
            
            -- Insérer la progression de lecture (complète)
            INSERT INTO reading_progress (
                id, user_id, book_id, current_page, total_pages, 
                status, started_at, updated_at, 
                streak_current, streak_best
            ) VALUES (
                reading_id,
                profile_record.id,
                book_id,
                book_record.total_pages,
                book_record.total_pages,
                'completed',
                start_date,
                end_date,
                1 + floor(random() * 7)::integer,
                1 + floor(random() * 10)::integer
            );
            
            -- Créer 1-4 validations pour ce livre
            segment_count := LEAST(1 + floor(random() * 4)::integer, COALESCE(book_record.expected_segments, 4));
            
            FOR i IN 1..segment_count LOOP
                INSERT INTO reading_validations (
                    id, user_id, book_id, segment, 
                    question_id, answer, correct, 
                    validated_at, used_joker, progress_id
                ) VALUES (
                    gen_random_uuid(),
                    profile_record.id,
                    book_id,
                    i,
                    NULL,
                    NULL,
                    true,
                    start_date + (random() * (end_date - start_date)),
                    false,
                    reading_id
                );
            END LOOP;
            
        END LOOP;
    END LOOP;
END $$;