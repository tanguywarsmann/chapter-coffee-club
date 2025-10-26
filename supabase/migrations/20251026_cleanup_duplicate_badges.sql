-- ============================================================================
-- CLEANUP DUPLICATE BADGES
-- Removes old "general" category badges that duplicate the new categorized ones
-- ============================================================================

-- Delete old/duplicate badges from category='general'
-- These are replaced by the categorized badges (books, validations, streaks, etc.)
DELETE FROM public.badges
WHERE category = 'general'
AND slug IN (
  -- Old test badges
  'test-badge',
  'badge_test_insertion',

  -- Duplicates of categorized badges
  'first-book',           -- Replaced by 'premier-livre' (books)
  'first-segment',        -- Replaced by 'premiers-pas' (validations)
  'segments-5',           -- Replaced by validation badges
  'streak-3',             -- Replaced by 'constance' (streaks)
  'reading-streak-7',     -- Replaced by 'serie-7-jours' (streaks)
  'daily-30',             -- Replaced by regularity badges
  'classics-3',           -- Old variety badge
  'classics-10',          -- Old variety badge
  'night-reader',         -- Replaced by specific badges
  'night-advanced',       -- Replaced by specific badges
  'reviewer-5',           -- Old review badge
  'marathon-5h',          -- Old marathon badge
  'marathon-10',          -- Old marathon badge
  'globe-reader',         -- Replaced by 'explorateur' (variety)
  'polyglot',             -- Old polyglot badge
  'mentor',               -- Old mentor badge
  'poetry-5',             -- Old poetry badge
  'explorer-5'            -- Replaced by 'explorateur' (variety)
);

-- Verify we have exactly 25 categorized badges
-- Expected distribution:
-- - books: 6 badges (premier-livre, lecteur-debutant, lecteur-regulier, lecteur-passione, bibliothecaire, erudit)
-- - validations: 5 badges (premiers-pas, lecteur-assidu, marathonien, champion, legendaire)
-- - streaks: 5 badges (constance, serie-7-jours, serie-14-jours, serie-30-jours, serie-100-jours)
-- - pages: 4 badges (cent-pages, cinq-cents-pages, mille-pages, cinq-mille-pages)
-- - speed: 2 badges (lecteur-rapide, lecture-eclair)
-- - variety: 1 badge (explorateur)
-- - regularity: 1 badge (quotidien)
-- - special: 1 badge (pionnier)
-- TOTAL: 25 badges

-- Add comment explaining the cleanup
COMMENT ON TABLE public.badges IS 'All available badges in the system (25 categorized badges for natural progression - distinct from quests which are challenging events)';
