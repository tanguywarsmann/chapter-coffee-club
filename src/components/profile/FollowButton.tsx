
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { followUser, unfollowUser, isFollowing } from "@/services/user/profileService";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { UserPlus, UserMinus } from "lucide-react";

interface FollowButtonProps {
  targetUserId: string;
  onFollowChange?: () => void;
  hideUnfollow?: boolean; // Nouvelle propriété pour masquer le bouton de désabonnement
}

export function FollowButton({ targetUserId, onFollowChange, hideUnfollow = false }: FollowButtonProps) {
  const [following, setFollowing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (!user || user.id === targetUserId) return;
    
    async function checkFollowStatus() {
      try {
        const isUserFollowing = await isFollowing(targetUserId);
        setFollowing(isUserFollowing);
      } catch (error) {
        console.error("Error checking follow status:", error);
      }
    }
    
    checkFollowStatus();
  }, [targetUserId, user]);

  // Ne pas rendre le bouton si :
  // - on consulte son propre profil
  // - on suit déjà l'utilisateur ET hideUnfollow est true
  if (!user || user.id === targetUserId || (following && hideUnfollow)) {
    return null;
  }

  const handleFollowToggle = async () => {
    setIsLoading(true);
    try {
      if (following) {
        await unfollowUser(targetUserId);
        toast({
          title: "Désabonné",
          description: "Vous ne suivez plus cet utilisateur.",
          variant: "default"
        });
        setFollowing(false);
      } else {
        await followUser(targetUserId);
        toast({
          title: "Abonné",
          description: "Vous suivez maintenant cet utilisateur.",
          variant: "default"
        });
        setFollowing(true);
      }
      if (onFollowChange) onFollowChange();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleFollowToggle}
      disabled={isLoading}
      variant={following ? "outline" : "default"}
      size="sm"
      className="flex items-center gap-1 transition-all duration-300"
      aria-label={following ? "Se désabonner" : "S'abonner"}
    >
      {following ? (
        <>
          <UserMinus className="h-4 w-4" />
          <span>Se désabonner</span>
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4" />
          <span>S'abonner</span>
        </>
      )}
    </Button>
  );
}
