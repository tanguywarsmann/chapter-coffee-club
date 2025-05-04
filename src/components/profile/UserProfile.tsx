
import { WelcomeModal } from "@/components/onboarding/WelcomeModal";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserRound, Pencil, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getFollowerCounts } from "@/services/user/profileService";
import { FollowButton } from "./FollowButton";
import { useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export function UserProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const params = useParams();
  const [profileUserId, setProfileUserId] = useState<string | null>(null);
  const [followerCounts, setFollowerCounts] = useState({ followers: 0, following: 0 });
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [profileData, setProfileData] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  // Set profileUserId based on URL params or current user
  useEffect(() => {
    // If there's a userId in the URL, use that, otherwise use the current user's ID
    if (params.userId) {
      setProfileUserId(params.userId);
    } else if (user) {
      setProfileUserId(user.id);
    }
  }, [params.userId, user]);

  // Fetch follower counts when profileUserId changes
  useEffect(() => {
    if (!profileUserId) return;
    
    async function fetchFollowerCounts() {
      try {
        setLoading(true);
        const counts = await getFollowerCounts(profileUserId);
        setFollowerCounts(counts);
      } catch (error) {
        console.error("Error fetching follower counts:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les statistiques des abonnés",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }
    
    fetchFollowerCounts();
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

  const isOwnProfile = !params.userId || (user && user.id === profileUserId);

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
            {isOwnProfile && (
              <Button variant="ghost" size="sm" className="text-coffee-dark hover:text-coffee-darker">
                <Pencil className="h-4 w-4 mr-1" />
                Modifier mes informations
              </Button>
            )}
            {!isOwnProfile && profileUserId && (
              <FollowButton targetUserId={profileUserId} onFollowChange={refreshCounts} />
            )}
          </CardHeader>
          <CardContent>
            <div className="flex items-start space-x-4">
              <Avatar className="h-16 w-16 border-2 border-coffee-light">
                <AvatarImage src={profileData?.avatar} alt={profileData?.name} />
                <AvatarFallback className="text-xl bg-coffee-light text-coffee-darker">
                  {profileData?.name?.[0] || profileData?.email?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h3 className="text-lg font-medium text-coffee-darker">{profileData?.name || 'Utilisateur'}</h3>
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
