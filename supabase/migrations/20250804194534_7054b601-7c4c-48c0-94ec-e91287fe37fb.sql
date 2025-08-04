-- Partie 2: Données de lecture, validations, badges et relations sociales (version corrigée)

BEGIN;
SET ROLE service_role;

-- Reading Progress (3-8 livres par profil)
INSERT INTO public.reading_progress (id, user_id, book_id, current_page, total_pages, status, started_at, updated_at, streak_current, streak_best) VALUES
-- lecteur001 (5 livres: 2 completed, 2 in_progress, 1 to_read)
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur001@test.com'), 'camus-etranger', 159, 159, 'completed', '2024-07-15 09:00:00', '2024-08-12 18:30:00', 12, 18),
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur001@test.com'), 'orwell-1984', 328, 328, 'completed', '2024-08-20 10:15:00', '2024-09-15 20:45:00', 12, 18),
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur001@test.com'), 'hugo-miserables', 156, 312, 'in_progress', '2024-10-01 14:00:00', '2024-12-20 19:20:00', 12, 18),
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur001@test.com'), 'proust-recherche', 89, 178, 'in_progress', '2024-11-15 11:30:00', '2024-12-21 16:10:00', 12, 18),
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur001@test.com'), 'sartre-nausee', 0, 190, 'to_read', '2024-12-10 08:00:00', '2024-12-10 08:00:00', 12, 18),

-- lecteur002 (4 livres: 1 completed, 2 in_progress, 1 to_read)
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur002@test.com'), 'voltaire-candide', 142, 142, 'completed', '2024-06-20 15:20:00', '2024-07-18 21:15:00', 8, 15),
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur002@test.com'), 'balzac-goriot', 98, 195, 'in_progress', '2024-08-05 13:45:00', '2024-12-19 17:30:00', 8, 15),
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur002@test.com'), 'stendhal-rouge', 67, 134, 'in_progress', '2024-10-12 16:20:00', '2024-12-20 14:25:00', 8, 15),
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur002@test.com'), 'flaubert-bovary', 0, 156, 'to_read', '2024-11-25 09:10:00', '2024-11-25 09:10:00', 8, 15),

-- lecteur003 (6 livres: 3 completed, 1 in_progress, 2 to_read)
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur003@test.com'), 'zola-germinal', 178, 178, 'completed', '2024-07-01 12:30:00', '2024-08-05 19:45:00', 5, 12),
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur003@test.com'), 'maupassant-boule', 89, 89, 'completed', '2024-08-15 14:15:00', '2024-08-28 16:20:00', 5, 12),
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur003@test.com'), 'dumas-monte-cristo', 445, 445, 'completed', '2024-09-10 10:00:00', '2024-11-20 22:30:00', 5, 12),
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur003@test.com'), 'sand-mare-diable', 45, 90, 'in_progress', '2024-12-01 11:30:00', '2024-12-21 18:45:00', 5, 12),
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur003@test.com'), 'baudelaire-fleurs', 0, 123, 'to_read', '2024-12-15 09:00:00', '2024-12-15 09:00:00', 5, 12),
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur003@test.com'), 'rimbaud-saison', 0, 67, 'to_read', '2024-12-18 10:30:00', '2024-12-18 10:30:00', 5, 12),

-- lecteur004 (7 livres: 2 completed, 3 in_progress, 2 to_read)
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur004@test.com'), 'huxley-brave-world', 234, 234, 'completed', '2024-06-10 08:15:00', '2024-07-12 20:45:00', 18, 25),
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur004@test.com'), 'bradbury-451', 167, 167, 'completed', '2024-08-01 13:20:00', '2024-08-25 17:30:00', 18, 25),
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur004@test.com'), 'wells-machine', 78, 156, 'in_progress', '2024-09-15 15:45:00', '2024-12-20 16:15:00', 18, 25),
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur004@test.com'), 'asimov-fondation', 123, 245, 'in_progress', '2024-10-20 11:00:00', '2024-12-21 14:20:00', 18, 25),
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur004@test.com'), 'dick-androids', 89, 178, 'in_progress', '2024-11-05 09:30:00', '2024-12-19 19:45:00', 18, 25),
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur004@test.com'), 'verne-terre-lune', 0, 134, 'to_read', '2024-12-05 12:00:00', '2024-12-05 12:00:00', 18, 25),
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur004@test.com'), 'camus-etranger', 0, 159, 'to_read', '2024-12-12 14:30:00', '2024-12-12 14:30:00', 18, 25),

