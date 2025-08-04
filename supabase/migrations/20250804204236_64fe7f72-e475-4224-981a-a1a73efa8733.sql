-- Migration finale complète avec données réalistes

BEGIN;
SET ROLE service_role;

-- Insérer tous les profils manquants
WITH new_profiles AS (
  INSERT INTO public.profiles (id, email, username, avatar_url, created_at, updated_at) VALUES
  -- lecteur001 à lecteur005 (principales)
  (gen_random_uuid(), 'lecteur001@test.com', 'lecteur001', 'https://example.com/avatar1.jpg', '2024-06-15 10:00:00', NOW()),
  (gen_random_uuid(), 'lecteur002@test.com', 'lecteur002', 'https://example.com/avatar2.jpg', '2024-06-20 12:30:00', NOW()),
  (gen_random_uuid(), 'lecteur003@test.com', 'lecteur003', 'https://example.com/avatar3.jpg', '2024-07-01 14:15:00', NOW()),
  (gen_random_uuid(), 'lecteur004@test.com', 'lecteur004', 'https://example.com/avatar4.jpg', '2024-06-10 08:00:00', NOW()),
  (gen_random_uuid(), 'lecteur005@test.com', 'lecteur005', 'https://example.com/avatar5.jpg', '2024-09-01 16:45:00', NOW()),
  
  -- lecteur006 à lecteur015
  (gen_random_uuid(), 'lecteur006@test.com', 'lecteur006', 'https://example.com/avatar1.jpg', '2024-07-01 10:00:00', NOW()),
  (gen_random_uuid(), 'lecteur007@test.com', 'lecteur007', 'https://example.com/avatar2.jpg', '2024-07-15 12:30:00', NOW()),
  (gen_random_uuid(), 'lecteur008@test.com', 'lecteur008', 'https://example.com/avatar3.jpg', '2024-08-01 14:15:00', NOW()),
  (gen_random_uuid(), 'lecteur009@test.com', 'lecteur009', 'https://example.com/avatar4.jpg', '2024-08-15 16:45:00', NOW()),
  (gen_random_uuid(), 'lecteur010@test.com', 'lecteur010', 'https://example.com/avatar5.jpg', '2024-09-01 09:30:00', NOW()),
  (gen_random_uuid(), 'lecteur011@test.com', 'lecteur011', 'https://example.com/avatar1.jpg', '2024-09-15 11:20:00', NOW()),
  (gen_random_uuid(), 'lecteur012@test.com', 'lecteur012', 'https://example.com/avatar2.jpg', '2024-10-01 13:45:00', NOW()),
  (gen_random_uuid(), 'lecteur013@test.com', 'lecteur013', 'https://example.com/avatar3.jpg', '2024-10-15 15:30:00', NOW()),
  (gen_random_uuid(), 'lecteur014@test.com', 'lecteur014', 'https://example.com/avatar4.jpg', '2024-11-01 17:15:00', NOW()),
  (gen_random_uuid(), 'lecteur015@test.com', 'lecteur015', 'https://example.com/avatar5.jpg', '2024-11-15 19:00:00', NOW()),
  
  -- lecteur016 à lecteur025
  (gen_random_uuid(), 'lecteur016@test.com', 'lecteur016', 'https://example.com/avatar1.jpg', '2024-12-01 08:45:00', NOW()),
  (gen_random_uuid(), 'lecteur017@test.com', 'lecteur017', 'https://example.com/avatar2.jpg', '2024-12-05 10:30:00', NOW()),
  (gen_random_uuid(), 'lecteur018@test.com', 'lecteur018', 'https://example.com/avatar3.jpg', '2024-12-10 12:15:00', NOW()),
  (gen_random_uuid(), 'lecteur019@test.com', 'lecteur019', 'https://example.com/avatar4.jpg', '2024-12-15 14:00:00', NOW()),
  (gen_random_uuid(), 'lecteur020@test.com', 'lecteur020', 'https://example.com/avatar5.jpg', '2024-12-20 15:45:00', NOW()),
  (gen_random_uuid(), 'lecteur021@test.com', 'lecteur021', 'https://example.com/avatar1.jpg', '2024-06-10 11:30:00', NOW()),
  (gen_random_uuid(), 'lecteur022@test.com', 'lecteur022', 'https://example.com/avatar2.jpg', '2024-06-25 13:15:00', NOW()),
  (gen_random_uuid(), 'lecteur023@test.com', 'lecteur023', 'https://example.com/avatar3.jpg', '2024-07-10 15:00:00', NOW()),
  (gen_random_uuid(), 'lecteur024@test.com', 'lecteur024', 'https://example.com/avatar4.jpg', '2024-07-25 16:45:00', NOW()),
  (gen_random_uuid(), 'lecteur025@test.com', 'lecteur025', 'https://example.com/avatar5.jpg', '2024-08-10 18:30:00', NOW()),
  
  -- lecteur026 à lecteur030
  (gen_random_uuid(), 'lecteur026@test.com', 'lecteur026', 'https://example.com/avatar1.jpg', '2024-08-25 20:15:00', NOW()),
  (gen_random_uuid(), 'lecteur027@test.com', 'lecteur027', 'https://example.com/avatar2.jpg', '2024-09-10 22:00:00', NOW()),
  (gen_random_uuid(), 'lecteur028@test.com', 'lecteur028', 'https://example.com/avatar3.jpg', '2024-09-25 08:30:00', NOW()),
  (gen_random_uuid(), 'lecteur029@test.com', 'lecteur029', 'https://example.com/avatar4.jpg', '2024-10-10 10:15:00', NOW()),
  (gen_random_uuid(), 'lecteur030@test.com', 'lecteur030', 'https://example.com/avatar5.jpg', '2024-10-25 12:00:00', NOW())
  RETURNING id, email
)
-- Insérer les user_levels
INSERT INTO public.user_levels (id, user_id, xp, level, last_updated)
SELECT 
  gen_random_uuid(),
  np.id,
  CASE 
    WHEN np.email = 'lecteur001@test.com' THEN 5500
    WHEN np.email = 'lecteur002@test.com' THEN 2800
    WHEN np.email = 'lecteur003@test.com' THEN 1950
    WHEN np.email = 'lecteur004@test.com' THEN 8000
    WHEN np.email = 'lecteur005@test.com' THEN 950
    WHEN np.email = 'lecteur006@test.com' THEN 1250
    WHEN np.email = 'lecteur007@test.com' THEN 2100
    WHEN np.email = 'lecteur008@test.com' THEN 750
    WHEN np.email = 'lecteur009@test.com' THEN 3200
    WHEN np.email = 'lecteur010@test.com' THEN 1850
    WHEN np.email = 'lecteur011@test.com' THEN 950
    WHEN np.email = 'lecteur012@test.com' THEN 4500
    WHEN np.email = 'lecteur013@test.com' THEN 1450
    WHEN np.email = 'lecteur014@test.com' THEN 2750
    WHEN np.email = 'lecteur015@test.com' THEN 650
    WHEN np.email = 'lecteur016@test.com' THEN 3800
    WHEN np.email = 'lecteur017@test.com' THEN 1200
    WHEN np.email = 'lecteur018@test.com' THEN 5200
    WHEN np.email = 'lecteur019@test.com' THEN 850
    WHEN np.email = 'lecteur020@test.com' THEN 2950
    WHEN np.email = 'lecteur021@test.com' THEN 1750
    WHEN np.email = 'lecteur022@test.com' THEN 7500
    WHEN np.email = 'lecteur023@test.com' THEN 550
    WHEN np.email = 'lecteur024@test.com' THEN 4200
    WHEN np.email = 'lecteur025@test.com' THEN 1350
    WHEN np.email = 'lecteur026@test.com' THEN 2450
    WHEN np.email = 'lecteur027@test.com' THEN 3650
    WHEN np.email = 'lecteur028@test.com' THEN 900
    WHEN np.email = 'lecteur029@test.com' THEN 6200
    WHEN np.email = 'lecteur030@test.com' THEN 1650
    ELSE 500
  END AS xp,
  CASE 
    WHEN np.email = 'lecteur001@test.com' THEN 7
    WHEN np.email = 'lecteur002@test.com' THEN 5
    WHEN np.email = 'lecteur003@test.com' THEN 4
    WHEN np.email = 'lecteur004@test.com' THEN 8
    WHEN np.email = 'lecteur005@test.com' THEN 2
    WHEN np.email IN ('lecteur006@test.com', 'lecteur008@test.com', 'lecteur011@test.com', 'lecteur015@test.com', 'lecteur019@test.com', 'lecteur023@test.com', 'lecteur028@test.com') THEN 2
    WHEN np.email IN ('lecteur007@test.com', 'lecteur010@test.com', 'lecteur013@test.com', 'lecteur017@test.com', 'lecteur021@test.com', 'lecteur025@test.com', 'lecteur026@test.com', 'lecteur030@test.com') THEN 3
    WHEN np.email IN ('lecteur009@test.com', 'lecteur014@test.com', 'lecteur020@test.com') THEN 5
    WHEN np.email IN ('lecteur012@test.com', 'lecteur016@test.com', 'lecteur024@test.com', 'lecteur027@test.com') THEN 6
    WHEN np.email IN ('lecteur018@test.com', 'lecteur022@test.com', 'lecteur029@test.com') THEN 7
    ELSE 1
  END AS level,
  NOW()
FROM new_profiles np;

RESET ROLE;
COMMIT;