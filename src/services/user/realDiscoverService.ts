
import { supabase } from "@/integrations/supabase/client";

export type DiscoverFeedItem = {
  actor_id: string;
  actor_name: string;
  avatar_url: string | null;
  kind: 'finished' | 'badge';
  book_id?: string;
  payload_title: string;
  ts: string;
  activity_id?: string;
  likes_count?: number;
  liked_by_me?: boolean;
};

export type DiscoverReader = {
  id: string;
  username: string;
  avatar_url: string | null;
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
  console.log("getDiscoverData called with userId:", userId);
  
  const { data, error } = await supabase
    .rpc('discover_feed', { uid: userId, lim: 20 })
    .single();
    
  console.log("Raw Supabase response:", { data, error });
    
  if (error) {
    console.error("Error fetching discover data:", error);
    throw error;
  }
  
  if (!data) {
    console.error("No data returned from discover_feed");
    throw new Error("No data returned from discover_feed");
  }

  // Cast to any pour éviter les erreurs TypeScript avec les types Supabase
  const rawData = data as any;

  // Vérifications défensives et logging
  console.log("Data structure:", {
    hasFeed: !!rawData.feed,
    hasReaders: !!rawData.readers,
    hasStats: !!rawData.stats,
    feedLength: rawData.feed?.length,
    readersLength: rawData.readers?.length
  });
  
  // Garder tous les lecteurs suggérés par la RPC (même sans livre en cours)
  const activeReaders = Array.isArray(rawData.readers) 
    ? rawData.readers
    : [];

  const result: DiscoverData = {
    feed: Array.isArray(rawData.feed) ? rawData.feed : [],
    readers: activeReaders,
    stats: rawData.stats || { readers: 0, followers: 0, following: 0 }
  };
  
  console.log("Final result:", result);
  return result;
}
