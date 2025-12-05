-- Script de génération de 30 profils lecteurs complets
-- Utilisation: psql -f scripts/generateReaderProfiles.sql

BEGIN;
SET ROLE service_role;

-- =====================================================
-- 1. INSERTION DES PROFILS (30 utilisateurs)
-- =====================================================

INSERT INTO auth.users (
  id, 
  email, 
  encrypted_password, 
  email_confirmed_at, 
  created_at, 
  updated_at,
  raw_user_meta_data,
  aud,
  role
) VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'lea.martin@example.com', '$2a$10$dummy.hash.for.testing', '2024-06-15 10:00:00+00', '2024-06-15 10:00:00+00', '2024-06-15 10:00:00+00', '{}', 'authenticated', 'authenticated'),
  ('550e8400-e29b-41d4-a716-446655440002', 'hugo.bernard@example.com', '$2a$10$dummy.hash.for.testing', '2024-06-20 11:30:00+00', '2024-06-20 11:30:00+00', '2024-06-20 11:30:00+00', '{}', 'authenticated', 'authenticated'),
  ('550e8400-e29b-41d4-a716-446655440003', 'emma.dubois@example.com', '$2a$10$dummy.hash.for.testing', '2024-06-25 14:15:00+00', '2024-06-25 14:15:00+00', '2024-06-25 14:15:00+00', '{}', 'authenticated', 'authenticated'),
  ('550e8400-e29b-41d4-a716-446655440004', 'lucas.moreau@example.com', '$2a$10$dummy.hash.for.testing', '2024-07-01 09:45:00+00', '2024-07-01 09:45:00+00', '2024-07-01 09:45:00+00', '{}', 'authenticated', 'authenticated'),
  ('550e8400-e29b-41d4-a716-446655440005', 'chloe.thomas@example.com', '$2a$10$dummy.hash.for.testing', '2024-07-05 16:20:00+00', '2024-07-05 16:20:00+00', '2024-07-05 16:20:00+00', '{}', 'authenticated', 'authenticated'),
  ('550e8400-e29b-41d4-a716-446655440006', 'ines.roux@example.com', '$2a$10$dummy.hash.for.testing', '2024-07-10 12:30:00+00', '2024-07-10 12:30:00+00', '2024-07-10 12:30:00+00', '{}', 'authenticated', 'authenticated'),
  ('550e8400-e29b-41d4-a716-446655440007', 'theo.lambert@example.com', '$2a$10$dummy.hash.for.testing', '2024-07-15 08:45:00+00', '2024-07-15 08:45:00+00', '2024-07-15 08:45:00+00', '{}', 'authenticated', 'authenticated'),
  ('550e8400-e29b-41d4-a716-446655440008', 'manon.garcia@example.com', '$2a$10$dummy.hash.for.testing', '2024-07-20 15:10:00+00', '2024-07-20 15:10:00+00', '2024-07-20 15:10:00+00', '{}', 'authenticated', 'authenticated'),
  ('550e8400-e29b-41d4-a716-446655440009', 'nathan.simon@example.com', '$2a$10$dummy.hash.for.testing', '2024-07-25 11:20:00+00', '2024-07-25 11:20:00+00', '2024-07-25 11:20:00+00', '{}', 'authenticated', 'authenticated'),
  ('550e8400-e29b-41d4-a716-446655440010', 'jade.faure@example.com', '$2a$10$dummy.hash.for.testing', '2024-08-01 13:40:00+00', '2024-08-01 13:40:00+00', '2024-08-01 13:40:00+00', '{}', 'authenticated', 'authenticated'),
  ('550e8400-e29b-41d4-a716-446655440011', 'yasmine.benali@example.com', '$2a$10$dummy.hash.for.testing', '2024-08-05 10:15:00+00', '2024-08-05 10:15:00+00', '2024-08-05 10:15:00+00', '{}', 'authenticated', 'authenticated'),
  ('550e8400-e29b-41d4-a716-446655440012', 'karim.hamidi@example.com', '$2a$10$dummy.hash.for.testing', '2024-08-10 17:25:00+00', '2024-08-10 17:25:00+00', '2024-08-10 17:25:00+00', '{}', 'authenticated', 'authenticated'),
  ('550e8400-e29b-41d4-a716-446655440013', 'sofia.hadj@example.com', '$2a$10$dummy.hash.for.testing', '2024-08-15 14:50:00+00', '2024-08-15 14:50:00+00', '2024-08-15 14:50:00+00', '{}', 'authenticated', 'authenticated'),
  ('550e8400-e29b-41d4-a716-446655440014', 'amine.cherif@example.com', '$2a$10$dummy.hash.for.testing', '2024-08-20 09:30:00+00', '2024-08-20 09:30:00+00', '2024-08-20 09:30:00+00', '{}', 'authenticated', 'authenticated'),
  ('550e8400-e29b-41d4-a716-446655440015', 'nadia.boucher@example.com', '$2a$10$dummy.hash.for.testing', '2024-08-25 16:45:00+00', '2024-08-25 16:45:00+00', '2024-08-25 16:45:00+00', '{}', 'authenticated', 'authenticated'),
  ('550e8400-e29b-41d4-a716-446655440016', 'mathis.leroy@example.com', '$2a$10$dummy.hash.for.testing', '2024-09-01 12:20:00+00', '2024-09-01 12:20:00+00', '2024-09-01 12:20:00+00', '{}', 'authenticated', 'authenticated'),
  ('550e8400-e29b-41d4-a716-446655440017', 'louise.girard@example.com', '$2a$10$dummy.hash.for.testing', '2024-09-05 08:35:00+00', '2024-09-05 08:35:00+00', '2024-09-05 08:35:00+00', '{}', 'authenticated', 'authenticated'),
  ('550e8400-e29b-41d4-a716-446655440018', 'gabriel.fontaine@example.com', '$2a$10$dummy.hash.for.testing', '2024-09-10 15:40:00+00', '2024-09-10 15:40:00+00', '2024-09-10 15:40:00+00', '{}', 'authenticated', 'authenticated'),
  ('550e8400-e29b-41d4-a716-446655440019', 'clara.perrin@example.com', '$2a$10$dummy.hash.for.testing', '2024-09-15 11:55:00+00', '2024-09-15 11:55:00+00', '2024-09-15 11:55:00+00', '{}', 'authenticated', 'authenticated'),
  ('550e8400-e29b-41d4-a716-446655440020', 'maxime.duval@example.com', '$2a$10$dummy.hash.for.testing', '2024-09-20 14:10:00+00', '2024-09-20 14:10:00+00', '2024-09-20 14:10:00+00', '{}', 'authenticated', 'authenticated'),
  ('550e8400-e29b-41d4-a716-446655440021', 'sarah.nguyen@example.com', '$2a$10$dummy.hash.for.testing', '2024-09-25 10:25:00+00', '2024-09-25 10:25:00+00', '2024-09-25 10:25:00+00', '{}', 'authenticated', 'authenticated'),
  ('550e8400-e29b-41d4-a716-446655440022', 'antoine.mercier@example.com', '$2a$10$dummy.hash.for.testing', '2024-10-01 16:30:00+00', '2024-10-01 16:30:00+00', '2024-10-01 16:30:00+00', '{}', 'authenticated', 'authenticated'),
  ('550e8400-e29b-41d4-a716-446655440023', 'juliette.blanc@example.com', '$2a$10$dummy.hash.for.testing', '2024-10-05 13:15:00+00', '2024-10-05 13:15:00+00', '2024-10-05 13:15:00+00', '{}', 'authenticated', 'authenticated'),
  ('550e8400-e29b-41d4-a716-446655440024', 'romain.chevalier@example.com', '$2a$10$dummy.hash.for.testing', '2024-10-10 09:50:00+00', '2024-10-10 09:50:00+00', '2024-10-10 09:50:00+00', '{}', 'authenticated', 'authenticated'),
  ('550e8400-e29b-41d4-a716-446655440025', 'camille.morin@example.com', '$2a$10$dummy.hash.for.testing', '2024-10-15 15:05:00+00', '2024-10-15 15:05:00+00', '2024-10-15 15:05:00+00', '{}', 'authenticated', 'authenticated'),
  ('550e8400-e29b-41d4-a716-446655440026', 'alexandre.petit@example.com', '$2a$10$dummy.hash.for.testing', '2024-10-20 12:40:00+00', '2024-10-20 12:40:00+00', '2024-10-20 12:40:00+00', '{}', 'authenticated', 'authenticated'),
  ('550e8400-e29b-41d4-a716-446655440027', 'marine.rousseau@example.com', '$2a$10$dummy.hash.for.testing', '2024-10-25 08:20:00+00', '2024-10-25 08:20:00+00', '2024-10-25 08:20:00+00', '{}', 'authenticated', 'authenticated'),
  ('550e8400-e29b-41d4-a716-446655440028', 'paul.fournier@example.com', '$2a$10$dummy.hash.for.testing', '2024-11-01 14:35:00+00', '2024-11-01 14:35:00+00', '2024-11-01 14:35:00+00', '{}', 'authenticated', 'authenticated'),
  ('550e8400-e29b-41d4-a716-446655440029', 'alice.lefevre@example.com', '$2a$10$dummy.hash.for.testing', '2024-11-05 11:45:00+00', '2024-11-05 11:45:00+00', '2024-11-05 11:45:00+00', '{}', 'authenticated', 'authenticated'),
  ('550e8400-e29b-41d4-a716-446655440030', 'victor.martinez@example.com', '$2a$10$dummy.hash.for.testing', '2024-11-10 17:00:00+00', '2024-11-10 17:00:00+00', '2024-11-10 17:00:00+00', '{}', 'authenticated', 'authenticated');

