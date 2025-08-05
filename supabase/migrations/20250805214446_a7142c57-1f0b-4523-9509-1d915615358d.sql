-- Remplacer les noms génériques par des vrais noms français

BEGIN;
SET ROLE service_role;

-- Créer des noms français réalistes pour tous les profils
WITH realistic_names AS (
  SELECT 
    ROW_NUMBER() OVER (ORDER BY created_at) as rn,
    id,
    CASE ROW_NUMBER() OVER (ORDER BY created_at)
      WHEN 1 THEN 'Édouard Lange'
      WHEN 2 THEN 'Joséphine Pinaud'
      WHEN 3 THEN 'Matthieu Dubois'
      WHEN 4 THEN 'Camille Moreau'
      WHEN 5 THEN 'Aurélien Leroy'
      WHEN 6 THEN 'Élise Fournier'
      WHEN 7 THEN 'Théophile Martin'
      WHEN 8 THEN 'Margot Rousseau'
      WHEN 9 THEN 'Sébastien Mercier'
      WHEN 10 THEN 'Clémence Dupont'
      WHEN 11 THEN 'Maxime Girard'
      WHEN 12 THEN 'Apolline Roux'
      WHEN 13 THEN 'Valentin Morel'
      WHEN 14 THEN 'Héloïse Blanc'
      WHEN 15 THEN 'Raphaël Bernard'
      WHEN 16 THEN 'Océane Petit'
      WHEN 17 THEN 'Gaston Durand'
      WHEN 18 THEN 'Céleste Richard'
      WHEN 19 THEN 'Lucien Simon'
      WHEN 20 THEN 'Adèle Michel'
      WHEN 21 THEN 'Victor Lefebvre'
      WHEN 22 THEN 'Félicie Garcia'
      WHEN 23 THEN 'Anatole David'
      WHEN 24 THEN 'Constance Bertrand'
      WHEN 25 THEN 'Émile Robert'
      WHEN 26 THEN 'Léonie Thomas'
      WHEN 27 THEN 'Augustin Muller'
      WHEN 28 THEN 'Solène Lopez'
      WHEN 29 THEN 'Hippolyte Vincent'
      WHEN 30 THEN 'Eugénie Faure'
      WHEN 31 THEN 'Armand Bonnet'
      WHEN 32 THEN 'Agathe Chevalier'
      WHEN 33 THEN 'Rémi François'
      WHEN 34 THEN 'Blanche Legrand'
      WHEN 35 THEN 'Ferdinand Mathieu'
      WHEN 36 THEN 'Iris Clement'
      WHEN 37 THEN 'Honoré Lambert'
      WHEN 38 THEN 'Roxane Fontaine'
      WHEN 39 THEN 'Casimir Rey'
      WHEN 40 THEN 'Violette Garnier'
      WHEN 41 THEN 'Stanislas Boyer'
      WHEN 42 THEN 'Capucine Leclerc'
      WHEN 43 THEN 'Prosper Masson'
      WHEN 44 THEN 'Cordélia Robin'
      WHEN 45 THEN 'Firmin Barbier'
      WHEN 46 THEN 'Perrine Meyer'
      WHEN 47 THEN 'Dorian Gautier'
      WHEN 48 THEN 'Isaure Brun'
      WHEN 49 THEN 'Brice Perrin'
      WHEN 50 THEN 'Sidonie Perrot'
      WHEN 51 THEN 'Gaspard Colin'
      WHEN 52 THEN 'Hortense Morin'
      WHEN 53 THEN 'Ambroise Picard'
      WHEN 54 THEN 'Églantine Dumont'
      WHEN 55 THEN 'Côme André'
      WHEN 56 THEN 'Pénélope Marchand'
      WHEN 57 THEN 'Nestor Dufour'
      WHEN 58 THEN 'Aliénor Guillaume'
      WHEN 59 THEN 'Philibert Giraud'
      WHEN 60 THEN 'Olympe Lemaire'
      WHEN 61 THEN 'Marius Lacroix'
      WHEN 62 THEN 'Zélie Roussel'
      WHEN 63 THEN 'Achille Fabre'
      WHEN 64 THEN 'Hermione Delacroix'
      WHEN 65 THEN 'Cyprien Dupuis'
      WHEN 66 THEN 'Mélodie Lemoine'
      WHEN 67 THEN 'Faustin Lecomte'
      WHEN 68 THEN 'Séraphine Mercier'
      WHEN 69 THEN 'Timothée Vidal'
      WHEN 70 THEN 'Azalée Blanc'
      WHEN 71 THEN 'Barnabé Renard'
      WHEN 72 THEN 'Eudoxie Caron'
      WHEN 73 THEN 'Fernand Moreau'
      WHEN 74 THEN 'Célestine Girard'
      WHEN 75 THEN 'Balthazar Roche'
      WHEN 76 THEN 'Euphrasie Leroy'
      WHEN 77 THEN 'Firmin Muller'
      WHEN 78 THEN 'Cunégonde Rousseau'
      WHEN 79 THEN 'Apollinaire Dubois'
      WHEN 80 THEN 'Pétronille Martin'
      WHEN 81 THEN 'Clémentine Bernard'
      WHEN 82 THEN 'Léopold Simon'
      WHEN 83 THEN 'Prudence Michel'
      WHEN 84 THEN 'Isidore Garcia'
      WHEN 85 THEN 'Bérengère David'
      WHEN 86 THEN 'Léandre Thomas'
      WHEN 87 THEN 'Scholastique Robert'
      WHEN 88 THEN 'Amédée Richard'
      WHEN 89 THEN 'Bathilde Petit'
      WHEN 90 THEN 'Polycarpe Durand'
      ELSE 'Utilisateur ' || ROW_NUMBER() OVER (ORDER BY created_at)
    END as new_username
  FROM public.profiles
)
UPDATE public.profiles 
SET username = rn.new_username
FROM realistic_names rn
WHERE profiles.id = rn.id;

RESET ROLE;
COMMIT;