-- lecteur005 (3 livres: 1 completed, 1 in_progress, 1 to_read)
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur005@test.com'), 'descartes-methode', 89, 89, 'completed', '2024-09-01 10:20:00', '2024-09-28 18:15:00', 3, 7),
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur005@test.com'), 'pascal-pensees', 67, 134, 'in_progress', '2024-10-15 16:45:00', '2024-12-20 20:30:00', 3, 7),
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur005@test.com'), 'kant-critique', 0, 178, 'to_read', '2024-12-01 11:00:00', '2024-12-01 11:00:00', 3, 7);

-- Reading Validations pour quelques profils (échantillon représentatif)
INSERT INTO public.reading_validations (id, user_id, book_id, segment, question_id, correct, validated_at, answer, progress_id, used_joker) VALUES
-- Validations pour lecteur001 (actif avec plusieurs validations)
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur001@test.com'), 'camus-etranger', 1, NULL, true, '2024-07-16 10:30:00', 'Réponse valide', (SELECT id FROM reading_progress WHERE user_id = (SELECT id FROM public.profiles WHERE email = 'lecteur001@test.com') AND book_id = 'camus-etranger'), false),
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur001@test.com'), 'camus-etranger', 2, NULL, true, '2024-07-20 14:15:00', 'Réponse valide', (SELECT id FROM reading_progress WHERE user_id = (SELECT id FROM public.profiles WHERE email = 'lecteur001@test.com') AND book_id = 'camus-etranger'), false),
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur001@test.com'), 'camus-etranger', 3, NULL, true, '2024-07-25 16:45:00', 'Réponse valide', (SELECT id FROM reading_progress WHERE user_id = (SELECT id FROM public.profiles WHERE email = 'lecteur001@test.com') AND book_id = 'camus-etranger'), false),
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur001@test.com'), 'orwell-1984', 1, NULL, true, '2024-08-21 11:20:00', 'Réponse valide', (SELECT id FROM reading_progress WHERE user_id = (SELECT id FROM public.profiles WHERE email = 'lecteur001@test.com') AND book_id = 'orwell-1984'), false),
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur001@test.com'), 'orwell-1984', 2, NULL, true, '2024-08-28 15:30:00', 'Réponse valide', (SELECT id FROM reading_progress WHERE user_id = (SELECT id FROM public.profiles WHERE email = 'lecteur001@test.com') AND book_id = 'orwell-1984'), false),

-- Validations pour lecteur002
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur002@test.com'), 'voltaire-candide', 1, NULL, true, '2024-06-22 09:45:00', 'Réponse valide', (SELECT id FROM reading_progress WHERE user_id = (SELECT id FROM public.profiles WHERE email = 'lecteur002@test.com') AND book_id = 'voltaire-candide'), false),
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur002@test.com'), 'voltaire-candide', 2, NULL, true, '2024-07-05 17:20:00', 'Réponse valide', (SELECT id FROM reading_progress WHERE user_id = (SELECT id FROM public.profiles WHERE email = 'lecteur002@test.com') AND book_id = 'voltaire-candide'), false),

-- Validations pour lecteur004 (très actif)
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur004@test.com'), 'huxley-brave-world', 1, NULL, true, '2024-06-12 10:00:00', 'Réponse valide', (SELECT id FROM reading_progress WHERE user_id = (SELECT id FROM public.profiles WHERE email = 'lecteur004@test.com') AND book_id = 'huxley-brave-world'), false),
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur004@test.com'), 'huxley-brave-world', 2, NULL, true, '2024-06-18 14:30:00', 'Réponse valide', (SELECT id FROM reading_progress WHERE user_id = (SELECT id FROM public.profiles WHERE email = 'lecteur004@test.com') AND book_id = 'huxley-brave-world'), false),
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur004@test.com'), 'huxley-brave-world', 3, NULL, true, '2024-06-25 16:45:00', 'Réponse valide', (SELECT id FROM reading_progress WHERE user_id = (SELECT id FROM public.profiles WHERE email = 'lecteur004@test.com') AND book_id = 'huxley-brave-world'), false),
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur004@test.com'), 'bradbury-451', 1, NULL, true, '2024-08-03 11:15:00', 'Réponse valide', (SELECT id FROM reading_progress WHERE user_id = (SELECT id FROM public.profiles WHERE email = 'lecteur004@test.com') AND book_id = 'bradbury-451'), false),
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur004@test.com'), 'bradbury-451', 2, NULL, true, '2024-08-10 13:45:00', 'Réponse valide', (SELECT id FROM reading_progress WHERE user_id = (SELECT id FROM public.profiles WHERE email = 'lecteur004@test.com') AND book_id = 'bradbury-451'), false);