INSERT INTO public.profiles (
  id, 
  username, 
  email, 
  avatar_url, 
  is_admin, 
  created_at, 
  updated_at
) VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'lea_martin', 'lea.martin@example.com', 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b', false, '2024-06-15 10:00:00+00', '2024-06-15 10:00:00+00'),
  ('550e8400-e29b-41d4-a716-446655440002', 'hugo_bernard', 'hugo.bernard@example.com', 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158', false, '2024-06-20 11:30:00+00', '2024-06-20 11:30:00+00'),
  ('550e8400-e29b-41d4-a716-446655440003', 'emma_dubois', 'emma.dubois@example.com', 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e', false, '2024-06-25 14:15:00+00', '2024-06-25 14:15:00+00'),
  ('550e8400-e29b-41d4-a716-446655440004', 'lucas_moreau', 'lucas.moreau@example.com', 'https://images.unsplash.com/photo-1531297484001-80022131f5a1', false, '2024-07-01 09:45:00+00', '2024-07-01 09:45:00+00'),
  ('550e8400-e29b-41d4-a716-446655440005', 'chloe_thomas', 'chloe.thomas@example.com', 'https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b', false, '2024-07-05 16:20:00+00', '2024-07-05 16:20:00+00'),
  ('550e8400-e29b-41d4-a716-446655440006', 'ines_roux', 'ines.roux@example.com', 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b', false, '2024-07-10 12:30:00+00', '2024-07-10 12:30:00+00'),
  ('550e8400-e29b-41d4-a716-446655440007', 'theo_lambert', 'theo.lambert@example.com', 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158', false, '2024-07-15 08:45:00+00', '2024-07-15 08:45:00+00'),
  ('550e8400-e29b-41d4-a716-446655440008', 'manon_garcia', 'manon.garcia@example.com', 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e', false, '2024-07-20 15:10:00+00', '2024-07-20 15:10:00+00'),
  ('550e8400-e29b-41d4-a716-446655440009', 'nathan_simon', 'nathan.simon@example.com', 'https://images.unsplash.com/photo-1531297484001-80022131f5a1', false, '2024-07-25 11:20:00+00', '2024-07-25 11:20:00+00'),
  ('550e8400-e29b-41d4-a716-446655440010', 'jade_faure', 'jade.faure@example.com', 'https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b', false, '2024-08-01 13:40:00+00', '2024-08-01 13:40:00+00'),
  ('550e8400-e29b-41d4-a716-446655440011', 'yasmine_benali', 'yasmine.benali@example.com', 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b', false, '2024-08-05 10:15:00+00', '2024-08-05 10:15:00+00'),
  ('550e8400-e29b-41d4-a716-446655440012', 'karim_hamidi', 'karim.hamidi@example.com', 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158', false, '2024-08-10 17:25:00+00', '2024-08-10 17:25:00+00'),
  ('550e8400-e29b-41d4-a716-446655440013', 'sofia_hadj', 'sofia.hadj@example.com', 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e', false, '2024-08-15 14:50:00+00', '2024-08-15 14:50:00+00'),
  ('550e8400-e29b-41d4-a716-446655440014', 'amine_cherif', 'amine.cherif@example.com', 'https://images.unsplash.com/photo-1531297484001-80022131f5a1', false, '2024-08-20 09:30:00+00', '2024-08-20 09:30:00+00'),
  ('550e8400-e29b-41d4-a716-446655440015', 'nadia_boucher', 'nadia.boucher@example.com', 'https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b', false, '2024-08-25 16:45:00+00', '2024-08-25 16:45:00+00'),
  ('550e8400-e29b-41d4-a716-446655440016', 'mathis_leroy', 'mathis.leroy@example.com', 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b', false, '2024-09-01 12:20:00+00', '2024-09-01 12:20:00+00'),
  ('550e8400-e29b-41d4-a716-446655440017', 'louise_girard', 'louise.girard@example.com', 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158', false, '2024-09-05 08:35:00+00', '2024-09-05 08:35:00+00'),
  ('550e8400-e29b-41d4-a716-446655440018', 'gabriel_fontaine', 'gabriel.fontaine@example.com', 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e', false, '2024-09-10 15:40:00+00', '2024-09-10 15:40:00+00'),
  ('550e8400-e29b-41d4-a716-446655440019', 'clara_perrin', 'clara.perrin@example.com', 'https://images.unsplash.com/photo-1531297484001-80022131f5a1', false, '2024-09-15 11:55:00+00', '2024-09-15 11:55:00+00'),
  ('550e8400-e29b-41d4-a716-446655440020', 'maxime_duval', 'maxime.duval@example.com', 'https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b', false, '2024-09-20 14:10:00+00', '2024-09-20 14:10:00+00'),
  ('550e8400-e29b-41d4-a716-446655440021', 'sarah_nguyen', 'sarah.nguyen@example.com', 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b', false, '2024-09-25 10:25:00+00', '2024-09-25 10:25:00+00'),
  ('550e8400-e29b-41d4-a716-446655440022', 'antoine_mercier', 'antoine.mercier@example.com', 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158', false, '2024-10-01 16:30:00+00', '2024-10-01 16:30:00+00'),
  ('550e8400-e29b-41d4-a716-446655440023', 'juliette_blanc', 'juliette.blanc@example.com', 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e', false, '2024-10-05 13:15:00+00', '2024-10-05 13:15:00+00'),
  ('550e8400-e29b-41d4-a716-446655440024', 'romain_chevalier', 'romain.chevalier@example.com', 'https://images.unsplash.com/photo-1531297484001-80022131f5a1', false, '2024-10-10 09:50:00+00', '2024-10-10 09:50:00+00'),
  ('550e8400-e29b-41d4-a716-446655440025', 'camille_morin', 'camille.morin@example.com', 'https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b', false, '2024-10-15 15:05:00+00', '2024-10-15 15:05:00+00'),
  ('550e8400-e29b-41d4-a716-446655440026', 'alexandre_petit', 'alexandre.petit@example.com', 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b', false, '2024-10-20 12:40:00+00', '2024-10-20 12:40:00+00'),
  ('550e8400-e29b-41d4-a716-446655440027', 'marine_rousseau', 'marine.rousseau@example.com', 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158', false, '2024-10-25 08:20:00+00', '2024-10-25 08:20:00+00'),
  ('550e8400-e29b-41d4-a716-446655440028', 'paul_fournier', 'paul.fournier@example.com', 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e', false, '2024-11-01 14:35:00+00', '2024-11-01 14:35:00+00'),
  ('550e8400-e29b-41d4-a716-446655440029', 'alice_lefevre', 'alice.lefevre@example.com', 'https://images.unsplash.com/photo-1531297484001-80022131f5a1', false, '2024-11-05 11:45:00+00', '2024-11-05 11:45:00+00'),
  ('550e8400-e29b-41d4-a716-446655440030', 'victor_martinez', 'victor.martinez@example.com', 'https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b', false, '2024-11-10 17:00:00+00', '2024-11-10 17:00:00+00');

-- =====================================================
-- 2. NIVEAUX ET XP DES UTILISATEURS
-- =====================================================

INSERT INTO public.user_levels (
  user_id, 
  xp, 
  level, 
  last_updated
) VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 1250, 3, '2024-12-01 10:00:00+00'),
  ('550e8400-e29b-41d4-a716-446655440002', 2100, 4, '2024-12-01 11:30:00+00'),
  ('550e8400-e29b-41d4-a716-446655440003', 750, 2, '2024-12-01 14:15:00+00'),
  ('550e8400-e29b-41d4-a716-446655440004', 3200, 5, '2024-12-01 09:45:00+00'),
  ('550e8400-e29b-41d4-a716-446655440005', 1800, 4, '2024-12-01 16:20:00+00'),
  ('550e8400-e29b-41d4-a716-446655440006', 950, 2, '2024-12-01 12:30:00+00'),
  ('550e8400-e29b-41d4-a716-446655440007', 5500, 7, '2024-12-01 08:45:00+00'),
  ('550e8400-e29b-41d4-a716-446655440008', 1450, 3, '2024-12-01 15:10:00+00'),
  ('550e8400-e29b-41d4-a716-446655440009', 2850, 5, '2024-12-01 11:20:00+00'),
  ('550e8400-e29b-41d4-a716-446655440010', 650, 2, '2024-12-01 13:40:00+00'),
  ('550e8400-e29b-41d4-a716-446655440011', 4200, 6, '2024-12-01 10:15:00+00'),
  ('550e8400-e29b-41d4-a716-446655440012', 1100, 3, '2024-12-01 17:25:00+00'),
  ('550e8400-e29b-41d4-a716-446655440013', 2650, 4, '2024-12-01 14:50:00+00'),
  ('550e8400-e29b-41d4-a716-446655440014', 1550, 3, '2024-12-01 09:30:00+00'),
  ('550e8400-e29b-41d4-a716-446655440015', 3800, 6, '2024-12-01 16:45:00+00'),
  ('550e8400-e29b-41d4-a716-446655440016', 850, 2, '2024-12-01 12:20:00+00'),
  ('550e8400-e29b-41d4-a716-446655440017', 6200, 8, '2024-12-01 08:35:00+00'),
  ('550e8400-e29b-41d4-a716-446655440018', 1350, 3, '2024-12-01 15:40:00+00'),
  ('550e8400-e29b-41d4-a716-446655440019', 2450, 4, '2024-12-01 11:55:00+00'),
  ('550e8400-e29b-41d4-a716-446655440020', 950, 2, '2024-12-01 14:10:00+00'),
  ('550e8400-e29b-41d4-a716-446655440021', 4850, 7, '2024-12-01 10:25:00+00'),
  ('550e8400-e29b-41d4-a716-446655440022', 1650, 3, '2024-12-01 16:30:00+00'),
  ('550e8400-e29b-41d4-a716-446655440023', 3150, 5, '2024-12-01 13:15:00+00'),
  ('550e8400-e29b-41d4-a716-446655440024', 750, 2, '2024-12-01 09:50:00+00'),
  ('550e8400-e29b-41d4-a716-446655440025', 5100, 7, '2024-12-01 15:05:00+00'),
  ('550e8400-e29b-41d4-a716-446655440026', 1250, 3, '2024-12-01 12:40:00+00'),
  ('550e8400-e29b-41d4-a716-446655440027', 2750, 5, '2024-12-01 08:20:00+00'),
  ('550e8400-e29b-41d4-a716-446655440028', 1450, 3, '2024-12-01 14:35:00+00'),
  ('550e8400-e29b-41d4-a716-446655440029', 3650, 6, '2024-12-01 11:45:00+00'),
  ('550e8400-e29b-41d4-a716-446655440030', 850, 2, '2024-12-01 17:00:00+00');

-- =====================================================
-- 3. PROGRESSION DE LECTURE (3-8 livres par profil)
-- =====================================================

INSERT INTO public.reading_progress (
  id,
  user_id, 
  book_id, 
  current_page, 
  total_pages, 
  status, 
  started_at, 
  updated_at,
  streak_current,
  streak_best
) VALUES 
  -- Léa Martin: 5 livres (2 completed, 2 in_progress, 1 to_read)
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440001', 'george-orwell-1984', 328, 328, 'completed', '2024-06-16 10:00:00+00', '2024-07-15 18:30:00+00', 12, 18),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440001', 'aldous-huxley-brave-new-world', 268, 268, 'completed', '2024-07-20 14:00:00+00', '2024-08-18 16:45:00+00', 12, 18),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440001', 'victor-hugo-les-miserables', 156, 512, 'in_progress', '2024-08-25 09:30:00+00', '2024-12-01 20:15:00+00', 12, 18),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440001', 'aristotle-nicomachean-ethics', 89, 224, 'in_progress', '2024-10-01 11:00:00+00', '2024-12-01 19:30:00+00', 12, 18),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440001', 'plato-republic', 0, 416, 'to_read', '2024-11-15 10:00:00+00', '2024-11-15 10:00:00+00', 12, 18),
  
  -- Hugo Bernard: 6 livres (3 completed, 1 in_progress, 2 to_read)
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440002', 'marcus-aurelius-meditations', 180, 180, 'completed', '2024-06-22 11:30:00+00', '2024-07-20 14:20:00+00', 8, 21),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440002', 'ray-bradbury-fahrenheit-451', 194, 194, 'completed', '2024-07-25 16:00:00+00', '2024-08-22 19:15:00+00', 8, 21),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440002', 'anthony-robbins-unlimited-power', 432, 432, 'completed', '2024-09-01 13:45:00+00', '2024-10-15 17:30:00+00', 8, 21),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440002', 'gustave-flaubert-madame-bovary', 245, 384, 'in_progress', '2024-10-20 10:15:00+00', '2024-12-01 21:00:00+00', 8, 21),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440002', 'voltaire-candide', 0, 144, 'to_read', '2024-11-01 14:00:00+00', '2024-11-01 14:00:00+00', 8, 21),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440002', 'emile-zola-germinal', 0, 448, 'to_read', '2024-11-10 16:30:00+00', '2024-11-10 16:30:00+00', 8, 21),
  
  -- Emma Dubois: 4 livres (1 completed, 2 in_progress, 1 to_read)
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440003', 'stephen-covey-7-habits', 372, 372, 'completed', '2024-06-27 14:15:00+00', '2024-08-10 20:45:00+00', 5, 15),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440003', 'michel-de-montaigne-essais', 167, 336, 'in_progress', '2024-08-15 12:30:00+00', '2024-12-01 18:20:00+00', 5, 15),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440003', 'yann-arthus-bertrand-la-terre-vue-du-ciel', 89, 256, 'in_progress', '2024-10-05 15:45:00+00', '2024-12-01 19:10:00+00', 5, 15),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440003', 'jane-austen-pride-prejudice', 0, 352, 'to_read', '2024-11-20 11:00:00+00', '2024-11-20 11:00:00+00', 5, 15),
  
  -- Lucas Moreau: 7 livres (4 completed, 2 in_progress, 1 to_read)
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440004', 'dale-carnegie-how-to-win-friends', 288, 288, 'completed', '2024-07-03 09:45:00+00', '2024-08-01 15:30:00+00', 15, 25),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440004', 'fyodor-dostoevsky-crime-punishment', 520, 520, 'completed', '2024-08-05 14:20:00+00', '2024-09-28 19:45:00+00', 15, 25),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440004', 'napoleon-hill-think-grow-rich', 238, 238, 'completed', '2024-10-01 10:15:00+00', '2024-10-28 16:20:00+00', 15, 25),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440004', 'robert-greene-48-laws-power', 452, 452, 'completed', '2024-10-30 13:30:00+00', '2024-11-28 21:15:00+00', 15, 25),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440004', 'franz-kafka-the-trial', 178, 256, 'in_progress', '2024-11-20 09:00:00+00', '2024-12-01 20:30:00+00', 15, 25),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440004', 'albert-camus-letranger', 67, 123, 'in_progress', '2024-11-25 16:45:00+00', '2024-12-01 18:00:00+00', 15, 25),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440004', 'jean-paul-sartre-nausea', 0, 224, 'to_read', '2024-11-28 12:00:00+00', '2024-11-28 12:00:00+00', 15, 25),
  
  -- Chloé Thomas: 5 livres (2 completed, 2 in_progress, 1 to_read)
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440005', 'brene-brown-daring-greatly', 320, 320, 'completed', '2024-07-07 16:20:00+00', '2024-08-15 14:50:00+00', 10, 16),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440005', 'charlotte-bronte-jane-eyre', 448, 448, 'completed', '2024-08-20 11:30:00+00', '2024-10-05 18:40:00+00', 10, 16),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440005', 'gabriel-garcia-marquez-100-years', 267, 417, 'in_progress', '2024-10-10 09:15:00+00', '2024-12-01 19:55:00+00', 10, 16),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440005', 'simone-de-beauvoir-second-sex', 145, 832, 'in_progress', '2024-11-01 14:30:00+00', '2024-12-01 17:20:00+00', 10, 16),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440005', 'virginia-woolf-mrs-dalloway', 0, 194, 'to_read', '2024-11-25 10:00:00+00', '2024-11-25 10:00:00+00', 10, 16),
  
  -- Inès Roux: 4 livres (1 completed, 2 in_progress, 1 to_read)
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440006', 'eckhart-tolle-power-of-now', 236, 236, 'completed', '2024-07-12 12:30:00+00', '2024-08-25 15:45:00+00', 6, 12),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440006', 'leo-tolstoy-anna-karenina', 356, 864, 'in_progress', '2024-09-01 10:20:00+00', '2024-12-01 20:10:00+00', 6, 12),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440006', 'marcel-proust-swanns-way', 89, 468, 'in_progress', '2024-10-15 14:45:00+00', '2024-12-01 16:30:00+00', 6, 12),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440006', 'colette-gigi', 0, 128, 'to_read', '2024-11-18 09:30:00+00', '2024-11-18 09:30:00+00', 6, 12),
  
  -- Théo Lambert: 8 livres (5 completed, 2 in_progress, 1 to_read)
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440007', 'sun-tzu-art-of-war', 110, 110, 'completed', '2024-07-17 08:45:00+00', '2024-07-30 12:20:00+00', 20, 28),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440007', 'niccolo-machiavelli-the-prince', 140, 140, 'completed', '2024-08-01 15:10:00+00', '2024-08-20 18:35:00+00', 20, 28),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440007', 'james-clear-atomic-habits', 320, 320, 'completed', '2024-08-22 11:00:00+00', '2024-09-18 16:45:00+00', 20, 28),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440007', 'tim-ferriss-4-hour-workweek', 396, 396, 'completed', '2024-09-20 09:30:00+00', '2024-10-25 20:15:00+00', 20, 28),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440007', 'mark-manson-subtle-art', 224, 224, 'completed', '2024-10-28 14:20:00+00', '2024-11-15 19:50:00+00', 20, 28),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440007', 'homer-iliad', 312, 683, 'in_progress', '2024-11-18 10:45:00+00', '2024-12-01 21:30:00+00', 20, 28),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440007', 'virgil-aeneid', 156, 442, 'in_progress', '2024-11-25 08:00:00+00', '2024-12-01 17:45:00+00', 20, 28),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440007', 'dante-divine-comedy', 0, 798, 'to_read', '2024-11-30 13:15:00+00', '2024-11-30 13:15:00+00', 20, 28),
  
  -- Manon Garcia: 5 livres (2 completed, 2 in_progress, 1 to_read)
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440008', 'ryan-holiday-obstacle-is-the-way', 224, 224, 'completed', '2024-07-22 15:10:00+00', '2024-08-28 17:40:00+00', 9, 14),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440008', 'emily-bronte-wuthering-heights', 342, 342, 'completed', '2024-09-01 12:25:00+00', '2024-10-12 19:30:00+00', 9, 14),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440008', 'gustave-flaubert-sentimental-education', 189, 432, 'in_progress', '2024-10-18 10:00:00+00', '2024-12-01 18:55:00+00', 9, 14),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440008', 'honore-de-balzac-pere-goriot', 134, 304, 'in_progress', '2024-11-05 15:30:00+00', '2024-12-01 20:20:00+00', 9, 14),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440008', 'stendhal-red-and-black', 0, 576, 'to_read', '2024-11-22 11:45:00+00', '2024-11-22 11:45:00+00', 9, 14),
  
  -- Nathan Simon: 6 livres (3 completed, 2 in_progress, 1 to_read)
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440009', 'cal-newport-deep-work', 304, 304, 'completed', '2024-07-27 11:20:00+00', '2024-09-02 14:55:00+00', 14, 22),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440009', 'herman-melville-moby-dick', 585, 585, 'completed', '2024-09-05 09:40:00+00', '2024-11-01 18:20:00+00', 14, 22),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440009', 'yuval-noah-harari-sapiens', 498, 498, 'completed', '2024-11-03 13:15:00+00', '2024-11-28 21:45:00+00', 14, 22),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440009', 'charles-dickens-great-expectations', 267, 505, 'in_progress', '2024-11-20 10:30:00+00', '2024-12-01 19:40:00+00', 14, 22),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440009', 'thomas-hardy-tess', 189, 432, 'in_progress', '2024-11-26 14:00:00+00', '2024-12-01 16:15:00+00', 14, 22),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440009', 'joseph-conrad-heart-of-darkness', 0, 144, 'to_read', '2024-11-29 09:15:00+00', '2024-11-29 09:15:00+00', 14, 22),
  
  -- Jade Faure: 3 livres (1 completed, 1 in_progress, 1 to_read)
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440010', 'marie-kondo-life-changing-magic', 224, 224, 'completed', '2024-08-03 13:40:00+00', '2024-09-15 16:10:00+00', 4, 10),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440010', 'francoise-sagan-bonjour-tristesse', 67, 128, 'in_progress', '2024-10-20 11:25:00+00', '2024-12-01 18:35:00+00', 4, 10),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440010', 'marguerite-duras-the-lover', 0, 117, 'to_read', '2024-11-15 15:00:00+00', '2024-11-15 15:00:00+00', 4, 10);

