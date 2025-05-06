
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTotalPagesRead, getBooksReadCount } from "@/services/reading/statsService";
import { BookOpen, Award } from "lucide-react";
import { getFollowerCounts } from "@/services/user/profileService";

interface PublicUserStatsProps {
  userId: string;
}

export function PublicUserStats({ userId }: PublicUserStatsProps) {
  const [stats, setStats] = useState({
    booksRead: 0,
    totalPages: 0,
    followers: 0,
    following: 0,
  });

  useEffect(() => {
    if (!userId) return;

    async function fetchStats() {
      const [booksRead, totalPages, followerCounts] = await Promise.all([
        getBooksReadCount(userId),
        getTotalPagesRead(userId),
        getFollowerCounts(userId)
      ]);
      
      setStats({
        booksRead,
        totalPages,
        followers: followerCounts.followers,
        following: followerCounts.following
      });
    }
    
    fetchStats();
  }, [userId]);

  return (
    <Card className="border-coffee-light">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-serif text-coffee-darker">Statistiques générales</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="flex flex-col space-y-1">
            <span className="text-sm text-muted-foreground">Livres terminés</span>
            <div className="flex items-center">
              <BookOpen className="h-4 w-4 mr-1 text-coffee-dark" />
              <span className="text-2xl font-medium text-coffee-darker">{stats.booksRead}</span>
            </div>
          </div>
          <div className="flex flex-col space-y-1">
            <span className="text-sm text-muted-foreground">Pages lues</span>
            <span className="text-2xl font-medium text-coffee-darker">{stats.totalPages}</span>
          </div>
          <div className="flex flex-col space-y-1">
            <span className="text-sm text-muted-foreground">Abonnés</span>
            <span className="text-2xl font-medium text-coffee-darker">{stats.followers}</span>
          </div>
          <div className="flex flex-col space-y-1">
            <span className="text-sm text-muted-foreground">Abonnements</span>
            <span className="text-2xl font-medium text-coffee-darker">{stats.following}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
