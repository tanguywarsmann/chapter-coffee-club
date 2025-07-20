
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { EnhancedAvatar } from "@/components/ui/avatar";
import { FollowButton } from "@/components/profile/FollowButton";
import { useAuth } from "@/contexts/AuthContext";
import { getUserProfile, getDisplayName } from "@/services/user/userProfileService";

interface User {
  id: string;
  name?: string;
  avatar?: string;
  username?: string;
  email?: string;
}

interface UserItemProps {
  user: User;
  compact?: boolean;
  hideUnfollow?: boolean; // Nouvelle propriété
}

export function UserItem({ user, compact = false, hideUnfollow = false }: UserItemProps) {
  const { user: currentUser } = useAuth();
  const [userName, setUserName] = useState<string>(user.name || "Lecteur");
  const [showFollowButton, setShowFollowButton] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only show the follow button if we're logged in and it's not the current user
    setShowFollowButton(!!currentUser && currentUser.id !== user.id);
    
    // Fetch user profile to get username if not provided
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const profile = await getUserProfile(user.id);
        if (profile) {
          const displayName = getDisplayName(
            profile.username || user.username,
            profile.email || user.email,
            user.id
          );
          setUserName(displayName);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [currentUser, user]);

  return (
    <div className={`flex items-center justify-between ${compact ? 'gap-2' : 'gap-4'}`}>
      <Link 
        to={`/profile/${user.id}`} 
        className="flex items-center gap-3 hover:underline"
        aria-label={`Voir le profil de ${userName}`}
      >
      <EnhancedAvatar
  src={user.avatar_url || undefined}
  alt={userName}
  fallbackText={userName}
/>
        <span className={`font-medium text-coffee-darker ${compact ? 'text-sm' : 'text-base'}`}>
          {loading ? "Chargement..." : userName}
        </span>
      </Link>
      
      {showFollowButton && (
        <div>
          <FollowButton targetUserId={user.id} hideUnfollow={hideUnfollow} />
        </div>
      )}
    </div>
  );
}