-- Continuer avec les utilisateurs 11-30 (format similaire)
-- Yasmine Benali, Karim Hamidi, Sofia Hadj, etc.

INSERT INTO public.reading_progress (
  id,
  user_id, 
  book_id, 
  current_page, 
  total_pages, 
  status, 
  started_at, 
  updated_at,
  streak_current,
  streak_best
) VALUES 
  -- Yasmine Benali: 6 livres
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440011', 'paulo-coelho-alchemist', 208, 208, 'completed', '2024-08-07 10:15:00+00', '2024-09-10 15:30:00+00', 18, 24),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440011', 'khaled-hosseini-kite-runner', 372, 372, 'completed', '2024-09-12 14:20:00+00', '2024-10-20 19:45:00+00', 18, 24),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440011', 'chimamanda-adichie-purple-hibiscus', 307, 307, 'completed', '2024-10-22 11:00:00+00', '2024-11-18 17:25:00+00', 18, 24),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440011', 'tahar-ben-jelloun-sacred-night', 156, 230, 'in_progress', '2024-11-20 09:30:00+00', '2024-12-01 20:15:00+00', 18, 24),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440011', 'leila-slimani-lullaby', 89, 240, 'in_progress', '2024-11-25 15:45:00+00', '2024-12-01 18:50:00+00', 18, 24),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440011', 'amin-maalouf-rock-of-tanios', 0, 280, 'to_read', '2024-11-28 12:30:00+00', '2024-11-28 12:30:00+00', 18, 24),

  -- Karim Hamidi: 4 livres
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440012', 'nassim-taleb-black-swan', 366, 366, 'completed', '2024-08-12 17:25:00+00', '2024-10-05 21:10:00+00', 7, 13),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440012', 'daniel-kahneman-thinking-fast-slow', 289, 499, 'in_progress', '2024-10-08 13:40:00+00', '2024-12-01 19:30:00+00', 7, 13),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440012', 'malcolm-gladwell-outliers', 134, 309, 'in_progress', '2024-11-10 10:15:00+00', '2024-12-01 17:45:00+00', 7, 13),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440012', 'steven-pinker-enlightenment-now', 0, 576, 'to_read', '2024-11-22 14:00:00+00', '2024-11-22 14:00:00+00', 7, 13),

  -- Sofia Hadj: 5 livres
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440013', 'elif-shafak-forty-rules', 352, 352, 'completed', '2024-08-17 14:50:00+00', '2024-10-02 18:20:00+00', 11, 17),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440013', 'orhan-pamuk-my-name-is-red', 417, 417, 'completed', '2024-10-05 11:30:00+00', '2024-11-20 16:55:00+00', 11, 17),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440013', 'assia-djebar-fantasia', 178, 256, 'in_progress', '2024-11-22 09:45:00+00', '2024-12-01 20:30:00+00', 11, 17),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440013', 'yasmina-khadra-swallows-kabul', 67, 195, 'in_progress', '2024-11-27 14:20:00+00', '2024-12-01 18:10:00+00', 11, 17),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440013', 'naguib-mahfouz-cairo-trilogy', 0, 1312, 'to_read', '2024-11-30 10:00:00+00', '2024-11-30 10:00:00+00', 11, 17),

  -- Amine Cherif: 5 livres
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440014', 'albert-camus-the-plague', 308, 308, 'completed', '2024-08-22 09:30:00+00', '2024-10-10 15:45:00+00', 9, 15),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440014', 'jean-giono-man-planted-trees', 51, 51, 'completed', '2024-10-12 13:20:00+00', '2024-10-20 17:30:00+00', 9, 15),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440014', 'antoine-de-saint-exupery-little-prince', 96, 96, 'completed', '2024-10-22 11:00:00+00', '2024-11-05 14:25:00+00', 9, 15),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440014', 'kamel-daoud-meursault', 89, 160, 'in_progress', '2024-11-08 15:40:00+00', '2024-12-01 19:55:00+00', 9, 15),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440014', 'boualem-sansal-2084', 0, 288, 'to_read', '2024-11-25 12:15:00+00', '2024-11-25 12:15:00+00', 9, 15),

  -- Nadia Boucher: 7 livres
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440015', 'elizabeth-gilbert-eat-pray-love', 352, 352, 'completed', '2024-08-27 16:45:00+00', '2024-10-15 20:10:00+00', 16, 23),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440015', 'cheryl-strayed-wild', 315, 315, 'completed', '2024-10-18 10:30:00+00', '2024-11-12 18:45:00+00', 16, 23),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440015', 'rebecca-solnit-wanderlust', 326, 326, 'completed', '2024-11-14 14:20:00+00', '2024-11-30 19:35:00+00', 16, 23),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440015', 'annie-ernaux-years', 167, 232, 'in_progress', '2024-11-20 09:00:00+00', '2024-12-01 17:30:00+00', 16, 23),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440015', 'delphine-de-vigan-nothing-holds', 89, 304, 'in_progress', '2024-11-26 13:45:00+00', '2024-12-01 20:00:00+00', 16, 23),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440015', 'muriel-barbery-elegance-hedgehog', 0, 325, 'to_read', '2024-11-28 11:30:00+00', '2024-11-28 11:30:00+00', 16, 23),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440015', 'amelie-nothomb-fear-trembling', 0, 132, 'to_read', '2024-11-30 15:20:00+00', '2024-11-30 15:20:00+00', 16, 23);

