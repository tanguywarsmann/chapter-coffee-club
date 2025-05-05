
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FollowButton } from "@/components/profile/FollowButton";
import { useAuth } from "@/contexts/AuthContext";

interface User {
  id: string;
  name?: string;
  avatar?: string;
}

interface UserItemProps {
  user: User;
  compact?: boolean;
}

export function UserItem({ user, compact = false }: UserItemProps) {
  const { user: currentUser } = useAuth();
  const [userName, setUserName] = useState(user.name || "Lecteur");
  const [showFollowButton, setShowFollowButton] = useState(false);

  useEffect(() => {
    // Only show the follow button if we're logged in and it's not the current user
    setShowFollowButton(!!currentUser && currentUser.id !== user.id);
    
    // Set a default name if none is provided
    if (!user.name) {
      setUserName("Lecteur " + user.id.substring(0, 4));
    }
  }, [currentUser, user]);

  return (
    <div className={`flex items-center justify-between ${compact ? 'gap-2' : 'gap-4'}`}>
      <Link 
        to={`/profile/${user.id}`} 
        className="flex items-center gap-3 hover:underline"
        aria-label={`Voir le profil de ${userName}`}
      >
        <Avatar className={`${compact ? 'h-8 w-8' : 'h-10 w-10'} border border-coffee-light`}>
          <AvatarImage src={user.avatar} alt={userName} />
          <AvatarFallback className="bg-coffee-medium text-primary-foreground">
            {userName.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <span className={`font-medium text-coffee-darker ${compact ? 'text-sm' : 'text-base'}`}>{userName}</span>
      </Link>
      
      {showFollowButton && (
        <div>
          <FollowButton targetUserId={user.id} />
        </div>
      )}
    </div>
  );
}
