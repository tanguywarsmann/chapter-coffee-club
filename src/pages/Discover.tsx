
import { AppHeader } from "@/components/layout/AppHeader";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/i18n/LanguageContext";
import { useDiscover } from "@/hooks/useDiscover";
import { RealActivityFeed } from "@/components/discover/RealActivityFeed";
import { RealCommunityStats } from "@/components/discover/RealCommunityStats";
import { RealReadersSection } from "@/components/discover/RealReadersSection";

export default function Discover() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { data, isLoading, error } = useDiscover(user?.id);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-coffee-lightest via-white to-coffee-light/30">
        <AppHeader />
        <main className="mx-auto w-full px-4 max-w-7xl py-6">
          {/* Hero Section */}
          <div className="mb-12 text-center relative overflow-hidden rounded-3xl bg-gradient-to-br from-coffee-medium/10 via-coffee-light/20 to-amber-50/30 p-8 md:p-12 border border-coffee-light/30 shadow-lg">
            <div className="relative z-10">
              <h1 className="text-h1 md:text-hero font-bold font-serif text-coffee-darker mb-4 animate-fade-in">
                {t.discover.title}
              </h1>
              <p className="text-body-lg md:text-h4 text-coffee-dark font-light max-w-2xl mx-auto">
                {t.discover.subtitle}
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {t.discover.error}
            </div>
          )}

          {/* Grille principale avec optimisation ordre mobile */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sidebar droite - Statistiques (première sur mobile) */}
            <div className="space-y-6 lg:order-2">
              <RealCommunityStats
                stats={data?.stats || { readers: 0, followers: 0, following: 0 }}
                loading={isLoading}
              />
            </div>

            {/* Colonne principale - Fil d'actualité (deuxième sur mobile) */}
            <div className="lg:col-span-2 lg:order-1 space-y-6">
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