-- Utilisateurs 16-30 avec lectures variées
INSERT INTO public.reading_progress (
  id,
  user_id, 
  book_id, 
  current_page, 
  total_pages, 
  status, 
  started_at, 
  updated_at,
  streak_current,
  streak_best
) VALUES 
  -- Mathis Leroy
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440016', 'isaac-asimov-foundation', 296, 296, 'completed', '2024-09-03 12:20:00+00', '2024-10-25 17:45:00+00', 5, 11),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440016', 'frank-herbert-dune', 412, 688, 'in_progress', '2024-10-28 10:00:00+00', '2024-12-01 19:20:00+00', 5, 11),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440016', 'arthur-clarke-2001', 0, 297, 'to_read', '2024-11-20 14:30:00+00', '2024-11-20 14:30:00+00', 5, 11),

  -- Louise Girard
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440017', 'hannah-arendt-human-condition', 349, 349, 'completed', '2024-09-07 08:35:00+00', '2024-11-02 15:50:00+00', 22, 30),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440017', 'simone-weil-gravity-grace', 212, 212, 'completed', '2024-11-04 11:20:00+00', '2024-11-25 18:15:00+00', 22, 30),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440017', 'judith-butler-gender-trouble', 189, 272, 'in_progress', '2024-11-27 09:45:00+00', '2024-12-01 20:40:00+00', 22, 30),

  -- Gabriel Fontaine
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440018', 'michel-foucault-discipline-punish', 333, 333, 'completed', '2024-09-12 15:40:00+00', '2024-11-08 19:25:00+00', 8, 14),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440018', 'gilles-deleuze-difference', 178, 403, 'in_progress', '2024-11-10 13:00:00+00', '2024-12-01 18:30:00+00', 8, 14),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440018', 'jacques-derrida-writing', 0, 352, 'to_read', '2024-11-28 10:15:00+00', '2024-11-28 10:15:00+00', 8, 14),

  -- Clara Perrin
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440019', 'agatha-christie-murder-orient', 274, 274, 'completed', '2024-09-17 11:55:00+00', '2024-10-28 16:40:00+00', 12, 19),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440019', 'arthur-conan-doyle-sherlock', 307, 307, 'completed', '2024-10-30 14:30:00+00', '2024-11-22 20:05:00+00', 12, 19),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440019', 'fred-vargas-wash-this-blood', 156, 320, 'in_progress', '2024-11-24 09:20:00+00', '2024-12-01 17:55:00+00', 12, 19),

  -- Maxime Duval
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440020', 'stephen-king-shining', 447, 447, 'completed', '2024-09-22 14:10:00+00', '2024-11-10 18:35:00+00', 6, 12),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440020', 'hp-lovecraft-call-cthulhu', 89, 145, 'in_progress', '2024-11-12 10:45:00+00', '2024-12-01 19:10:00+00', 6, 12),

  -- Sarah Nguyen
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440021', 'viet-thanh-nguyen-sympathizer', 382, 382, 'completed', '2024-09-27 10:25:00+00', '2024-11-15 15:20:00+00', 17, 25),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440021', 'ocean-vuong-earth-we-are', 256, 256, 'completed', '2024-11-17 12:40:00+00', '2024-11-30 19:55:00+00', 17, 25),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440021', 'anna-kim-anatomy', 134, 224, 'in_progress', '2024-11-28 08:30:00+00', '2024-12-01 20:25:00+00', 17, 25),

  -- Antoine Mercier
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440022', 'victor-hugo-notre-dame', 489, 489, 'completed', '2024-10-03 16:30:00+00', '2024-11-20 21:15:00+00', 10, 16),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440022', 'alexandre-dumas-monte-cristo', 567, 1276, 'in_progress', '2024-11-22 11:00:00+00', '2024-12-01 18:45:00+00', 10, 16),

  -- Juliette Blanc
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440023', 'jane-austen-emma', 474, 474, 'completed', '2024-10-07 13:15:00+00', '2024-11-25 17:40:00+00', 13, 20),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440023', 'louisa-may-alcott-little-women', 289, 759, 'in_progress', '2024-11-27 09:50:00+00', '2024-12-01 19:30:00+00', 13, 20),

  -- Romain Chevalier
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440024', 'jrr-tolkien-lord-rings', 1178, 1178, 'completed', '2024-10-12 09:50:00+00', '2024-11-28 20:30:00+00', 4, 9),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440024', 'george-rr-martin-game-thrones', 356, 835, 'in_progress', '2024-11-30 13:45:00+00', '2024-12-01 21:15:00+00', 4, 9),

  -- Camille Morin
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440025', 'haruki-murakami-norwegian-wood', 296, 296, 'completed', '2024-10-17 15:05:00+00', '2024-11-12 18:25:00+00', 19, 27),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440025', 'kazuo-ishiguro-remains-day', 258, 258, 'completed', '2024-11-14 10:20:00+00', '2024-11-29 16:50:00+00', 19, 27),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440025', 'banana-yoshimoto-kitchen', 78, 152, 'in_progress', '2024-11-30 14:30:00+00', '2024-12-01 20:05:00+00', 19, 27),

  -- Alexandre Petit
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440026', 'ernest-hemingway-old-man-sea', 127, 127, 'completed', '2024-10-22 12:40:00+00', '2024-11-05 15:15:00+00', 8, 13),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440026', 'john-steinbeck-mice-men', 107, 107, 'completed', '2024-11-07 09:30:00+00', '2024-11-18 14:45:00+00', 8, 13),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440026', 'jack-kerouac-on-road', 189, 320, 'in_progress', '2024-11-20 16:00:00+00', '2024-12-01 19:40:00+00', 8, 13),

  -- Marine Rousseau
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440027', 'sylvia-plath-bell-jar', 234, 234, 'completed', '2024-10-27 08:20:00+00', '2024-11-15 13:35:00+00', 14, 21),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440027', 'virginia-woolf-to-lighthouse', 209, 209, 'completed', '2024-11-17 11:45:00+00', '2024-11-30 17:20:00+00', 14, 21),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440027', 'toni-morrison-beloved', 156, 324, 'in_progress', '2024-11-28 15:10:00+00', '2024-12-01 20:50:00+00', 14, 21),

  -- Paul Fournier
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440028', 'albert-camus-myth-sisyphus', 138, 138, 'completed', '2024-11-03 14:35:00+00', '2024-11-20 18:10:00+00', 9, 15),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440028', 'friedrich-nietzsche-thus-spoke', 267, 352, 'in_progress', '2024-11-22 10:25:00+00', '2024-12-01 19:15:00+00', 9, 15),

  -- Alice Lefevre
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440029', 'george-eliot-middlemarch', 880, 880, 'completed', '2024-11-07 11:45:00+00', '2024-11-28 21:30:00+00', 15, 22),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440029', 'henry-james-portrait-lady', 378, 656, 'in_progress', '2024-11-30 09:00:00+00', '2024-12-01 18:20:00+00', 15, 22),

  -- Victor Martinez
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440030', 'gabriel-garcia-marquez-cholera', 348, 348, 'completed', '2024-11-12 17:00:00+00', '2024-11-30 20:45:00+00', 5, 10),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440030', 'isabel-allende-house-spirits', 189, 433, 'in_progress', '2024-11-28 13:30:00+00', '2024-12-01 21:00:00+00', 5, 10);

