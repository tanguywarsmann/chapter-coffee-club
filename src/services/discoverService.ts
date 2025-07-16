import { supabase } from "@/integrations/supabase/client";

export interface ActivityFeedItem {
  actor_id: string;
  actor_name: string;
  actor_avatar: string;
  kind: string;
  payload_id: string;
  payload_title: string;
  posted_at: string;
}

export interface SuggestedReader {
  id: string;
  username: string;
  avatar_url?: string;
}

export async function getActivityFeed(userId: string, limit = 20): Promise<ActivityFeedItem[]> {
  const { data, error } = await supabase
    .rpc('get_activity_feed', { uid: userId, lim: limit });
  
  if (error) {
    console.error('Error fetching activity feed:', error);
    throw error;
  }
  
  return data || [];
}

export async function getSuggestedReaders(userId: string, limit = 5): Promise<SuggestedReader[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username')
    .neq('id', userId)
    .not('username', 'is', null)
    .limit(limit);

  if (error) {
    console.error('Error fetching suggested readers:', error);
    throw error;
  }

  return data || [];
}

export async function followUser(followerId: string, followingId: string) {
  const { error } = await supabase
    .from('followers')
    .insert({ follower_id: followerId, following_id: followingId });

  if (error) {
    console.error('Error following user:', error);
    throw error;
  }
}