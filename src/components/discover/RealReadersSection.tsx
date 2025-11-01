
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, Award, Flame } from "lucide-react";
import { DiscoverReader } from "@/services/user/realDiscoverService";
import { FollowButton } from "@/components/profile/FollowButton";
import { EnhancedAvatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

interface RealReadersSectionProps {
  readers: DiscoverReader[];
  loading?: boolean;
}

export function RealReadersSection({ readers, loading }: RealReadersSectionProps) {
  const [visibleCount, setVisibleCount] = useState(6);
  const visibleReaders = readers.slice(0, visibleCount);
  const hasMore = visibleCount < readers.length;

  if (loading) {
    return (
      <Card className="border-coffee-light/40 bg-white/80 backdrop-blur-md shadow-sm">
        <CardHeader className="bg-gradient-to-r from-coffee-light/10 to-transparent">
          <CardTitle className="text-h3 font-serif text-coffee-darker flex items-center gap-2">
            <Users className="h-6 w-6 text-coffee-dark" />
            Lecteurs à découvrir
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-40 bg-coffee-light/10 rounded-xl animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-coffee-light/40 bg-white/80 backdrop-blur-md shadow-sm">
      <CardHeader className="bg-gradient-to-r from-coffee-light/10 to-transparent">
        <CardTitle className="text-h3 font-serif text-coffee-darker flex items-center gap-2">
          <Users className="h-6 w-6 text-coffee-dark" />
          Lecteurs à découvrir
        </CardTitle>
        <p className="text-coffee-dark/70 text-body-sm font-light mt-1">
          {readers.length} lecteur{readers.length > 1 ? 's' : ''} actif{readers.length > 1 ? 's' : ''}
        </p>
      </CardHeader>
      <CardContent className="p-6">
        {readers.length === 0 ? (
          <div className="text-center py-12 text-coffee-dark">
            <div className="mx-auto w-20 h-20 mb-6 rounded-full bg-gradient-to-br from-coffee-light/30 to-coffee-medium/20 flex items-center justify-center">
              <Users className="h-10 w-10 text-coffee-medium" />
            </div>
            <p className="text-lg font-medium text-coffee-darker mb-2">Aucun lecteur à découvrir</p>
            <p className="text-body-sm text-coffee-dark/70">
              Revenez bientôt pour découvrir de nouveaux lecteurs
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {visibleReaders.map((reader, index) => (
                <ReaderCard key={reader.id} reader={reader} index={index} />
              ))}
            </div>
            
            {hasMore && (
              <div className="mt-6 text-center">
                <button
                  onClick={() => setVisibleCount(prev => Math.min(prev + 6, readers.length))}
                  className="px-6 py-3 rounded-full bg-gradient-to-r from-coffee-medium to-coffee-dark text-white font-medium hover:shadow-lg hover:scale-105 transition-all"
                >
                  Voir plus de lecteurs ({readers.length - visibleCount} restants)
                </button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function ReaderCard({ reader, index }: { reader: DiscoverReader; index: number }) {
  return (
    <div 
      className="group relative flex flex-col gap-4 rounded-2xl bg-gradient-to-br from-white via-coffee-lightest/30 to-coffee-light/10 border border-coffee-light/30 hover:border-coffee-medium/40 p-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-fade-in"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* En-tête avec avatar et bouton suivre */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <EnhancedAvatar
            src={reader.avatar_url ?? undefined}
            alt={reader.username}
            fallbackText={reader.username}
            size="lg"
            className="border-2 border-coffee-light/30 group-hover:border-coffee-medium/50 transition-colors ring-2 ring-white/50"
          />
          
          <div className="min-w-0 flex-1">
            <h4 className="font-semibold text-lg text-coffee-darker truncate group-hover:text-coffee-dark transition-colors">
              {reader.username}
            </h4>
          </div>
        </div>
        
        <FollowButton 
          targetUserId={reader.id}
          onFollowChange={() => {
            console.log(`Follow status changed for ${reader.username}`);
          }}
        />
      </div>

      {/* Stats sous forme de badges colorés */}
      <div className="flex flex-wrap gap-2">
        <Badge 
          variant="secondary" 
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 transition-colors"
        >
          <BookOpen className="h-4 w-4" />
          <span className="font-semibold">{reader.in_progress}</span>
          <span className="text-xs">en cours</span>
        </Badge>
        
        <Badge 
          variant="secondary" 
          className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 transition-colors"
        >
          <Award className="h-4 w-4" />
          <span className="font-semibold">{reader.badges}</span>
          <span className="text-xs">badges</span>
        </Badge>
        
        <Badge 
          variant="secondary" 
          className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100 transition-colors"
        >
          <Flame className="h-4 w-4" />
          <span className="font-semibold">{reader.streak}</span>
          <span className="text-xs">jours</span>
        </Badge>
      </div>
    </div>
  );
}