-- User Badges (2-8 badges par profil)
INSERT INTO public.user_badges (id, user_id, badge_id, earned_at) VALUES
-- lecteur001 (6 badges)
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur001@test.com'), '01931e3f-8b5b-722e-ad09-93c93b8b32bf', '2024-07-20 10:30:00'),
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur001@test.com'), '01931e3f-8b5b-7232-a18a-5b9b3e4b7c8d', '2024-08-15 14:45:00'),
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur001@test.com'), '01931e3f-8b5b-7234-a18c-7d9d5f6f9e0f', '2024-09-10 16:20:00'),
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur001@test.com'), '01931e3f-8b5b-7236-a18e-9f1f7h8h1i2i', '2024-10-05 18:15:00'),
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur001@test.com'), '01931e3f-8b5b-7238-a190-1j3j9k4k3l4l', '2024-11-20 20:30:00'),
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur001@test.com'), '01931e3f-8b5b-723a-a192-3l5l1m6m5n6n', '2024-12-15 12:45:00'),

-- lecteur002 (4 badges)
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur002@test.com'), '01931e3f-8b5b-722e-ad09-93c93b8b32bf', '2024-07-25 11:15:00'),
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur002@test.com'), '01931e3f-8b5b-7232-a18a-5b9b3e4b7c8d', '2024-08-20 15:30:00'),
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur002@test.com'), '01931e3f-8b5b-7234-a18c-7d9d5f6f9e0f', '2024-09-15 17:45:00'),
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur002@test.com'), '01931e3f-8b5b-7236-a18e-9f1f7h8h1i2i', '2024-10-10 19:20:00'),

-- lecteur003 (5 badges)
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur003@test.com'), '01931e3f-8b5b-722e-ad09-93c93b8b32bf', '2024-08-10 12:30:00'),
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur003@test.com'), '01931e3f-8b5b-7232-a18a-5b9b3e4b7c8d', '2024-09-05 14:15:00'),
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur003@test.com'), '01931e3f-8b5b-7234-a18c-7d9d5f6f9e0f', '2024-10-01 16:45:00'),
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur003@test.com'), '01931e3f-8b5b-7236-a18e-9f1f7h8h1i2i', '2024-11-15 18:30:00'),
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur003@test.com'), '01931e3f-8b5b-7238-a190-1j3j9k4k3l4l', '2024-12-01 20:15:00'),

-- lecteur004 (8 badges - influenceur)
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur004@test.com'), '01931e3f-8b5b-722e-ad09-93c93b8b32bf', '2024-06-25 09:15:00'),
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur004@test.com'), '01931e3f-8b5b-7232-a18a-5b9b3e4b7c8d', '2024-07-20 11:30:00'),
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur004@test.com'), '01931e3f-8b5b-7234-a18c-7d9d5f6f9e0f', '2024-08-15 13:45:00'),
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur004@test.com'), '01931e3f-8b5b-7236-a18e-9f1f7h8h1i2i', '2024-09-10 15:20:00'),
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur004@test.com'), '01931e3f-8b5b-7238-a190-1j3j9k4k3l4l', '2024-10-05 17:15:00'),
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur004@test.com'), '01931e3f-8b5b-723a-a192-3l5l1m6m5n6n', '2024-11-01 19:30:00'),
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur004@test.com'), '01931e3f-8b5b-723c-a194-5n7n3o8o7p8p', '2024-11-25 21:45:00'),
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur004@test.com'), '01931e3f-8b5b-723e-a196-7p9p5q0q9r0r', '2024-12-10 14:20:00'),

