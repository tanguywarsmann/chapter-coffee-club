
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, BookOpen, Award, Flame, User, Plus } from "lucide-react";
import { DiscoverReader } from "@/services/user/realDiscoverService";

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
    <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-coffee-light/5 to-white/50 border border-coffee-light/20 hover:from-coffee-light/10 hover:to-white/70 transition-all p-4">
      {/* Avatar ou icône */}
      {reader.avatar_url ? (
        <img
          src={reader.avatar_url}
          alt={reader.username}
          className="w-10 h-10 rounded-full bg-coffee-light/20 object-cover shrink-0"
        />
      ) : (
        <User className="w-8 h-8 text-coffee-dark/50 shrink-0" />
      )}

      {/* Contenu principal */}
      <div className="min-w-0 flex-1">
        <h4 className="font-medium text-coffee-darker truncate">{reader.username}</h4>
        
        {/* Jauges stats */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-coffee-dark whitespace-nowrap">
          <span className="flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            {reader.in_progress} en cours
          </span>
          <span className="flex items-center gap-1">
            <Award className="h-3 w-3" />
            {reader.badges} badges
          </span>
          <span className="flex items-center gap-1">
            <Flame className="h-3 w-3" />
            {reader.streak} j
          </span>
        </div>
      </div>

      {/* Bouton suivre */}
      <Button 
        variant="outline" 
        size="sm"
        className="border-coffee-light/30 text-coffee-dark hover:bg-coffee-light/10 hover:text-coffee-darker shrink-0 px-3"
        aria-label="Suivre"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}
