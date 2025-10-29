
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { followUser, unfollowUser, isFollowing } from "@/services/user/profileService";
import { toast } from "sonner";
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
        toast.success("Vous ne suivez plus cet utilisateur.", {
          description: "Désabonné"
        });
        setFollowing(false);
      } else {
        await followUser(targetUserId);
        toast.success("Vous suivez maintenant cet utilisateur.", {
          description: "Abonné"
        });
        setFollowing(true);
      }
      if (onFollowChange) onFollowChange();
    } catch (error: any) {
      toast.error(error.message || "Une erreur est survenue", {
        description: "Erreur"
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
