
import { supabase } from "@/integrations/supabase/client";

export type DiscoverFeedItem = {
  actor_id: string;
  actor_name: string;
  avatar_url: string;
  kind: 'finished' | 'badge';
  book_id?: string;
  payload_title: string;
  ts: string;
};

export type DiscoverReader = {
  id: string;
  username: string;
  avatar_url: string;
  in_progress: number;
  badges: number;
  streak: number;
};

export type DiscoverStats = {
  readers: number;
  followers: number;
  following: number;
};

export type DiscoverData = {
  feed: DiscoverFeedItem[];
  readers: DiscoverReader[];
  stats: DiscoverStats;
};

export async function getDiscoverData(userId: string): Promise<DiscoverData> {
  const { data, error } = await supabase
    .rpc('discover_feed', { uid: userId, lim: 20 })
    .single();
    
  if (error) {
    console.error("Error fetching discover data:", error);
    throw error;
  }
  
  return data as DiscoverData;
}
