import { supabase } from "@/integrations/supabase/client";

export interface FeedbackSubmission {
  id: string;
  user_id: string;
  type: 'bug' | 'feature' | 'idea' | 'love' | 'suggestion' | 'question';
  title: string;
  description: string;
  category?: string;
  status: 'pending' | 'in_progress' | 'done' | 'rejected';
  is_anonymous: boolean;
  image_url?: string;
  votes_count: number;
  comments_count: number;
  points_awarded: number;
  created_at: string;
  updated_at: string;
  profiles?: {
    username: string;
    avatar_url: string;
  };
  has_voted?: boolean;
}

export interface CreateFeedbackData {
  type: 'bug' | 'feature' | 'idea' | 'love' | 'suggestion' | 'question';
  title: string;
  description: string;
  category?: string;
  is_anonymous?: boolean;
  image_url?: string;
}

export interface FeedbackFilters {
  type?: string;
  status?: string;
  sortBy?: 'recent' | 'votes' | 'comments';
}

export async function createFeedback(data: CreateFeedbackData): Promise<FeedbackSubmission> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data: result, error } = await supabase
    .from('feedback_submissions')
    .insert({
      type: data.type,
      title: data.title,
      description: data.description,
      category: data.category,
      is_anonymous: data.is_anonymous || false,
      image_url: data.image_url,
      user_id: user.id
    })
    .select(`
      *,
      profiles!inner(username, avatar_url)
    `)
    .single();

  if (error) throw error;
  return result as FeedbackSubmission;
}

export async function getFeedbacks(filters: FeedbackFilters = {}): Promise<FeedbackSubmission[]> {
  let query = supabase
    .from('feedback_submissions')
    .select(`
      *,
      profiles(username, avatar_url)
    `);

  if (filters.type) {
    query = query.eq('type', filters.type);
  }
  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  switch (filters.sortBy) {
    case 'votes':
      query = query.order('votes_count', { ascending: false });
      break;
    case 'comments':
      query = query.order('comments_count', { ascending: false });
      break;
    case 'recent':
    default:
      query = query.order('created_at', { ascending: false });
  }

  const { data, error } = await query;
  if (error) throw error;

  const { data: { user } } = await supabase.auth.getUser();
  if (user && data) {
    const feedbackIds = data.map(f => f.id);
    const { data: votes } = await supabase
      .from('feedback_votes')
      .select('feedback_id')
      .eq('user_id', user.id)
      .in('feedback_id', feedbackIds);

    const votedIds = new Set(votes?.map(v => v.feedback_id) || []);
    return data.map(f => ({
      ...f,
      has_voted: votedIds.has(f.id)
    })) as FeedbackSubmission[];
  }

  return (data || []) as FeedbackSubmission[];
}

export async function voteFeedback(feedbackId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('feedback_votes')
    .insert({
      feedback_id: feedbackId,
      user_id: user.id
    });

  if (error) {
    if (error.code === '23505') {
      await unvoteFeedback(feedbackId);
      return;
    }
    throw error;
  }
}

export async function unvoteFeedback(feedbackId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('feedback_votes')
    .delete()
    .match({ feedback_id: feedbackId, user_id: user.id });

  if (error) throw error;
}

export async function submitQuickRating(rating: number): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('feedback_quick_ratings')
    .insert({
      user_id: user.id,
      rating
    });

  if (error) throw error;
}

export async function getQuickRatingsStats() {
  const { data, error } = await supabase
    .from('feedback_quick_ratings')
    .select('rating');

  if (error) throw error;

  const stats = [0, 0, 0, 0, 0];
  data?.forEach(r => {
    if (r.rating >= 1 && r.rating <= 5) {
      stats[r.rating - 1]++;
    }
  });

  return stats;
}

export async function getUserPoints(userId: string) {
  const { data, error } = await supabase
    .from('user_feedback_points')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  
  return data || {
    total_points: 0,
    level: 1,
    badges: [],
    feedback_count: 0,
    votes_given_count: 0
  };
}

export async function getLeaderboard(limit: number = 10) {
  const { data, error } = await supabase
    .from('user_feedback_points')
    .select(`
      *,
      profiles!inner(username, avatar_url)
    `)
    .order('total_points', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}
