
import { useState } from "react";
import { Link } from "react-router-dom";
import { EnhancedAvatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { X, UserPlus } from "lucide-react";
import { type DiscoverUser } from "@/services/user/discoverService";

interface EnhancedUserItemProps {
  user: DiscoverUser;
}

export function EnhancedUserItem({ user }: EnhancedUserItemProps) {
  const { user: currentUser } = useAuth();
  const [isFollowing, setIsFollowing] = useState(user.isFollowing);
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
    <div className="p-4 border border-coffee-light/30 rounded-lg bg-white/80 backdrop-blur-sm hover:bg-white/90 transition-all duration-200 shadow-sm">
      <div className="flex items-start justify-between">
        <Link 
          to={`/profile/${user.id}`} 
          className="flex items-start space-x-3 hover:opacity-80 transition-opacity flex-1"
        >
          <EnhancedAvatar 
            src="/placeholder.svg"
            alt={user.username}
            fallbackText={user.username}
            size="md"
            className="border border-coffee-light/50"
          />
          
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-coffee-darker text-base mb-2 break-words">
              {user.username}
            </h3>
            
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-xs border-coffee-light/50 text-coffee-dark bg-coffee-light/10">
                📚 {user.stats.booksReading} en cours
              </Badge>
              <Badge variant="outline" className="text-xs border-coffee-light/50 text-coffee-dark bg-coffee-light/10">
                🏆 {user.stats.badges} badges
              </Badge>
              <Badge variant="outline" className="text-xs border-coffee-light/50 text-coffee-dark bg-coffee-light/10">
                🔥 {user.stats.streak}j
              </Badge>
            </div>
          </div>
        </Link>
        
        {shouldShowFollowButton && (
          <div className="flex flex-col items-end gap-1 ml-2 mt-8">
            <Button
              onClick={handleFollowToggle}
              disabled={isLoading}
              variant="ghost"
              size="sm"
              className={`h-5 w-5 p-0 hover:bg-coffee-light/10 transition-colors ${
                isFollowing 
                  ? 'text-coffee-medium/70 hover:text-coffee-dark' 
                  : 'text-coffee-dark/70 hover:text-coffee-darker'
              }`}
            >
              {isFollowing ? (
                <X className="h-3 w-3" />
              ) : (
                <UserPlus className="h-3 w-3" />
              )}
            </Button>
            {isFollowing && (
              <span className="text-xs text-coffee-medium/60">Suivi</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
