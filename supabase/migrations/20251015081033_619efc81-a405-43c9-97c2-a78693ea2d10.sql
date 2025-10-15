-- Table principale des feedbacks
CREATE TABLE IF NOT EXISTS feedback_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('bug', 'feature', 'idea', 'love', 'suggestion', 'question')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'done', 'rejected')),
  is_anonymous BOOLEAN DEFAULT false,
  image_url TEXT,
  votes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  points_awarded INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_feedback_status ON feedback_submissions(status);
CREATE INDEX idx_feedback_type ON feedback_submissions(type);
CREATE INDEX idx_feedback_votes ON feedback_submissions(votes_count DESC);
CREATE INDEX idx_feedback_created ON feedback_submissions(created_at DESC);

-- Table des votes
CREATE TABLE IF NOT EXISTS feedback_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_id UUID REFERENCES feedback_submissions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(feedback_id, user_id)
);

CREATE INDEX idx_feedback_votes_feedback ON feedback_votes(feedback_id);
CREATE INDEX idx_feedback_votes_user ON feedback_votes(user_id);

-- Table des commentaires
CREATE TABLE IF NOT EXISTS feedback_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_id UUID REFERENCES feedback_submissions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_feedback_comments_feedback ON feedback_comments(feedback_id);

-- Table des points utilisateur (gamification)
CREATE TABLE IF NOT EXISTS user_feedback_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  total_points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  badges JSONB DEFAULT '[]'::jsonb,
  last_feedback_at TIMESTAMPTZ,
  feedback_count INTEGER DEFAULT 0,
  votes_given_count INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_feedback_points_user ON user_feedback_points(user_id);
CREATE INDEX idx_user_feedback_points_leaderboard ON user_feedback_points(total_points DESC);

-- Table des quick ratings
CREATE TABLE IF NOT EXISTS feedback_quick_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_quick_ratings_created ON feedback_quick_ratings(created_at DESC);

-- RLS Policies
ALTER TABLE feedback_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_feedback_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_quick_ratings ENABLE ROW LEVEL SECURITY;

-- feedback_submissions policies
CREATE POLICY "Anyone can read feedbacks" ON feedback_submissions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create feedbacks" ON feedback_submissions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own feedbacks" ON feedback_submissions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can update any feedback" ON feedback_submissions FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
);

-- feedback_votes policies
CREATE POLICY "Anyone can read votes" ON feedback_votes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can vote" ON feedback_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own votes" ON feedback_votes FOR DELETE USING (auth.uid() = user_id);

-- feedback_comments policies
CREATE POLICY "Anyone can read comments" ON feedback_comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create comments" ON feedback_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own comments" ON feedback_comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own comments" ON feedback_comments FOR DELETE USING (auth.uid() = user_id);

-- user_feedback_points policies
CREATE POLICY "Anyone can read points" ON user_feedback_points FOR SELECT USING (true);
CREATE POLICY "System can manage points" ON user_feedback_points FOR ALL USING (true);

-- feedback_quick_ratings policies
CREATE POLICY "Anyone can read ratings stats" ON feedback_quick_ratings FOR SELECT USING (true);
CREATE POLICY "Authenticated users can rate" ON feedback_quick_ratings FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Fonction pour incrémenter votes_count
CREATE OR REPLACE FUNCTION increment_feedback_votes()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE feedback_submissions 
  SET votes_count = votes_count + 1,
      updated_at = NOW()
  WHERE id = NEW.feedback_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_feedback_vote_insert
AFTER INSERT ON feedback_votes
FOR EACH ROW EXECUTE FUNCTION increment_feedback_votes();

-- Fonction pour décrémenter votes_count
CREATE OR REPLACE FUNCTION decrement_feedback_votes()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE feedback_submissions 
  SET votes_count = votes_count - 1,
      updated_at = NOW()
  WHERE id = OLD.feedback_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_feedback_vote_delete
AFTER DELETE ON feedback_votes
FOR EACH ROW EXECUTE FUNCTION decrement_feedback_votes();

-- Fonction pour mettre à jour comments_count
CREATE OR REPLACE FUNCTION update_feedback_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE feedback_submissions 
  SET comments_count = (
    SELECT COUNT(*) FROM feedback_comments WHERE feedback_id = COALESCE(NEW.feedback_id, OLD.feedback_id)
  ),
  updated_at = NOW()
  WHERE id = COALESCE(NEW.feedback_id, OLD.feedback_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_feedback_comment_change
AFTER INSERT OR DELETE ON feedback_comments
FOR EACH ROW EXECUTE FUNCTION update_feedback_comments_count();

-- Fonction pour attribuer des points automatiquement
CREATE OR REPLACE FUNCTION award_feedback_points()
RETURNS TRIGGER AS $$
DECLARE
  points_to_award INTEGER;
BEGIN
  points_to_award := CASE NEW.type
    WHEN 'bug' THEN 10
    WHEN 'feature' THEN 15
    WHEN 'idea' THEN 20
    WHEN 'love' THEN 10
    WHEN 'suggestion' THEN 15
    WHEN 'question' THEN 5
    ELSE 5
  END;

  UPDATE feedback_submissions SET points_awarded = points_to_award WHERE id = NEW.id;

  INSERT INTO user_feedback_points (user_id, total_points, feedback_count, last_feedback_at)
  VALUES (NEW.user_id, points_to_award, 1, NOW())
  ON CONFLICT (user_id) DO UPDATE SET
    total_points = user_feedback_points.total_points + points_to_award,
    feedback_count = user_feedback_points.feedback_count + 1,
    last_feedback_at = NOW(),
    level = CASE 
      WHEN user_feedback_points.total_points + points_to_award >= 1000 THEN 5
      WHEN user_feedback_points.total_points + points_to_award >= 500 THEN 4
      WHEN user_feedback_points.total_points + points_to_award >= 200 THEN 3
      WHEN user_feedback_points.total_points + points_to_award >= 50 THEN 2
      ELSE 1
    END,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_feedback_submission_insert
AFTER INSERT ON feedback_submissions
FOR EACH ROW EXECUTE FUNCTION award_feedback_points();