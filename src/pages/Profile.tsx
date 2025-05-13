
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppHeader } from "@/components/layout/AppHeader";
import { UserProfile } from "@/components/profile/UserProfile";
import { ReadingStats } from "@/components/profile/ReadingStats";
import { UserGoals } from "@/components/profile/UserGoals";
import { UserSettings } from "@/components/profile/UserSettings";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useAuth } from "@/contexts/AuthContext";
import { UserPublicHeader } from "@/components/profile/UserPublicHeader";
import { PublicUserStats } from "@/components/profile/PublicUserStats";
import { CurrentlyReading } from "@/components/profile/CurrentlyReading";
import { CompletedBooks } from "@/components/profile/CompletedBooks";
import { ProfileBadges } from "@/components/profile/ProfileBadges";

export default function Profile() {
  const params = useParams<{ userId?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [username, setUsername] = useState<string | null>(null);
  
  const profileUserId = params.userId || user?.id;
  const isOwnProfile = !params.userId || (user && user.id === params.userId);

  useEffect(() => {
    if (user && params.userId === user.id) {
      navigate('/profile');
    }
  }, [user, params.userId, navigate]);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="container py-6 space-y-6">
          {isOwnProfile ? (
            // Affichage du profil personnel
            <>
              <h1 className="text-3xl font-serif font-medium text-coffee-darker">
                Mon profil
              </h1>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-3/4 space-y-6">
                  <UserProfile />
                  <ProfileBadges />
                  <ReadingStats />
                  <UserGoals />
                </div>
                <div className="w-full md:w-1/4">
                  <UserSettings />
                </div>
              </div>
            </>
          ) : (
            // Affichage du profil public
            <>
              <UserPublicHeader 
                userId={profileUserId!} 
                onProfileLoaded={setUsername}
              />
              
              <h1 className="text-3xl font-serif font-medium text-coffee-darker">
                Profil de {username || "Lecteur"}
              </h1>
              
              <div className="space-y-6">
                <PublicUserStats userId={profileUserId!} />
                <ProfileBadges userId={profileUserId!} />
                <CurrentlyReading userId={profileUserId!} />
                <CompletedBooks userId={profileUserId!} />
              </div>
            </>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}
