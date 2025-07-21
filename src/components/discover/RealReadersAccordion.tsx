
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, Award, Flame, User } from "lucide-react";
import { DiscoverReader } from "@/services/user/realDiscoverService";
import { FollowButton } from "@/components/profile/FollowButton";

interface RealReadersAccordionProps {
  readers: DiscoverReader[];
  loading?: boolean;
}

export function RealReadersAccordion({ readers, loading }: RealReadersAccordionProps) {
  if (loading) {
    return (
      <Card className="border-coffee-light/40 bg-white/80 backdrop-blur-md shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-serif text-coffee-darker flex items-center gap-2">
            <Users className="h-5 w-5 text-coffee-dark" />
            Lecteurs à découvrir
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-coffee-light/10 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-coffee-light/40 bg-white/80 backdrop-blur-md shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-serif text-coffee-darker flex items-center gap-2">
          <Users className="h-5 w-5 text-coffee-dark" />
          Lecteurs à découvrir
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible defaultValue="readers-list">
          <AccordionItem value="readers-list" className="border-coffee-light/20">
            <AccordionTrigger className="text-coffee-dark hover:text-coffee-darker font-medium">
              Voir les lecteurs ({readers.length})
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 mt-4">
                {readers.length === 0 ? (
                  <div className="text-center py-6 text-coffee-dark">
                    <Users className="h-12 w-12 mx-auto mb-4 text-coffee-light" />
                    <p>Aucun lecteur à découvrir pour le moment</p>
                  </div>
                ) : (
                  readers.map((reader) => (
                    <ReaderItem key={reader.id} reader={reader} />
                  ))
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}

function ReaderItem({ reader }: { reader: DiscoverReader }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl bg-gradient-to-r from-coffee-light/5 to-white/50 border border-coffee-light/20 hover:from-coffee-light/10 hover:to-white/70 transition-all p-4">
      {/* Section principale avec avatar et contenu */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Avatar ou icône */}
        <div className="w-10 h-10 rounded-full bg-coffee-light/20 flex items-center justify-center shrink-0 overflow-hidden">
          {reader.avatar_url ? (
            <img
              src={reader.avatar_url}
              alt={reader.username}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-coffee-dark font-medium text-sm">
              {reader.username?.slice(0, 2).toUpperCase() || "??"}
            </span>
          )}
        </div>

        {/* Contenu principal */}
        <div className="min-w-0 flex-1">
          <h4 className="font-medium text-coffee-darker truncate">{reader.username}</h4>
          
          {/* Jauges stats */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-coffee-dark">
            <span className="flex items-center gap-1 whitespace-nowrap">
              <BookOpen className="h-3 w-3" />
              {reader.in_progress} en cours
            </span>
            <span className="flex items-center gap-1 whitespace-nowrap">
              <Award className="h-3 w-3" />
              {reader.badges} badges
            </span>
            <span className="flex items-center gap-1 whitespace-nowrap">
              <Flame className="h-3 w-3" />
              {reader.streak} j
            </span>
          </div>
        </div>
      </div>

      {/* Bouton suivre */}
      <div className="flex justify-end sm:justify-start shrink-0">
        <FollowButton 
          targetUserId={reader.id}
          onFollowChange={() => {
            // Optionnel: rafraîchir la liste si nécessaire
            console.log(`Follow status changed for ${reader.username}`);
          }}
        />
      </div>
    </div>
  );
}
