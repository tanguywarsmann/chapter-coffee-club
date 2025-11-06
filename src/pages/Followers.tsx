
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppHeader } from "@/components/layout/AppHeader";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserItem } from "@/components/discover/UserItem";
import { getFollowers, getFollowing } from "@/services/user/profileService";
import { ChevronLeft } from "lucide-react";

export default function Followers() {
  const { type, userId } = useParams<{ type: 'followers' | 'following'; userId?: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Déterminer l'ID de l'utilisateur à afficher (soit celui de l'URL, soit l'utilisateur connecté)
  const targetUserId = userId || currentUser?.id;
  const isOwnProfile = currentUser?.id === targetUserId;

  useEffect(() => {
    if (!targetUserId) return;

    const fetchUsers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        let fetchedUsers: any[] = [];
        
        if (type === 'followers') {
          // Récupérer les followers
          fetchedUsers = await getFollowers(targetUserId);
        } else if (type === 'following') {
          // Récupérer les following
          fetchedUsers = await getFollowing(targetUserId);
        }
        
        setUsers(fetchedUsers);
      } catch (err) {
        console.error(`Error fetching ${type}:`, err);
        setError(`Impossible de charger les ${type === 'followers' ? 'abonnés' : 'abonnements'}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [targetUserId, type]);

  const getTitle = () => {
    if (type === 'followers') {
      return isOwnProfile ? "Mes abonnés" : "Abonnés";
    } else {
      return isOwnProfile ? "Mes abonnements" : "Abonnements";
    }
  };

  const handleBack = () => {
    if (userId) {
      navigate(`/profile/${userId}`);
    } else {
      navigate('/profile');
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="mx-auto w-full px-4 max-w-none py-6">
          <div className="flex items-center gap-2 mb-6">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-coffee-dark" 
              onClick={handleBack}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Retour au profil
            </Button>
            <h1 className="text-3xl font-serif font-medium text-coffee-darker">
              {getTitle()}
            </h1>
          </div>

          <Card className="border-coffee-light">
            <CardHeader>
              <CardTitle className="text-lg font-serif text-coffee-darker">
                {type === 'followers' ? 'Personnes qui vous suivent' : 'Personnes que vous suivez'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="flex justify-center p-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-coffee-dark"></div>
                </div>
              ) : error ? (
                <div className="text-center p-4 text-muted-foreground">
                  {error}
                </div>
              ) : users.length > 0 ? (
                users.map(user => (
                  <UserItem 
                    key={user.id} 
                    user={user} 
                    hideUnfollow={type === 'followers'} 
                  />
                ))
              ) : (
                <div className="text-center p-8 text-muted-foreground">
                  {type === 'followers' 
                    ? isOwnProfile 
                      ? "Vous n'avez pas encore d'abonnés" 
                      : "Cet utilisateur n'a pas encore d'abonnés"
                    : isOwnProfile
                      ? "Vous n'êtes abonné à aucun utilisateur" 
                      : "Cet utilisateur n'est abonné à personne"
                  }
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </AuthGuard>
  );
}