-- =====================================================
-- 4. VALIDATIONS DE LECTURE (pour les livres complétés)
-- =====================================================

INSERT INTO public.reading_validations (
  user_id,
  book_id,
  progress_id,
  segment,
  validated_at,
  correct,
  used_joker
)
SELECT 
  rp.user_id,
  rp.book_id,
  rp.id as progress_id,
  generate_series(1, 10) as segment,
  rp.updated_at - (random() * interval '30 days') as validated_at,
  true as correct,
  false as used_joker
FROM public.reading_progress rp
WHERE rp.status = 'completed'
  AND rp.user_id IN (
    SELECT id FROM (
      VALUES 
        ('550e8400-e29b-41d4-a716-446655440001'::uuid),
        ('550e8400-e29b-41d4-a716-446655440002'::uuid),
        ('550e8400-e29b-41d4-a716-446655440003'::uuid),
        ('550e8400-e29b-41d4-a716-446655440004'::uuid),
        ('550e8400-e29b-41d4-a716-446655440005'::uuid)
    ) AS t(id)
  );

-- =====================================================
-- 5. BADGES UTILISATEURS
-- =====================================================

INSERT INTO public.user_badges (user_id, badge_id, earned_at)
SELECT 
  u.id as user_id,
  b.id as badge_id,
  NOW() - (random() * interval '90 days') as earned_at
