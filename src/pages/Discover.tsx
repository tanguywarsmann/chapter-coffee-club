
import { AppHeader } from "@/components/layout/AppHeader";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useAuth } from "@/contexts/AuthContext";
import { useDiscoverFeed } from "@/hooks/useDiscoverFeed";
import { ActivityCard } from "@/components/discover/ActivityCard";
import { UserChip } from "@/components/discover/UserChip";
import { ActivitySkeletonList } from "@/components/discover/ActivitySkeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Users } from "lucide-react";

export default function Discover() {
  const { user } = useAuth();
  const { feed, suggestions } = useDiscoverFeed(user?.id || '');

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-coffee-darker to-coffee-dark">
        <AppHeader />
        <main className="mx-auto max-w-3xl px-4 py-8 space-y-12">
          <header className="text-center space-y-2">
            <h1 className="font-serif text-4xl md:text-5xl text-coffee-lightest">
              Fil d'activité 📖
            </h1>
            <p className="text-lg text-coffee-light">
              Découvrez les dernières activités de la communauté
            </p>
          </header>

          {/* ACTIVITY FEED */}
          <Card className="bg-coffee-lightest border-coffee-medium">
            <CardHeader className="bg-gradient-to-r from-coffee-light/20 to-coffee-medium/10 border-b border-coffee-light/30">
              <CardTitle className="font-serif text-coffee-darker flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-coffee-medium/20 to-coffee-light/20 rounded-xl">
                  <Sparkles className="h-5 w-5 text-coffee-dark" />
                </div>
                <span>Activité récente</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {feed.isLoading && <ActivitySkeletonList />}
                {feed.data && feed.data.length > 0 ? (
                  feed.data.map((item, index) => (
                    <ActivityCard 
                      key={`${item.kind}-${item.posted_at}-${item.actor_id}-${index}`} 
                      item={item} 
                    />
                  ))
                ) : (
                  !feed.isLoading && (
                    <div className="text-center py-8 text-coffee-medium">
                      <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Aucune activité récente à afficher</p>
                      <p className="text-sm mt-2">
                        Suivez d'autres lecteurs pour voir leur activité !
                      </p>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>

          {/* SUGGESTIONS */}
          {suggestions.data && suggestions.data.length > 0 && (
            <Card className="bg-coffee-lightest border-coffee-medium">
              <CardHeader className="bg-gradient-to-r from-coffee-light/20 to-coffee-medium/10 border-b border-coffee-light/30">
                <CardTitle className="font-serif text-coffee-darker flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-coffee-medium/20 to-coffee-light/20 rounded-xl">
                    <Users className="h-5 w-5 text-coffee-dark" />
                  </div>
                  <span>Lecteurs à suivre</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid gap-3 sm:grid-cols-2">
                  {suggestions.data.map((user) => (
                    <UserChip key={user.id} user={user} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}
