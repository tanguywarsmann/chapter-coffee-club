
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { followUser, unfollowUser, isFollowing } from "@/services/user/profileService";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { UserPlus, UserMinus, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/i18n/LanguageContext";

interface FollowButtonProps {
  targetUserId: string;
  onFollowChange?: () => void;
  hideUnfollow?: boolean;
  variant?: "default" | "outline" | "ghost";
  className?: string;
}

export function FollowButton({ targetUserId, onFollowChange, hideUnfollow = false, variant = "default", className }: FollowButtonProps) {
  const [following, setFollowing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isHovering, setIsHovering] = useState<boolean>(false);
  const { user } = useAuth();
  const { t } = useTranslation();

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

  if (!user || user.id === targetUserId || (following && hideUnfollow)) {
    return null;
  }

  const handleFollowToggle = async () => {
    setIsLoading(true);
    try {
      if (following) {
        await unfollowUser(targetUserId);
        toast.success("Vous ne suivez plus cet utilisateur.");
        setFollowing(false);
      } else {
        await followUser(targetUserId);
        toast.success("Vous suivez maintenant cet utilisateur.");
        setFollowing(true);
      }
      if (onFollowChange) onFollowChange();
    } catch (error: any) {
      toast.error(error.message || "Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  if (following) {
    return (
      <Button
        onClick={handleFollowToggle}
        disabled={isLoading}
        variant="outline"
        size="sm"
        className={cn(
          "w-28 transition-all duration-200",
          isHovering && "border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive",
          className
        )}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {isLoading ? (
          <span className="animate-pulse">...</span>
        ) : isHovering ? (
          <span className="flex items-center gap-1.5">
            <UserMinus className="h-3.5 w-3.5" />
            {t.common.unfollow}
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Check className="h-3.5 w-3.5" />
            {t.common.following}
          </span>
        )}
      </Button>
    );
  }

  return (
    <Button
      onClick={handleFollowToggle}
      disabled={isLoading}
      variant={variant}
      size="sm"
      className={cn("w-28 transition-all duration-200", className)}
    >
      {isLoading ? (
        <span className="animate-pulse">...</span>
      ) : (
        <span className="flex items-center gap-1.5">
          <UserPlus className="h-3.5 w-3.5" />
          {t.common.follow}
        </span>
      )}
    </Button>
  );
}
