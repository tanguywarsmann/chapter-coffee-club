
import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { searchUsers } from "@/services/user/profileService";
import { UserItem } from "@/components/discover/UserItem";
import { useAuth } from "@/contexts/AuthContext";

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

  if (users.length === 0 && !isLoading) {
    return null;
  }

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
        ) : (
          users.map(user => (
            <UserItem key={user.id} user={user} compact />
          ))
        )}
      </CardContent>
    </Card>
  );
}
