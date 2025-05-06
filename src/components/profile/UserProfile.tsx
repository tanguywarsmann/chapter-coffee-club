
import { WelcomeModal } from "@/components/onboarding/WelcomeModal";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserRound, Pencil, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getFollowerCounts } from "@/services/user/profileService";
import { getUserProfile, getDisplayName } from "@/services/user/userProfileService";
import { FollowButton } from "./FollowButton";
import { useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { ProfileNameForm } from "./ProfileNameForm";

export function UserProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const params = useParams();
  const [profileUserId, setProfileUserId] = useState<string | null>(null);
  const [followerCounts, setFollowerCounts] = useState({ followers: 0, following: 0 });
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [username, setUsername] = useState<string | null>(null);
  
  // Set profileUserId based on URL params or current user
  useEffect(() => {
    // If there's a userId in the URL, use that, otherwise use the current user's ID
    if (params.userId) {
      setProfileUserId(params.userId);
    } else if (user) {
      setProfileUserId(user.id);
    }
  }, [params.userId, user]);

  // Fetch follower counts and user profile when profileUserId changes
  useEffect(() => {
    if (!profileUserId) return;
    
    async function fetchUserData() {
      try {
        setLoading(true);
        
        // Fetch follower counts
        const counts = await getFollowerCounts(profileUserId);
        setFollowerCounts(counts);
        
        // Fetch user profile
        const profile = await getUserProfile(profileUserId);
        if (profile) {
          setUsername(profile.username);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les données utilisateur",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }
    
    fetchUserData();
  }, [profileUserId, toast]);

  const refreshCounts = async () => {
    if (!profileUserId) return;
    try {
      const counts = await getFollowerCounts(profileUserId);
      setFollowerCounts(counts);
    } catch (error) {
      console.error("Error refreshing follower counts:", error);
    }
  };
  
  const refreshProfile = async () => {
    if (!profileUserId) return;
    
    try {
      const profile = await getUserProfile(profileUserId);
      if (profile) {
        setUsername(profile.username);
      }
      setIsEditingProfile(false);
    } catch (error) {
      console.error("Error refreshing user profile:", error);
    }
  };

  const isOwnProfile = !params.userId || (user && user.id === profileUserId);
  
  // Determine display name based on available info
  const displayName = getDisplayName(username, profileData?.email, profileData?.id || 'U');

  return (
    <>
      <WelcomeModal
        open={showWelcome}
        onClose={() => setShowWelcome(false)}
      />
      <div>
        <Card className="border-coffee-light">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-xl font-serif text-coffee-darker flex items-center gap-2">
              <UserRound className="h-5 w-5 text-coffee-dark" />
              {isOwnProfile ? "Mon profil" : "Profil utilisateur"}
            </CardTitle>
            {isOwnProfile && !isEditingProfile && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-coffee-dark hover:text-coffee-darker"
                onClick={() => setIsEditingProfile(true)}
              >
                <Pencil className="h-4 w-4 mr-1" />
                {username ? "Modifier mon nom" : "Ajouter un nom de profil"}
              </Button>
            )}
            {!isOwnProfile && profileUserId && (
              <FollowButton targetUserId={profileUserId} onFollowChange={refreshCounts} />
            )}
          </CardHeader>
          <CardContent>
            {isEditingProfile && isOwnProfile ? (
              <div className="mb-4">
                <ProfileNameForm 
                  currentUsername={username} 
                  onSave={refreshProfile} 
                />
                <div className="mt-3 flex justify-end">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setIsEditingProfile(false)}
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-start space-x-4">
                <Avatar className="h-16 w-16 border-2 border-coffee-light">
                  <AvatarImage src={profileData?.avatar} alt={displayName} />
                  <AvatarFallback className="text-xl bg-coffee-light text-coffee-darker">
                    {displayName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h3 className="text-lg font-medium text-coffee-darker">{displayName}</h3>
                  <p className="text-sm text-muted-foreground">{profileData?.email}</p>
                  
                  <div className="flex items-center mt-2 gap-4">
                    <div className="flex items-center gap-1 text-sm">
                      <Users className="h-4 w-4 text-coffee-dark" />
                      <span className="font-medium text-coffee-dark">{followerCounts.followers}</span>
                      <span className="text-muted-foreground">Abonnés</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <Users className="h-4 w-4 text-coffee-dark" />
                      <span className="font-medium text-coffee-dark">{followerCounts.following}</span>
                      <span className="text-muted-foreground">Abonnements</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {isOwnProfile && !username && !isEditingProfile && (
              <div className="mt-4 py-2 px-3 bg-muted/50 rounded-md text-sm">
                <p className="text-coffee-darker">
                  Choisis un nom public pour que les autres puissent te reconnaître.
                </p>
                <Button 
                  variant="link" 
                  className="text-coffee-dark p-0 h-auto mt-1"
                  onClick={() => setIsEditingProfile(true)}
                >
                  Définir mon nom de profil
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        {isOwnProfile && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => setShowWelcome(true)}
              className="text-xs text-coffee-medium underline underline-offset-2 hover:text-coffee-darker transition-colors"
              type="button"
            >
              Revoir le guide de démarrage
            </button>
          </div>
        )}
      </div>
    </>
  );
}
