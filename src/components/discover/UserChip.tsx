import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SuggestedReader, followUser } from "@/services/discoverService";
import { useAuth } from "@/contexts/AuthContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { UserPlus } from "lucide-react";

interface UserChipProps {
  user: SuggestedReader;
}

export function UserChip({ user }: UserChipProps) {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();

  const followMutation = useMutation({
    mutationFn: () => followUser(currentUser?.id!, user.id),
    onSuccess: () => {
      toast({
        title: "Utilisateur suivi",
        description: `Vous suivez maintenant ${user.username}`,
      });
      queryClient.invalidateQueries({ queryKey: ['suggested-readers'] });
    },
    onError: (error) => {
      console.error('Error following user:', error);
      toast({
        title: "Erreur",
        description: "Impossible de suivre cet utilisateur",
        variant: "destructive",
      });
    },
  });

  return (
    <Card className="p-3 bg-cream border-coffee-light">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={user.avatar_url || "/placeholder.svg"} alt={user.username} />
          <AvatarFallback className="bg-coffee-medium text-coffee-lightest">
            {user.username?.charAt(0).toUpperCase() || '?'}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <p className="font-medium text-coffee-darker truncate">
            @{user.username}
          </p>
        </div>
        
        <Button
          size="sm"
          variant="outline"
          onClick={() => followMutation.mutate()}
          disabled={followMutation.isPending}
          className="border-coffee-medium text-coffee-dark hover:bg-coffee-light"
        >
          <UserPlus className="h-3 w-3 mr-1" />
          Suivre
        </Button>
      </div>
    </Card>
  );
}