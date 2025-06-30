
import { useEffect, useState } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ActivityFeed } from "@/components/discover/ActivityFeed";
import { CommunityStats } from "@/components/discover/CommunityStats";
import { ReadersAccordion } from "@/components/discover/ReadersAccordion";

export default function Discover() {
  const { user } = useAuth();

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
              
              {/* Section lecteurs avec accordéon */}
              <ReadersAccordion />
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
