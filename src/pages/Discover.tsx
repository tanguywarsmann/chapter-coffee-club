
import { AppHeader } from "@/components/layout/AppHeader";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useAuth } from "@/contexts/AuthContext";
import { useDiscover } from "@/hooks/useDiscover";
import { RealActivityFeed } from "@/components/discover/RealActivityFeed";
import { RealCommunityStats } from "@/components/discover/RealCommunityStats";
import { RealReadersAccordion } from "@/components/discover/RealReadersAccordion";

export default function Discover() {
  const { user } = useAuth();
  const { data, isLoading, error } = useDiscover(user?.id);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-coffee-lightest via-white to-coffee-light/30">
        <AppHeader />
        <main className="mx-auto w-full px-4 max-w-none py-6">
          <div className="mb-8">
            <h1 className="text-3xl font-serif font-medium text-coffee-darker mb-2">
              Découvrir des lecteurs
            </h1>
            <p className="text-coffee-dark font-light">
              Explorez la communauté et suivez l'activité des autres lecteurs
            </p>
          </div>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              Une erreur est survenue lors du chargement des données.
            </div>
          )}
          
          {/* Grille principale */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Colonne principale - Fil d'actualité */}
            <div className="lg:col-span-2 space-y-6">
              <RealActivityFeed 
                activities={data?.feed || []} 
                loading={isLoading} 
              />
              
              {/* Section lecteurs avec accordéon */}
              <RealReadersAccordion 
                readers={data?.readers || []} 
                loading={isLoading} 
              />
            </div>
            
            {/* Sidebar droite - Statistiques */}
            <div className="space-y-6">
              <RealCommunityStats 
                stats={data?.stats || { readers: 0, followers: 0, following: 0 }} 
                loading={isLoading} 
              />
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
