
import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle, CardFooter } from "@/components/ui/card";
import { searchUsers } from "@/services/user/profileService";
import { UserItem } from "@/components/discover/UserItem";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Users } from "lucide-react";

export function RecommendedUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Fetch a few users to recommend
        const results = await searchUsers("", 5);
        
        // Filter out current user and take only 3
        const filteredUsers = results
          .filter((u: any) => u.id !== user?.id)
          .slice(0, 3);
          
        setUsers(filteredUsers);
      } catch (error) {
        console.error("Error fetching recommended users:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchUsers();
    }
  }, [user]);

  return (
    <Card className="border-coffee-light">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-serif text-coffee-darker">Lecteurs à découvrir</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center p-2">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-coffee-dark"></div>
          </div>
        ) : users.length > 0 ? (
          users.map(user => (
            <UserItem key={user.id} user={user} compact hideUnfollow={true} />
          ))
        ) : (
          <div className="text-center text-muted-foreground py-2">
            Aucun lecteur à découvrir pour le moment.
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0">
        <Button variant="outline" className="w-full text-coffee-dark hover:text-coffee-darker hover:bg-coffee-light/20" asChild>
          <Link to="/discover" className="flex items-center justify-center gap-2">
            <Users className="h-4 w-4" />
            <span>Découvrir plus de lecteurs</span>
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