-- lecteur005 (3 badges)
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur005@test.com'), '01931e3f-8b5b-722e-ad09-93c93b8b32bf', '2024-09-15 10:45:00'),
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur005@test.com'), '01931e3f-8b5b-7232-a18a-5b9b3e4b7c8d', '2024-10-20 12:30:00'),
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur005@test.com'), '01931e3f-8b5b-7234-a18c-7d9d5f6f9e0f', '2024-11-10 14:15:00');

-- User Favorite Badges (max 3 par profil)
INSERT INTO public.user_favorite_badges (id, user_id, badge_id, created_at) VALUES
-- lecteur001 (3 favoris)
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur001@test.com'), '01931e3f-8b5b-722e-ad09-93c93b8b32bf', '2024-07-21 10:30:00'),
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur001@test.com'), '01931e3f-8b5b-7234-a18c-7d9d5f6f9e0f', '2024-09-11 16:20:00'),
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur001@test.com'), '01931e3f-8b5b-7238-a190-1j3j9k4k3l4l', '2024-11-21 20:30:00'),

-- lecteur002 (2 favoris)
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur002@test.com'), '01931e3f-8b5b-722e-ad09-93c93b8b32bf', '2024-07-26 11:15:00'),
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur002@test.com'), '01931e3f-8b5b-7236-a18e-9f1f7h8h1i2i', '2024-10-11 19:20:00'),

-- lecteur004 (3 favoris)
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur004@test.com'), '01931e3f-8b5b-7238-a190-1j3j9k4k3l4l', '2024-10-06 17:15:00'),
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur004@test.com'), '01931e3f-8b5b-723c-a194-5n7n3o8o7p8p', '2024-11-26 21:45:00'),
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur004@test.com'), '01931e3f-8b5b-723e-a196-7p9p5q0q9r0r', '2024-12-11 14:20:00');

-- User Favorite Books (quelques exemples)
INSERT INTO public.user_favorite_books (id, user_id, book_title, position, added_at) VALUES
-- lecteur001 (3 livres favoris)
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur001@test.com'), 'L''Étranger', 1, '2024-08-13 18:30:00'),
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur001@test.com'), '1984', 2, '2024-09-16 20:45:00'),
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur001@test.com'), 'Les Misérables', 3, '2024-10-02 14:00:00'),

-- lecteur003 (4 livres favoris)
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur003@test.com'), 'Germinal', 1, '2024-08-06 19:45:00'),
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur003@test.com'), 'Le Comte de Monte-Cristo', 2, '2024-11-21 22:30:00'),
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur003@test.com'), 'Boule de Suif', 3, '2024-08-29 16:20:00'),
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur003@test.com'), 'La Mare au Diable', 4, '2024-12-02 11:30:00'),

-- lecteur004 (5 livres favoris)
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur004@test.com'), 'Le Meilleur des mondes', 1, '2024-07-13 20:45:00'),
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur004@test.com'), 'Fahrenheit 451', 2, '2024-08-26 17:30:00'),
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur004@test.com'), 'La Machine à explorer le temps', 3, '2024-09-16 15:45:00'),
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur004@test.com'), 'Fondation', 4, '2024-10-21 11:00:00'),
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur004@test.com'), 'Les Androïdes rêvent-ils de moutons électriques ?', 5, '2024-11-06 09:30:00');

