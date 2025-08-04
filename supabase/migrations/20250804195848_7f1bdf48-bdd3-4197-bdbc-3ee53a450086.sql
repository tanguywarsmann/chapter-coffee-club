-- Créer tous les profils manquants (lecteur006 à lecteur030)

BEGIN;
SET ROLE service_role;

-- Créer les profils manquants dans public.profiles
INSERT INTO public.profiles (id, email, username, avatar_url, created_at, updated_at) VALUES
-- lecteur006 à lecteur010
('01931e3f-8b5b-7240-a198-1r5r3s6s5t6t', 'lecteur006@test.com', 'lecteur006', 'https://example.com/avatar1.jpg', '2024-07-01 10:00:00', NOW()),
('01931e3f-8b5b-7242-a19a-3t7t5u8u7v8v', 'lecteur007@test.com', 'lecteur007', 'https://example.com/avatar2.jpg', '2024-07-15 12:30:00', NOW()),
('01931e3f-8b5b-7244-a19c-5v9v7w0w9x0x', 'lecteur008@test.com', 'lecteur008', 'https://example.com/avatar3.jpg', '2024-08-01 14:15:00', NOW()),
('01931e3f-8b5b-7246-a19e-7x1x9y2y1z2z', 'lecteur009@test.com', 'lecteur009', 'https://example.com/avatar4.jpg', '2024-08-15 16:45:00', NOW()),
('01931e3f-8b5b-7248-a1a0-9z3z1a4a3b4b', 'lecteur010@test.com', 'lecteur010', 'https://example.com/avatar5.jpg', '2024-09-01 09:30:00', NOW()),

-- lecteur011 à lecteur015
('01931e3f-8b5b-724a-a1a2-1b5b3c6c5d6d', 'lecteur011@test.com', 'lecteur011', 'https://example.com/avatar1.jpg', '2024-09-15 11:20:00', NOW()),
('01931e3f-8b5b-724c-a1a4-3d7d5e8e7f8f', 'lecteur012@test.com', 'lecteur012', 'https://example.com/avatar2.jpg', '2024-10-01 13:45:00', NOW()),
('01931e3f-8b5b-724e-a1a6-5f9f7g0g9h0h', 'lecteur013@test.com', 'lecteur013', 'https://example.com/avatar3.jpg', '2024-10-15 15:30:00', NOW()),
('01931e3f-8b5b-7250-a1a8-7h1h9i2i1j2j', 'lecteur014@test.com', 'lecteur014', 'https://example.com/avatar4.jpg', '2024-11-01 17:15:00', NOW()),
('01931e3f-8b5b-7252-a1aa-9j3j1k4k3l4l', 'lecteur015@test.com', 'lecteur015', 'https://example.com/avatar5.jpg', '2024-11-15 19:00:00', NOW()),

-- lecteur016 à lecteur020
('01931e3f-8b5b-7254-a1ac-1l5l3m6m5n6n', 'lecteur016@test.com', 'lecteur016', 'https://example.com/avatar1.jpg', '2024-12-01 08:45:00', NOW()),
('01931e3f-8b5b-7256-a1ae-3n7n5o8o7p8p', 'lecteur017@test.com', 'lecteur017', 'https://example.com/avatar2.jpg', '2024-12-05 10:30:00', NOW()),
('01931e3f-8b5b-7258-a1b0-5p9p7q0q9r0r', 'lecteur018@test.com', 'lecteur018', 'https://example.com/avatar3.jpg', '2024-12-10 12:15:00', NOW()),
('01931e3f-8b5b-725a-a1b2-7r1r9s2s1t2t', 'lecteur019@test.com', 'lecteur019', 'https://example.com/avatar4.jpg', '2024-12-15 14:00:00', NOW()),
('01931e3f-8b5b-725c-a1b4-9t3t1u4u3v4v', 'lecteur020@test.com', 'lecteur020', 'https://example.com/avatar5.jpg', '2024-12-20 15:45:00', NOW()),

-- lecteur021 à lecteur025
('01931e3f-8b5b-725e-a1b6-1v5v3w6w5x6x', 'lecteur021@test.com', 'lecteur021', 'https://example.com/avatar1.jpg', '2024-06-10 11:30:00', NOW()),
('01931e3f-8b5b-7260-a1b8-3x7x5y8y7z8z', 'lecteur022@test.com', 'lecteur022', 'https://example.com/avatar2.jpg', '2024-06-25 13:15:00', NOW()),
('01931e3f-8b5b-7262-a1ba-5z9z7a0a9b0b', 'lecteur023@test.com', 'lecteur023', 'https://example.com/avatar3.jpg', '2024-07-10 15:00:00', NOW()),
('01931e3f-8b5b-7264-a1bc-7b1b9c2c1d2d', 'lecteur024@test.com', 'lecteur024', 'https://example.com/avatar4.jpg', '2024-07-25 16:45:00', NOW()),
('01931e3f-8b5b-7266-a1be-9d3d1e4e3f4f', 'lecteur025@test.com', 'lecteur025', 'https://example.com/avatar5.jpg', '2024-08-10 18:30:00', NOW()),