FROM (
  VALUES 
    ('550e8400-e29b-41d4-a716-446655440001'::uuid),
    ('550e8400-e29b-41d4-a716-446655440002'::uuid),
    ('550e8400-e29b-41d4-a716-446655440004'::uuid),
    ('550e8400-e29b-41d4-a716-446655440007'::uuid),
    ('550e8400-e29b-41d4-a716-446655440011'::uuid),
    ('550e8400-e29b-41d4-a716-446655440015'::uuid),
    ('550e8400-e29b-41d4-a716-446655440017'::uuid),
    ('550e8400-e29b-41d4-a716-446655440021'::uuid),
    ('550e8400-e29b-41d4-a716-446655440025'::uuid),
    ('550e8400-e29b-41d4-a716-446655440029'::uuid)
) AS u(id)
CROSS JOIN (
  SELECT id FROM public.badges ORDER BY random() LIMIT 3
) AS b
ON CONFLICT DO NOTHING;

-- =====================================================
-- 6. BADGES FAVORIS
-- =====================================================

INSERT INTO public.user_favorite_badges (user_id, badge_id, created_at)
SELECT 
  ub.user_id,
  ub.badge_id::text,
  NOW()
FROM public.user_badges ub
WHERE ub.user_id IN (
  SELECT id FROM (
    VALUES 
      ('550e8400-e29b-41d4-a716-446655440001'::uuid),
      ('550e8400-e29b-41d4-a716-446655440004'::uuid),
      ('550e8400-e29b-41d4-a716-446655440007'::uuid),
      ('550e8400-e29b-41d4-a716-446655440011'::uuid),
      ('550e8400-e29b-41d4-a716-446655440015'::uuid)
  ) AS t(id)
)
ORDER BY random()
LIMIT 10
ON CONFLICT DO NOTHING;

