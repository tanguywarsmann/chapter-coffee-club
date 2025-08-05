-- Migration finale : créer 30 profils de test avec données complètes

BEGIN;
SET ROLE service_role;

-- D'abord insérer tous les profils sans référence complexe
DO $$
DECLARE
    profile_ids UUID[];
    i INTEGER;
    user_email TEXT;
    user_id UUID;
BEGIN
    -- Générer et insérer 30 profils
    FOR i IN 1..30 LOOP
        user_email := 'lecteur' || LPAD(i::TEXT, 3, '0') || '@test.com';
        user_id := gen_random_uuid();
        profile_ids := array_append(profile_ids, user_id);
        
        -- Insérer le profil
        INSERT INTO public.profiles (id, email, username, avatar_url, created_at, updated_at) 
        VALUES (
            user_id,
            user_email,
            'lecteur' || LPAD(i::TEXT, 3, '0'),
            'https://picsum.photos/200/200?random=' || i,
            CURRENT_DATE - (30 - i) * INTERVAL '1 day' + (i * INTERVAL '2 hour'),
            NOW()
        );
        
        -- Insérer user_levels
        INSERT INTO public.user_levels (id, user_id, xp, level, last_updated)
        VALUES (
            gen_random_uuid(),
            user_id,
            500 + (i * 200) + (RANDOM() * 1000)::INTEGER,
            LEAST(8, 1 + (i / 4)),
            NOW()
        );
        
        -- Insérer quelques reading_progress (3-6 livres par profil)
        FOR j IN 1..(3 + (i % 4)) LOOP
            INSERT INTO public.reading_progress (id, user_id, book_id, current_page, total_pages, status, started_at, updated_at, streak_current, streak_best)
            VALUES (
                gen_random_uuid(),
                user_id,
                CASE (i + j) % 10
                    WHEN 0 THEN 'camus-etranger'
                    WHEN 1 THEN 'orwell-1984'
                    WHEN 2 THEN 'hugo-miserables'
                    WHEN 3 THEN 'proust-recherche'
                    WHEN 4 THEN 'voltaire-candide'
                    WHEN 5 THEN 'balzac-goriot'
                    WHEN 6 THEN 'zola-germinal'
                    WHEN 7 THEN 'huxley-brave-world'
                    WHEN 8 THEN 'descartes-methode'
                    ELSE 'pascal-pensees'
                END,
                CASE 
                    WHEN j = 1 AND i % 3 = 0 THEN 200 + (RANDOM() * 100)::INTEGER -- completed
                    WHEN j <= 2 THEN (RANDOM() * 150)::INTEGER + 50 -- in_progress
                    ELSE 0 -- to_read
                END,
                200 + (RANDOM() * 100)::INTEGER,
                CASE 
                    WHEN j = 1 AND i % 3 = 0 THEN 'completed'
                    WHEN j <= 2 THEN 'in_progress'
                    ELSE 'to_read'
                END,
                NOW() - (30 - j) * INTERVAL '1 day',
                NOW() - (15 - j) * INTERVAL '1 day',
                i % 20,
                (i % 25) + 5
            );
        END LOOP;
        
        -- Insérer quelques badges (2-6 par profil)
        FOR j IN 1..(2 + (i % 5)) LOOP
            INSERT INTO public.user_badges (id, user_id, badge_id, earned_at)
            VALUES (
                gen_random_uuid(),
                user_id,
                CASE j % 10
                    WHEN 0 THEN '01931e3f-8b5b-722e-ad09-93c93b8b32bf'
                    WHEN 1 THEN '01931e3f-8b5b-7232-a18a-5b9b3e4b7c8d'
                    WHEN 2 THEN '01931e3f-8b5b-7234-a18c-7d9d5f6f9e0f'
                    WHEN 3 THEN '01931e3f-8b5b-7236-a18e-9f1f7h8h1i2i'
                    WHEN 4 THEN '01931e3f-8b5b-7238-a190-1j3j9k4k3l4l'
                    WHEN 5 THEN '01931e3f-8b5b-723a-a192-3l5l1m6m5n6n'
                    WHEN 6 THEN '01931e3f-8b5b-723c-a194-5n7n3o8o7p8p'
                    WHEN 7 THEN '01931e3f-8b5b-723e-a196-7p9p5q0q9r0r'
                    WHEN 8 THEN '01931e3f-8b5b-7240-a198-7r1r9s2s1t2t'
                    ELSE '01931e3f-8b5b-7242-a19a-9t3t1u4u3v4v'
                END,
                NOW() - (20 - j) * INTERVAL '1 day'
            );
        END LOOP;
        
        -- Quelques validations pour les profils actifs
        IF i <= 10 THEN
            FOR j IN 1..(i % 5 + 1) LOOP
                INSERT INTO public.reading_validations (id, user_id, book_id, segment, question_id, correct, validated_at, answer, progress_id, used_joker)
                SELECT 
                    gen_random_uuid(),
                    user_id,
                    'camus-etranger',
                    j,
                    NULL,
                    true,
                    NOW() - j * INTERVAL '1 day',
                    'Réponse valide',
                    rp.id,
                    false
                FROM reading_progress rp 
                WHERE rp.user_id = user_id AND rp.book_id = 'camus-etranger'
                LIMIT 1;
            END LOOP;
        END IF;
        
    END LOOP;
    
    -- Créer des relations de suivi réalistes
    -- lecteur004 comme influenceur avec beaucoup de followers
    FOR i IN 1..15 LOOP
        IF i != 4 THEN
            INSERT INTO public.followers (id, follower_id, following_id, created_at)
            SELECT 
                gen_random_uuid(),
                p1.id,
                p2.id,
                NOW() - (i * INTERVAL '2 day')
            FROM public.profiles p1, public.profiles p2
            WHERE p1.email = 'lecteur' || LPAD(i::TEXT, 3, '0') || '@test.com'
            AND p2.email = 'lecteur004@test.com';
        END IF;
    END LOOP;
    
    -- Quelques relations mutuelles
    FOR i IN 1..10 LOOP
        IF i != 4 AND i + 1 <= 30 THEN
            INSERT INTO public.followers (id, follower_id, following_id, created_at)
            SELECT 
                gen_random_uuid(),
                p1.id,
                p2.id,
                NOW() - (i * INTERVAL '1 day')
            FROM public.profiles p1, public.profiles p2
            WHERE p1.email = 'lecteur' || LPAD(i::TEXT, 3, '0') || '@test.com'
            AND p2.email = 'lecteur' || LPAD((i+1)::TEXT, 3, '0') || '@test.com';
            
            INSERT INTO public.followers (id, follower_id, following_id, created_at)
            SELECT 
                gen_random_uuid(),
                p2.id,
                p1.id,
                NOW() - (i * INTERVAL '1 day') + INTERVAL '1 hour'
            FROM public.profiles p1, public.profiles p2
            WHERE p1.email = 'lecteur' || LPAD(i::TEXT, 3, '0') || '@test.com'
            AND p2.email = 'lecteur' || LPAD((i+1)::TEXT, 3, '0') || '@test.com';
        END IF;
    END LOOP;

END $$;

RESET ROLE;
COMMIT;