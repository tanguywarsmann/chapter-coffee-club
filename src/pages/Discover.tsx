
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
      <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-background via-background to-primary/5">
        <FloatingBookStacks />
        <CursorTrail />
        <ExplorationOrb />
        <AppHeader />
        <main className="mx-auto w-full px-4 max-w-7xl py-8">
          {/* Hero Section Premium */}
          <div className="mb-10 relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary/5 via-background to-primary/8 p-10 md:p-14 border border-primary/10 shadow-[0_8px_32px_-12px_rgba(166,123,91,0.18)] backdrop-blur-xl">
            {/* Effet de profondeur en arrière-plan */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(166,123,91,0.08),transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(166,123,91,0.06),transparent_50%)]" />
            
            <div className="relative z-10">
              <h1 className="text-4xl md:text-6xl font-bold font-serif bg-gradient-to-br from-foreground via-foreground to-primary/90 bg-clip-text text-transparent mb-4 animate-fade-in tracking-tight">
                {t.discover.title}
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground font-light max-w-2xl mx-auto leading-relaxed">
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
