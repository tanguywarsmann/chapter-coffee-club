
import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { findSimilarReaders } from "@/services/user/similarReadersService";
import { UserItem } from "@/components/discover/UserItem";
import { useAuth } from "@/contexts/AuthContext";
import { BookOpen } from "lucide-react";

export function SimilarReaders() {
  const [similarUsers, setSimilarUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchSimilarReaders = async () => {
      try {
        if (!user?.id) return;
        
        const readers = await findSimilarReaders(user.id, 3);
        setSimilarUsers(readers);
      } catch (error) {
        console.error("Error fetching similar readers:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchSimilarReaders();
    }
  }, [user]);

  return (
    <Card className="border-coffee-light focus-within:ring-2 focus-within:ring-coffee-dark focus-within:ring-opacity-50">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-serif text-coffee-darker flex items-center gap-2" id="similar-readers-title">
          <BookOpen className="h-4 w-4" aria-hidden="true" />
          <span>Lecteurs avec lectures similaires</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-3">
        {isLoading ? (
          <div className="flex justify-center p-4" role="status" aria-label="Chargement des lecteurs similaires">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-coffee-dark"></div>
          </div>
        ) : similarUsers.length > 0 ? (
          <div aria-labelledby="similar-readers-title" className="space-y-3">
            {similarUsers.map(user => (
              <UserItem key={user.id} user={user} compact />
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-3">
            Aucun lecteur avec des lectures similaires trouvé pour le moment.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
