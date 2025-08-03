-- Script de génération de 30 profils lecteurs complets
-- Utilisation: Migration pour créer des données de test

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
  ('550e8400-e29b-41d4-a716-446655440001', 'lecteur001@example.com', '$2a$10$dummy.hash.for.testing', '2024-06-15 10:00:00+00', '2024-06-15 10:00:00+00', '2024-06-15 10:00:00+00', '{}', 'authenticated', 'authenticated'),
  ('550e8400-e29b-41d4-a716-446655440002', 'lecteur002@example.com', '$2a$10$dummy.hash.for.testing', '2024-06-20 11:30:00+00', '2024-06-20 11:30:00+00', '2024-06-20 11:30:00+00', '{}', 'authenticated', 'authenticated'),
  ('550e8400-e29b-41d4-a716-446655440003', 'lecteur003@example.com', '$2a$10$dummy.hash.for.testing', '2024-06-25 14:15:00+00', '2024-06-25 14:15:00+00', '2024-06-25 14:15:00+00', '{}', 'authenticated', 'authenticated'),
  ('550e8400-e29b-41d4-a716-446655440004', 'lecteur004@example.com', '$2a$10$dummy.hash.for.testing', '2024-07-01 09:45:00+00', '2024-07-01 09:45:00+00', '2024-07-01 09:45:00+00', '{}', 'authenticated', 'authenticated'),
  ('550e8400-e29b-41d4-a716-446655440005', 'lecteur005@example.com', '$2a$10$dummy.hash.for.testing', '2024-07-05 16:20:00+00', '2024-07-05 16:20:00+00', '2024-07-05 16:20:00+00', '{}', 'authenticated', 'authenticated'),
  ('550e8400-e29b-41d4-a716-446655440006', 'lecteur006@example.com', '$2a$10$dummy.hash.for.testing', '2024-07-10 12:30:00+00', '2024-07-10 12:30:00+00', '2024-07-10 12:30:00+00', '{}', 'authenticated', 'authenticated'),
  ('550e8400-e29b-41d4-a716-446655440007', 'lecteur007@example.com', '$2a$10$dummy.hash.for.testing', '2024-07-15 08:45:00+00', '2024-07-15 08:45:00+00', '2024-07-15 08:45:00+00', '{}', 'authenticated', 'authenticated'),
  ('550e8400-e29b-41d4-a716-446655440008', 'lecteur008@example.com', '$2a$10$dummy.hash.for.testing', '2024-07-20 15:10:00+00', '2024-07-20 15:10:00+00', '2024-07-20 15:10:00+00', '{}', 'authenticated', 'authenticated'),
  ('550e8400-e29b-41d4-a716-446655440009', 'lecteur009@example.com', '$2a$10$dummy.hash.for.testing', '2024-07-25 11:20:00+00', '2024-07-25 11:20:00+00', '2024-07-25 11:20:00+00', '{}', 'authenticated', 'authenticated'),
  ('550e8400-e29b-41d4-a716-446655440010', 'lecteur010@example.com', '$2a$10$dummy.hash.for.testing', '2024-08-01 13:40:00+00', '2024-08-01 13:40:00+00', '2024-08-01 13:40:00+00', '{}', 'authenticated', 'authenticated'),
  ('550e8400-e29b-41d4-a716-446655440011', 'lecteur011@example.com', '$2a$10$dummy.hash.for.testing', '2024-08-05 10:15:00+00', '2024-08-05 10:15:00+00', '2024-08-05 10:15:00+00', '{}', 'authenticated', 'authenticated'),
  ('550e8400-e29b-41d4-a716-446655440012', 'lecteur012@example.com', '$2a$10$dummy.hash.for.testing', '2024-08-10 17:25:00+00', '2024-08-10 17:25:00+00', '2024-08-10 17:25:00+00', '{}', 'authenticated', 'authenticated'),
  ('550e8400-e29b-41d4-a716-446655440013', 'lecteur013@example.com', '$2a$10$dummy.hash.for.testing', '2024-08-15 14:50:00+00', '2024-08-15 14:50:00+00', '2024-08-15 14:50:00+00', '{}', 'authenticated', 'authenticated'),
  ('550e8400-e29b-41d4-a716-446655440014', 'lecteur014@example.com', '$2a$10$dummy.hash.for.testing', '2024-08-20 09:30:00+00', '2024-08-20 09:30:00+00', '2024-08-20 09:30:00+00', '{}', 'authenticated', 'authenticated'),
  ('550e8400-e29b-41d4-a716-446655440015', 'lecteur015@example.com', '$2a$10$dummy.hash.for.testing', '2024-08-25 16:45:00+00', '2024-08-25 16:45:00+00', '2024-08-25 16:45:00+00', '{}', 'authenticated', 'authenticated'),
  ('550e8400-e29b-41d4-a716-446655440016', 'lecteur016@example.com', '$2a$10$dummy.hash.for.testing', '2024-09-01 12:20:00+00', '2024-09-01 12:20:00+00', '2024-09-01 12:20:00+00', '{}', 'authenticated', 'authenticated'),
  ('550e8400-e29b-41d4-a716-446655440017', 'lecteur017@example.com', '$2a$10$dummy.hash.for.testing', '2024-09-05 08:35:00+00', '2024-09-05 08:35:00+00', '2024-09-05 08:35:00+00', '{}', 'authenticated', 'authenticated'),
  ('550e8400-e29b-41d4-a716-446655440018', 'lecteur018@example.com', '$2a$10$dummy.hash.for.testing', '2024-09-10 15:40:00+00', '2024-09-10 15:40:00+00', '2024-09-10 15:40:00+00', '{}', 'authenticated', 'authenticated'),
  ('550e8400-e29b-41d4-a716-446655440019', 'lecteur019@example.com', '$2a$10$dummy.hash.for.testing', '2024-09-15 11:55:00+00', '2024-09-15 11:55:00+00', '2024-09-15 11:55:00+00', '{}', 'authenticated', 'authenticated'),
  ('550e8400-e29b-41d4-a716-446655440020', 'lecteur020@example.com', '$2a$10$dummy.hash.for.testing', '2024-09-20 14:10:00+00', '2024-09-20 14:10:00+00', '2024-09-20 14:10:00+00', '{}', 'authenticated', 'authenticated'),
  ('550e8400-e29b-41d4-a716-446655440021', 'lecteur021@example.com', '$2a$10$dummy.hash.for.testing', '2024-09-25 10:25:00+00', '2024-09-25 10:25:00+00', '2024-09-25 10:25:00+00', '{}', 'authenticated', 'authenticated'),
  ('550e8400-e29b-41d4-a716-446655440022', 'lecteur022@example.com', '$2a$10$dummy.hash.for.testing', '2024-10-01 16:30:00+00', '2024-10-01 16:30:00+00', '2024-10-01 16:30:00+00', '{}', 'authenticated', 'authenticated'),
  ('550e8400-e29b-41d4-a716-446655440023', 'lecteur023@example.com', '$2a$10$dummy.hash.for.testing', '2024-10-05 13:15:00+00', '2024-10-05 13:15:00+00', '2024-10-05 13:15:00+00', '{}', 'authenticated', 'authenticated'),
  ('550e8400-e29b-41d4-a716-446655440024', 'lecteur024@example.com', '$2a$10$dummy.hash.for.testing', '2024-10-10 09:50:00+00', '2024-10-10 09:50:00+00', '2024-10-10 09:50:00+00', '{}', 'authenticated', 'authenticated'),
  ('550e8400-e29b-41d4-a716-446655440025', 'lecteur025@example.com', '$2a$10$dummy.hash.for.testing', '2024-10-15 15:05:00+00', '2024-10-15 15:05:00+00', '2024-10-15 15:05:00+00', '{}', 'authenticated', 'authenticated'),
  ('550e8400-e29b-41d4-a716-446655440026', 'lecteur026@example.com', '$2a$10$dummy.hash.for.testing', '2024-10-20 12:40:00+00', '2024-10-20 12:40:00+00', '2024-10-20 12:40:00+00', '{}', 'authenticated', 'authenticated'),
  ('550e8400-e29b-41d4-a716-446655440027', 'lecteur027@example.com', '$2a$10$dummy.hash.for.testing', '2024-10-25 08:20:00+00', '2024-10-25 08:20:00+00', '2024-10-25 08:20:00+00', '{}', 'authenticated', 'authenticated'),
  ('550e8400-e29b-41d4-a716-446655440028', 'lecteur028@example.com', '$2a$10$dummy.hash.for.testing', '2024-11-01 14:35:00+00', '2024-11-01 14:35:00+00', '2024-11-01 14:35:00+00', '{}', 'authenticated', 'authenticated'),
  ('550e8400-e29b-41d4-a716-446655440029', 'lecteur029@example.com', '$2a$10$dummy.hash.for.testing', '2024-11-05 11:45:00+00', '2024-11-05 11:45:00+00', '2024-11-05 11:45:00+00', '{}', 'authenticated', 'authenticated'),
  ('550e8400-e29b-41d4-a716-446655440030', 'lecteur030@example.com', '$2a$10$dummy.hash.for.testing', '2024-11-10 17:00:00+00', '2024-11-10 17:00:00+00', '2024-11-10 17:00:00+00', '{}', 'authenticated', 'authenticated')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (
  id, 
  username, 
  email, 
  avatar_url, 
  is_admin, 
  created_at, 
  updated_at
) VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'lecteur001', 'lecteur001@example.com', 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b', false, '2024-06-15 10:00:00+00', '2024-06-15 10:00:00+00'),
  ('550e8400-e29b-41d4-a716-446655440002', 'lecteur002', 'lecteur002@example.com', 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158', false, '2024-06-20 11:30:00+00', '2024-06-20 11:30:00+00'),
  ('550e8400-e29b-41d4-a716-446655440003', 'lecteur003', 'lecteur003@example.com', 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e', false, '2024-06-25 14:15:00+00', '2024-06-25 14:15:00+00'),
  ('550e8400-e29b-41d4-a716-446655440004', 'lecteur004', 'lecteur004@example.com', 'https://images.unsplash.com/photo-1531297484001-80022131f5a1', false, '2024-07-01 09:45:00+00', '2024-07-01 09:45:00+00'),
  ('550e8400-e29b-41d4-a716-446655440005', 'lecteur005', 'lecteur005@example.com', 'https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b', false, '2024-07-05 16:20:00+00', '2024-07-05 16:20:00+00'),
  ('550e8400-e29b-41d4-a716-446655440006', 'lecteur006', 'lecteur006@example.com', 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b', false, '2024-07-10 12:30:00+00', '2024-07-10 12:30:00+00'),
  ('550e8400-e29b-41d4-a716-446655440007', 'lecteur007', 'lecteur007@example.com', 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158', false, '2024-07-15 08:45:00+00', '2024-07-15 08:45:00+00'),
  ('550e8400-e29b-41d4-a716-446655440008', 'lecteur008', 'lecteur008@example.com', 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e', false, '2024-07-20 15:10:00+00', '2024-07-20 15:10:00+00'),
  ('550e8400-e29b-41d4-a716-446655440009', 'lecteur009', 'lecteur009@example.com', 'https://images.unsplash.com/photo-1531297484001-80022131f5a1', false, '2024-07-25 11:20:00+00', '2024-07-25 11:20:00+00'),
  ('550e8400-e29b-41d4-a716-446655440010', 'lecteur010', 'lecteur010@example.com', 'https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b', false, '2024-08-01 13:40:00+00', '2024-08-01 13:40:00+00'),
  ('550e8400-e29b-41d4-a716-446655440011', 'lecteur011', 'lecteur011@example.com', 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b', false, '2024-08-05 10:15:00+00', '2024-08-05 10:15:00+00'),
  ('550e8400-e29b-41d4-a716-446655440012', 'lecteur012', 'lecteur012@example.com', 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158', false, '2024-08-10 17:25:00+00', '2024-08-10 17:25:00+00'),
  ('550e8400-e29b-41d4-a716-446655440013', 'lecteur013', 'lecteur013@example.com', 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e', false, '2024-08-15 14:50:00+00', '2024-08-15 14:50:00+00'),
  ('550e8400-e29b-41d4-a716-446655440014', 'lecteur014', 'lecteur014@example.com', 'https://images.unsplash.com/photo-1531297484001-80022131f5a1', false, '2024-08-20 09:30:00+00', '2024-08-20 09:30:00+00'),
  ('550e8400-e29b-41d4-a716-446655440015', 'lecteur015', 'lecteur015@example.com', 'https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b', false, '2024-08-25 16:45:00+00', '2024-08-25 16:45:00+00'),
  ('550e8400-e29b-41d4-a716-446655440016', 'lecteur016', 'lecteur016@example.com', 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b', false, '2024-09-01 12:20:00+00', '2024-09-01 12:20:00+00'),
  ('550e8400-e29b-41d4-a716-446655440017', 'lecteur017', 'lecteur017@example.com', 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158', false, '2024-09-05 08:35:00+00', '2024-09-05 08:35:00+00'),
  ('550e8400-e29b-41d4-a716-446655440018', 'lecteur018', 'lecteur018@example.com', 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e', false, '2024-09-10 15:40:00+00', '2024-09-10 15:40:00+00'),
  ('550e8400-e29b-41d4-a716-446655440019', 'lecteur019', 'lecteur019@example.com', 'https://images.unsplash.com/photo-1531297484001-80022131f5a1', false, '2024-09-15 11:55:00+00', '2024-09-15 11:55:00+00'),
  ('550e8400-e29b-41d4-a716-446655440020', 'lecteur020', 'lecteur020@example.com', 'https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b', false, '2024-09-20 14:10:00+00', '2024-09-20 14:10:00+00'),
  ('550e8400-e29b-41d4-a716-446655440021', 'lecteur021', 'lecteur021@example.com', 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b', false, '2024-09-25 10:25:00+00', '2024-09-25 10:25:00+00'),
  ('550e8400-e29b-41d4-a716-446655440022', 'lecteur022', 'lecteur022@example.com', 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158', false, '2024-10-01 16:30:00+00', '2024-10-01 16:30:00+00'),
  ('550e8400-e29b-41d4-a716-446655440023', 'lecteur023', 'lecteur023@example.com', 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e', false, '2024-10-05 13:15:00+00', '2024-10-05 13:15:00+00'),
  ('550e8400-e29b-41d4-a716-446655440024', 'lecteur024', 'lecteur024@example.com', 'https://images.unsplash.com/photo-1531297484001-80022131f5a1', false, '2024-10-10 09:50:00+00', '2024-10-10 09:50:00+00'),
  ('550e8400-e29b-41d4-a716-446655440025', 'lecteur025', 'lecteur025@example.com', 'https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b', false, '2024-10-15 15:05:00+00', '2024-10-15 15:05:00+00'),
  ('550e8400-e29b-41d4-a716-446655440026', 'lecteur026', 'lecteur026@example.com', 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b', false, '2024-10-20 12:40:00+00', '2024-10-20 12:40:00+00'),
  ('550e8400-e29b-41d4-a716-446655440027', 'lecteur027', 'lecteur027@example.com', 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158', false, '2024-10-25 08:20:00+00', '2024-10-25 08:20:00+00'),
  ('550e8400-e29b-41d4-a716-446655440028', 'lecteur028', 'lecteur028@example.com', 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e', false, '2024-11-01 14:35:00+00', '2024-11-01 14:35:00+00'),
  ('550e8400-e29b-41d4-a716-446655440029', 'lecteur029', 'lecteur029@example.com', 'https://images.unsplash.com/photo-1531297484001-80022131f5a1', false, '2024-11-05 11:45:00+00', '2024-11-05 11:45:00+00'),
  ('550e8400-e29b-41d4-a716-446655440030', 'lecteur030', 'lecteur030@example.com', 'https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b', false, '2024-11-10 17:00:00+00', '2024-11-10 17:00:00+00')
ON CONFLICT (id) DO NOTHING;