-- lecteur026 à lecteur030
('01931e3f-8b5b-7268-a1c0-1f5f3g6g5h6h', 'lecteur026@test.com', 'lecteur026', 'https://example.com/avatar1.jpg', '2024-08-25 20:15:00', NOW()),
('01931e3f-8b5b-726a-a1c2-3h7h5i8i7j8j', 'lecteur027@test.com', 'lecteur027', 'https://example.com/avatar2.jpg', '2024-09-10 22:00:00', NOW()),
('01931e3f-8b5b-726c-a1c4-5j9j7k0k9l0l', 'lecteur028@test.com', 'lecteur028', 'https://example.com/avatar3.jpg', '2024-09-25 08:30:00', NOW()),
('01931e3f-8b5b-726e-a1c6-7l1l9m2m1n2n', 'lecteur029@test.com', 'lecteur029', 'https://example.com/avatar4.jpg', '2024-10-10 10:15:00', NOW()),
('01931e3f-8b5b-7270-a1c8-9n3n1o4o3p4p', 'lecteur030@test.com', 'lecteur030', 'https://example.com/avatar5.jpg', '2024-10-25 12:00:00', NOW());

-- Créer user_levels pour tous les profils
INSERT INTO public.user_levels (id, user_id, xp, level, last_updated) VALUES
-- lecteur006 à lecteur010
(gen_random_uuid(), '01931e3f-8b5b-7240-a198-1r5r3s6s5t6t', 1250, 3, NOW()),
(gen_random_uuid(), '01931e3f-8b5b-7242-a19a-3t7t5u8u7v8v', 2100, 4, NOW()),
(gen_random_uuid(), '01931e3f-8b5b-7244-a19c-5v9v7w0w9x0x', 750, 2, NOW()),
(gen_random_uuid(), '01931e3f-8b5b-7246-a19e-7x1x9y2y1z2z', 3200, 5, NOW()),
(gen_random_uuid(), '01931e3f-8b5b-7248-a1a0-9z3z1a4a3b4b', 1850, 4, NOW()),

-- lecteur011 à lecteur015
(gen_random_uuid(), '01931e3f-8b5b-724a-a1a2-1b5b3c6c5d6d', 950, 2, NOW()),
(gen_random_uuid(), '01931e3f-8b5b-724c-a1a4-3d7d5e8e7f8f', 4500, 6, NOW()),
(gen_random_uuid(), '01931e3f-8b5b-724e-a1a6-5f9f7g0g9h0h', 1450, 3, NOW()),
(gen_random_uuid(), '01931e3f-8b5b-7250-a1a8-7h1h9i2i1j2j', 2750, 5, NOW()),
(gen_random_uuid(), '01931e3f-8b5b-7252-a1aa-9j3j1k4k3l4l', 650, 2, NOW()),

-- lecteur016 à lecteur020
(gen_random_uuid(), '01931e3f-8b5b-7254-a1ac-1l5l3m6m5n6n', 3800, 6, NOW()),
(gen_random_uuid(), '01931e3f-8b5b-7256-a1ae-3n7n5o8o7p8p', 1200, 3, NOW()),
(gen_random_uuid(), '01931e3f-8b5b-7258-a1b0-5p9p7q0q9r0r', 5200, 7, NOW()),
(gen_random_uuid(), '01931e3f-8b5b-725a-a1b2-7r1r9s2s1t2t', 850, 2, NOW()),
(gen_random_uuid(), '01931e3f-8b5b-725c-a1b4-9t3t1u4u3v4v', 2950, 5, NOW()),

-- lecteur021 à lecteur025
(gen_random_uuid(), '01931e3f-8b5b-725e-a1b6-1v5v3w6w5x6x', 1750, 4, NOW()),
(gen_random_uuid(), '01931e3f-8b5b-7260-a1b8-3x7x5y8y7z8z', 7500, 8, NOW()),
(gen_random_uuid(), '01931e3f-8b5b-7262-a1ba-5z9z7a0a9b0b', 550, 1, NOW()),
(gen_random_uuid(), '01931e3f-8b5b-7264-a1bc-7b1b9c2c1d2d', 4200, 6, NOW()),
(gen_random_uuid(), '01931e3f-8b5b-7266-a1be-9d3d1e4e3f4f', 1350, 3, NOW()),

-- lecteur026 à lecteur030
(gen_random_uuid(), '01931e3f-8b5b-7268-a1c0-1f5f3g6g5h6h', 2450, 4, NOW()),
(gen_random_uuid(), '01931e3f-8b5b-726a-a1c2-3h7h5i8i7j8j', 3650, 6, NOW()),
(gen_random_uuid(), '01931e3f-8b5b-726c-a1c4-5j9j7k0k9l0l', 900, 2, NOW()),
(gen_random_uuid(), '01931e3f-8b5b-726e-a1c6-7l1l9m2m1n2n', 6200, 7, NOW()),
(gen_random_uuid(), '01931e3f-8b5b-7270-a1c8-9n3n1o4o3p4p', 1650, 4, NOW());

RESET ROLE;
COMMIT;