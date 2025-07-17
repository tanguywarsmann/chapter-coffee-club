
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, BookOpen, Award, Flame } from "lucide-react";
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
    <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-coffee-light/5 to-white/50 border border-coffee-light/20 hover:from-coffee-light/10 hover:to-white/70 transition-all">
      <div className="flex items-center space-x-3">
        <img
          src={reader.avatar_url}
          alt={reader.username}
          className="w-12 h-12 rounded-full bg-coffee-light/20"
        />
        <div>
          <h4 className="font-medium text-coffee-darker">{reader.username}</h4>
          <div className="flex items-center space-x-4 text-sm text-coffee-dark">
            <div className="flex items-center space-x-1">
              <BookOpen className="h-4 w-4" />
              <span>{reader.in_progress} en cours</span>
            </div>
            <div className="flex items-center space-x-1">
              <Award className="h-4 w-4" />
              <span>{reader.badges} badges</span>
            </div>
            <div className="flex items-center space-x-1">
              <Flame className="h-4 w-4" />
              <span>{reader.streak} jours</span>
            </div>
          </div>
        </div>
      </div>
      <Button 
        variant="outline" 
        size="sm"
        className="border-coffee-light/30 text-coffee-dark hover:bg-coffee-light/10 hover:text-coffee-darker"
      >
        Suivre
      </Button>
    </div>
  );
}
