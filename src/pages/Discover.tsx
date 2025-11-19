
import { AppHeader } from "@/components/layout/AppHeader";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/i18n/LanguageContext";
import { useDiscover } from "@/hooks/useDiscover";
import { RealActivityFeed } from "@/components/discover/RealActivityFeed";
import { RealCommunityStats } from "@/components/discover/RealCommunityStats";
import { RealReadersSection } from "@/components/discover/RealReadersSection";
import { FloatingBookStacks } from "@/components/discover/FloatingBookStacks";
import { CursorTrail } from "@/components/discover/CursorTrail";
import { ExplorationOrb } from "@/components/discover/ExplorationOrb";

export default function Discover() {
  const { user, isInitialized, isLoading: isAuthLoading } = useAuth();
  const { t } = useTranslation();
  const { data, isLoading, error } = useDiscover(user?.id, isInitialized);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <FloatingBookStacks />
        <CursorTrail />
        <ExplorationOrb />
        <AppHeader />
        <main className="max-w-6xl mx-auto px-4 py-8 md:py-12 space-y-8">
          {/* Hero Section Premium */}
          <div className="mb-10">
            <div className="relative z-10">
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-coffee-darker mb-4 animate-fade-in tracking-tight">
                {t.discover.title}
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground font-light max-w-2xl leading-relaxed">
                {t.discover.subtitle}
              </p>
            </div>
          </div>
          
          {error && (
            <div className="mb-6 p-5 bg-destructive/10 border border-destructive/30 rounded-2xl text-destructive backdrop-blur-sm">
              {t.discover.error}
            </div>
          )}
          
          {/* Grille principale avec optimisation ordre mobile */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sidebar droite - Statistiques (première sur mobile) */}
            <div className="space-y-8 lg:order-2">
              <RealCommunityStats 
                stats={data?.stats || { readers: 0, followers: 0, following: 0 }} 
                loading={isLoading} 
              />
            </div>
            
            {/* Colonne principale - Fil d'actualité (deuxième sur mobile) */}
            <div className="lg:col-span-2 lg:order-1 space-y-8">
              <RealActivityFeed 
                activities={data?.feed || []} 
                loading={isLoading} 
              />
              
              {/* Section lecteurs - plus d'accordéon */}
              <RealReadersSection 
                readers={data?.readers || []} 
                loading={isLoading} 
              />
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
