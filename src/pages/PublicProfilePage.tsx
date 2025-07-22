
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AppHeader } from "@/components/layout/AppHeader";
import { getUserProfile } from "@/services/user/userProfileService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PublicUserStats } from "@/components/profile/PublicUserStats";
import { PublicFavoriteBadges } from "@/components/profile/PublicFavoriteBadges";
import { PublicCurrentlyReading } from "@/components/profile/PublicCurrentlyReading";
import { PublicFavoriteBooks } from "@/components/profile/PublicFavoriteBooks";
import { Skeleton } from "@/components/ui/skeleton";

export default function PublicProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [userExists, setUserExists] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const fetchUserData = async () => {
      try {
        setLoading(true);
        const profile = await getUserProfile(userId);
        
        if (profile) {
          setUsername(profile.username);
          setUserExists(true);
        } else {
          setUserExists(false);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération du profil:", error);
        setUserExists(false);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="container py-6 space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <Skeleton className="h-12 w-1/3" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </CardContent>
          </Card>
          <div className="space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </main>
      </div>
    );
  }

  if (!userExists || !userId) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="container py-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-serif text-coffee-darker">
                Profil non trouvé
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Ce profil n'existe pas ou n'est pas accessible.
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container py-6 space-y-6">
        <Card className="border-coffee-light">
          <CardContent className="pt-6">
            <h1 className="text-3xl font-serif font-medium text-coffee-darker">
              {username || "Profil"}
            </h1>
          </CardContent>
        </Card>
        
        <div className="space-y-6">
          <PublicUserStats userId={userId} />
          <PublicFavoriteBadges userId={userId} />
          <PublicCurrentlyReading userId={userId} />
          <PublicFavoriteBooks userId={userId} />
        </div>
      </main>
    </div>
  );
}
