
import { useState } from "react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { X, UserPlus } from "lucide-react";

interface User {
  id: string;
  name: string;
  avatar?: string;
  stats: {
    booksReading: number;
    badges: number;
    streak?: number;
  };
  isFollowing?: boolean;
}

interface EnhancedUserItemProps {
  user: User;
}

export function EnhancedUserItem({ user }: EnhancedUserItemProps) {
  const { user: currentUser } = useAuth();
  const [isFollowing, setIsFollowing] = useState(user.isFollowing || false);
  const [isLoading, setIsLoading] = useState(false);

  const handleFollowToggle = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsFollowing(!isFollowing);
    setIsLoading(false);
  };

  const shouldShowFollowButton = currentUser && currentUser.id !== user.id;

  return (
    <div className="p-4 border border-coffee-light/40 rounded-lg bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all duration-200">
      <div className="flex items-start justify-between">
        <Link 
          to={`/profile/${user.id}`} 
          className="flex items-start space-x-3 hover:opacity-80 transition-opacity flex-1"
        >
          <Avatar className="h-12 w-12 border border-coffee-light">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="bg-coffee-medium text-white">
              {user.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-coffee-darker text-base mb-1 truncate">
              {user.name}
            </h3>
            
            <div className="flex flex-wrap gap-2 mb-2">
              <Badge variant="outline" className="text-xs border-coffee-light/60 text-coffee-dark bg-coffee-light/10">
                📚 {user.stats.booksReading} en cours
              </Badge>
              <Badge variant="outline" className="text-xs border-coffee-light/60 text-coffee-dark bg-coffee-light/10">
                🏆 {user.stats.badges} badges
              </Badge>
              {user.stats.streak && (
                <Badge variant="outline" className="text-xs border-coffee-light/60 text-coffee-dark bg-coffee-light/10">
                  🔥 {user.stats.streak}j
                </Badge>
              )}
            </div>
          </div>
        </Link>
        
        {shouldShowFollowButton && (
          <Button
            onClick={handleFollowToggle}
            disabled={isLoading}
            variant="ghost"
            size="sm"
            className={`ml-2 h-8 w-8 p-0 hover:bg-coffee-light/20 ${
              isFollowing 
                ? 'text-coffee-medium hover:text-coffee-dark' 
                : 'text-coffee-dark hover:text-coffee-darker'
            }`}
          >
            {isFollowing ? (
              <X className="h-4 w-4" />
            ) : (
              <UserPlus className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
