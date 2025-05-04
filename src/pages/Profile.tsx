
import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppHeader } from "@/components/layout/AppHeader";
import { UserProfile } from "@/components/profile/UserProfile";
import { UserStats } from "@/components/profile/UserStats";
import { UserGoals } from "@/components/profile/UserGoals";
import { UserSettings } from "@/components/profile/UserSettings";
import { AuthGuard } from "@/components/auth/AuthGuard";

export default function Profile() {
  const params = useParams();
  const navigate = useNavigate();
  
  // If viewing own profile, the userId param will be undefined
  const isOwnProfile = !params.userId;
  
  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="container py-6 space-y-8">
          <h1 className="text-3xl font-serif font-medium text-coffee-darker">
            {isOwnProfile ? "Mon profil" : "Profil utilisateur"}
          </h1>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-3/4 space-y-6">
              <UserProfile />
              {isOwnProfile && (
                <>
                  <UserGoals />
                  <UserStats />
                </>
              )}
            </div>
            <div className="w-full md:w-1/4">
              {isOwnProfile && <UserSettings />}
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