-- =====================================================
-- 7. LIVRES FAVORIS
-- =====================================================

INSERT INTO public.user_favorite_books (user_id, book_title, position, added_at)
VALUES
  ('550e8400-e29b-41d4-a716-446655440001', '1984', 1, NOW() - interval '30 days'),
  ('550e8400-e29b-41d4-a716-446655440001', 'Le Meilleur des mondes', 2, NOW() - interval '25 days'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Fahrenheit 451', 1, NOW() - interval '20 days'),
  ('550e8400-e29b-41d4-a716-446655440004', 'Crime et Châtiment', 1, NOW() - interval '15 days'),
  ('550e8400-e29b-41d4-a716-446655440004', 'Les 48 lois du pouvoir', 2, NOW() - interval '10 days'),
  ('550e8400-e29b-41d4-a716-446655440007', 'Atomic Habits', 1, NOW() - interval '8 days'),
  ('550e8400-e29b-41d4-a716-446655440007', 'L''Art de la guerre', 2, NOW() - interval '5 days'),
  ('550e8400-e29b-41d4-a716-446655440011', 'L''Alchimiste', 1, NOW() - interval '12 days'),
  ('550e8400-e29b-41d4-a716-446655440015', 'Mange, prie, aime', 1, NOW() - interval '18 days'),
  ('550e8400-e29b-41d4-a716-446655440017', 'Condition de l''homme moderne', 1, NOW() - interval '7 days'),
  ('550e8400-e29b-41d4-a716-446655440021', 'Le Sympathisant', 1, NOW() - interval '3 days'),
  ('550e8400-e29b-41d4-a716-446655440025', 'Norwegian Wood', 1, NOW() - interval '6 days');

-- =====================================================
-- 8. RELATIONS SOCIALES (Followers)
-- =====================================================

-- Créer des relations entre utilisateurs (environ 150 relations)
INSERT INTO public.followers (follower_id, following_id, created_at)
SELECT 
  f.id as follower_id,
  t.id as following_id,
  NOW() - (random() * interval '60 days') as created_at
FROM (
  VALUES 
    ('550e8400-e29b-41d4-a716-446655440001'::uuid),
    ('550e8400-e29b-41d4-a716-446655440002'::uuid),
    ('550e8400-e29b-41d4-a716-446655440003'::uuid),
    ('550e8400-e29b-41d4-a716-446655440004'::uuid),
    ('550e8400-e29b-41d4-a716-446655440005'::uuid),
    ('550e8400-e29b-41d4-a716-446655440006'::uuid),
    ('550e8400-e29b-41d4-a716-446655440007'::uuid),
    ('550e8400-e29b-41d4-a716-446655440008'::uuid),
    ('550e8400-e29b-41d4-a716-446655440009'::uuid),
    ('550e8400-e29b-41d4-a716-446655440010'::uuid)
) AS f(id)
CROSS JOIN (
  VALUES 
    ('550e8400-e29b-41d4-a716-446655440011'::uuid),
    ('550e8400-e29b-41d4-a716-446655440012'::uuid),
    ('550e8400-e29b-41d4-a716-446655440013'::uuid),
    ('550e8400-e29b-41d4-a716-446655440014'::uuid),
    ('550e8400-e29b-41d4-a716-446655440015'::uuid)
) AS t(id)
WHERE f.id != t.id
ON CONFLICT DO NOTHING;

-- Ajouter des followers "influenceurs" (utilisateurs avec beaucoup de followers)
INSERT INTO public.followers (follower_id, following_id, created_at)
SELECT 
  u.id as follower_id,
  '550e8400-e29b-41d4-a716-446655440007'::uuid as following_id,
  NOW() - (random() * interval '45 days') as created_at
FROM (
  SELECT id FROM (
    VALUES 
      ('550e8400-e29b-41d4-a716-446655440016'::uuid),
      ('550e8400-e29b-41d4-a716-446655440017'::uuid),
      ('550e8400-e29b-41d4-a716-446655440018'::uuid),
      ('550e8400-e29b-41d4-a716-446655440019'::uuid),
      ('550e8400-e29b-41d4-a716-446655440020'::uuid),
      ('550e8400-e29b-41d4-a716-446655440021'::uuid),
      ('550e8400-e29b-41d4-a716-446655440022'::uuid),
      ('550e8400-e29b-41d4-a716-446655440023'::uuid),
      ('550e8400-e29b-41d4-a716-446655440024'::uuid),
      ('550e8400-e29b-41d4-a716-446655440025'::uuid),
      ('550e8400-e29b-41d4-a716-446655440026'::uuid),
      ('550e8400-e29b-41d4-a716-446655440027'::uuid),
      ('550e8400-e29b-41d4-a716-446655440028'::uuid),
      ('550e8400-e29b-41d4-a716-446655440029'::uuid),
      ('550e8400-e29b-41d4-a716-446655440030'::uuid)
  ) AS t(id)
) AS u
WHERE u.id != '550e8400-e29b-41d4-a716-446655440007'::uuid
ON CONFLICT DO NOTHING;

-- =====================================================
-- FIN DU SCRIPT
-- =====================================================

RESET ROLE;
COMMIT;