-- Relations de suivi (Followers) - Créer un réseau social réaliste
INSERT INTO public.followers (id, follower_id, following_id, created_at) VALUES
-- lecteur004 est un influenceur (15 followers)
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur001@test.com'), (SELECT id FROM public.profiles WHERE email = 'lecteur004@test.com'), '2024-07-01 10:00:00'),
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur002@test.com'), (SELECT id FROM public.profiles WHERE email = 'lecteur004@test.com'), '2024-07-05 12:30:00'),
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur003@test.com'), (SELECT id FROM public.profiles WHERE email = 'lecteur004@test.com'), '2024-07-10 14:15:00'),
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur005@test.com'), (SELECT id FROM public.profiles WHERE email = 'lecteur004@test.com'), '2024-07-15 16:45:00'),
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur006@test.com'), (SELECT id FROM public.profiles WHERE email = 'lecteur004@test.com'), '2024-07-20 18:20:00'),
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur007@test.com'), (SELECT id FROM public.profiles WHERE email = 'lecteur004@test.com'), '2024-08-01 09:30:00'),
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur008@test.com'), (SELECT id FROM public.profiles WHERE email = 'lecteur004@test.com'), '2024-08-10 11:15:00'),
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur009@test.com'), (SELECT id FROM public.profiles WHERE email = 'lecteur004@test.com'), '2024-08-20 13:45:00'),
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur010@test.com'), (SELECT id FROM public.profiles WHERE email = 'lecteur004@test.com'), '2024-09-01 15:30:00'),
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur011@test.com'), (SELECT id FROM public.profiles WHERE email = 'lecteur004@test.com'), '2024-09-15 17:20:00'),
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur012@test.com'), (SELECT id FROM public.profiles WHERE email = 'lecteur004@test.com'), '2024-10-01 19:45:00'),
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur013@test.com'), (SELECT id FROM public.profiles WHERE email = 'lecteur004@test.com'), '2024-10-15 21:30:00'),
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur014@test.com'), (SELECT id FROM public.profiles WHERE email = 'lecteur004@test.com'), '2024-11-01 08:15:00'),
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur015@test.com'), (SELECT id FROM public.profiles WHERE email = 'lecteur004@test.com'), '2024-11-20 10:45:00'),
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur016@test.com'), (SELECT id FROM public.profiles WHERE email = 'lecteur004@test.com'), '2024-12-05 12:30:00'),

-- Relations mutuelles entre quelques lecteurs actifs
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur001@test.com'), (SELECT id FROM public.profiles WHERE email = 'lecteur002@test.com'), '2024-08-01 10:15:00'),
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur002@test.com'), (SELECT id FROM public.profiles WHERE email = 'lecteur001@test.com'), '2024-08-02 14:30:00'),
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur001@test.com'), (SELECT id FROM public.profiles WHERE email = 'lecteur003@test.com'), '2024-08-15 16:20:00'),
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur003@test.com'), (SELECT id FROM public.profiles WHERE email = 'lecteur001@test.com'), '2024-08-16 18:45:00'),
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur002@test.com'), (SELECT id FROM public.profiles WHERE email = 'lecteur003@test.com'), '2024-09-01 11:30:00'),
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur003@test.com'), (SELECT id FROM public.profiles WHERE email = 'lecteur002@test.com'), '2024-09-02 13:15:00'),

-- lecteur004 suit aussi quelques personnes (influenceur actif)
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur004@test.com'), (SELECT id FROM public.profiles WHERE email = 'lecteur001@test.com'), '2024-07-02 11:00:00'),
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur004@test.com'), (SELECT id FROM public.profiles WHERE email = 'lecteur003@test.com'), '2024-07-12 15:30:00'),
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur004@test.com'), (SELECT id FROM public.profiles WHERE email = 'lecteur005@test.com'), '2024-08-05 17:45:00'),

-- Quelques autres relations pour enrichir le réseau
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur006@test.com'), (SELECT id FROM public.profiles WHERE email = 'lecteur007@test.com'), '2024-08-25 09:20:00'),
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur007@test.com'), (SELECT id FROM public.profiles WHERE email = 'lecteur008@test.com'), '2024-09-10 12:45:00'),
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur008@test.com'), (SELECT id FROM public.profiles WHERE email = 'lecteur009@test.com'), '2024-09-25 14:30:00'),
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur010@test.com'), (SELECT id FROM public.profiles WHERE email = 'lecteur011@test.com'), '2024-10-05 16:15:00'),
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur012@test.com'), (SELECT id FROM public.profiles WHERE email = 'lecteur013@test.com'), '2024-10-20 18:45:00'),
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur014@test.com'), (SELECT id FROM public.profiles WHERE email = 'lecteur015@test.com'), '2024-11-05 20:30:00'),
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur016@test.com'), (SELECT id FROM public.profiles WHERE email = 'lecteur017@test.com'), '2024-11-15 22:15:00'),
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur018@test.com'), (SELECT id FROM public.profiles WHERE email = 'lecteur019@test.com'), '2024-12-01 08:45:00'),
(gen_random_uuid(), (SELECT id FROM public.profiles WHERE email = 'lecteur020@test.com'), (SELECT id FROM public.profiles WHERE email = 'lecteur021@test.com'), '2024-12-10 10:30:00');

RESET ROLE;
COMMIT;