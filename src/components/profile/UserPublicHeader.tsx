
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { EnhancedAvatar } from "@/components/ui/avatar";
import { getUserProfile, getDisplayName } from "@/services/user/userProfileService";
import { useAuth } from "@/contexts/AuthContext";
import { FollowButton } from "@/components/profile/FollowButton";

interface UserPublicHeaderProps {
  userId: string;
  onProfileLoaded: (username: string | null) => void;
}

export function UserPublicHeader({ userId, onProfileLoaded }: UserPublicHeaderProps) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useAuth();
  const isOwnProfile = currentUser?.id === userId;

  useEffect(() => {
    if (!userId) return;

    async function fetchProfileData() {
      try {
        setLoading(true);
        const profileData = await getUserProfile(userId);
        setProfile(profileData);
        
        // Informe le composant parent que le profil est chargé
        if (onProfileLoaded) {
          onProfileLoaded(profileData?.username || null);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProfileData();
  }, [userId, onProfileLoaded]);

  if (loading) {
    return (
      <Card className="border-coffee-light">
        <CardContent className="py-6">
          <div className="flex items-center justify-center h-16">
            <span className="text-muted-foreground">Chargement du profil...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card className="border-coffee-light">
        <CardContent className="py-6">
          <div className="flex items-center justify-center h-16">
            <span className="text-muted-foreground">Profil non trouvé</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const displayName = getDisplayName(profile.username, profile.email, userId);

  return (
    <Card className="border-coffee-light">
      <CardContent className="py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <EnhancedAvatar 
              src={null}
              alt={displayName}
              fallbackText={displayName}
              size="lg"
              className="border-2 border-coffee-light"
            />
            <div className="space-y-1 max-w-[calc(100vw-4rem)] md:max-w-none truncate">
              <h2 className="text-2xl font-serif font-medium text-coffee-darker truncate">
                {displayName}
              </h2>
              {profile.email && (
                <p className="text-sm text-muted-foreground truncate">{profile.email}</p>
              )}
            </div>
          </div>
          
          {!isOwnProfile && (
            <div className="w-full md:w-auto">
              <FollowButton targetUserId={userId} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
