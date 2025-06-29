
import { useEffect, useState } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { UserItem } from "@/components/discover/UserItem";
import { ActivityFeed } from "@/components/discover/ActivityFeed";
import { CommunityStats } from "@/components/discover/CommunityStats";
import { searchUsers } from "@/services/user/profileService";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";

export default function Discover() {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // Initial load of users
  useEffect(() => {
    const loadUsers = async () => {
      setIsLoading(true);
      try {
        const userData = await searchUsers("", 20);
        // Filter out the current user
        if (user?.id) {
          const filteredData = userData.filter((u: any) => u.id !== user.id);
          setUsers(filteredData);
          setFilteredUsers(filteredData);
        } else {
          setUsers(userData);
          setFilteredUsers(userData);
        }
      } catch (error) {
        console.error("Failed to load users:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      loadUsers();
    }
  }, [user?.id]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (!query.trim()) {
      setFilteredUsers(users);
    } else {
      const lowercaseQuery = query.toLowerCase();
      const filtered = users.filter((user: any) => 
        user.name?.toLowerCase().includes(lowercaseQuery) || 
        (user.email && user.email.toLowerCase().includes(lowercaseQuery))
      );
      setFilteredUsers(filtered);
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-coffee-lightest via-white to-coffee-light/30">
        <AppHeader />
        <main className="container py-6 max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-serif font-medium text-coffee-darker mb-2">
              Découvrir des lecteurs
            </h1>
            <p className="text-coffee-dark font-light">
              Explorez la communauté et suivez l'activité des autres lecteurs
            </p>
          </div>
          
          {/* Grille principale */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Colonne principale - Fil d'actualité */}
            <div className="lg:col-span-2 space-y-6">
              <ActivityFeed />
              
              {/* Section recherche et utilisateurs */}
              <div>
                <div className="relative mb-6">
                  <Input 
                    placeholder="Rechercher un lecteur..." 
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="pl-10 bg-white/80 backdrop-blur-sm border-coffee-light"
                    aria-label="Rechercher un lecteur"
                  />
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                </div>
                
                <Card className="border-coffee-light bg-white/70 backdrop-blur-md">
                  <CardHeader>
                    <CardTitle className="text-lg font-serif text-coffee-darker">Lecteurs</CardTitle>
                    <CardDescription>Découvrez d'autres passionnés de lecture</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isLoading ? (
                      <div className="flex justify-center p-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-coffee-dark"></div>
                      </div>
                    ) : filteredUsers.length > 0 ? (
                      filteredUsers.map((userItem) => (
                        <UserItem key={userItem.id} user={userItem} />
                      ))
                    ) : (
                      <div className="text-center p-4 text-muted-foreground">
                        Aucun utilisateur ne correspond à votre recherche.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
            
            {/* Sidebar droite - Statistiques */}
            <div className="space-y-6">
              <CommunityStats />
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
