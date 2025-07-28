
import { useState, useEffect } from "react";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EnhancedUserItem } from "./EnhancedUserItem";
import { Users, ChevronDown } from "lucide-react";
import { getDiscoverUsers, type DiscoverUser } from "@/services/user/discoverService";

export function ReadersAccordion() {
  const [users, setUsers] = useState<DiscoverUser[]>([]);
  const [visibleCount, setVisibleCount] = useState(7);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      const discoverUsers = await getDiscoverUsers();
      setUsers(discoverUsers);
      setLoading(false);
    };

    fetchUsers();
  }, []);

  const visibleUsers = users.slice(0, visibleCount);
  const hasMore = visibleCount < users.length;

  const handleShowMore = () => {
    setVisibleCount(prev => Math.min(prev + 7, users.length));
  };

  if (loading) {
    return (
      <Card className="border-coffee-light/40 bg-white/80 backdrop-blur-md shadow-sm">
        <CardHeader>
          <CardTitle className="text-h4 font-serif text-coffee-darker flex items-center gap-2">
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
        <CardTitle className="text-h4 font-serif text-coffee-darker flex items-center gap-2">
          <Users className="h-5 w-5 text-coffee-dark" />
          Lecteurs à découvrir
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible defaultValue="readers-list">
          <AccordionItem value="readers-list" className="border-coffee-light/20">
            <AccordionTrigger className="text-coffee-dark hover:text-coffee-darker font-medium">
              Voir les lecteurs ({users.length})
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 mt-4">
                {visibleUsers.map((user) => (
                  <EnhancedUserItem key={user.id} user={user} />
                ))}
                
                {hasMore && (
                  <div className="flex justify-center pt-6">
                    <Button
                      onClick={handleShowMore}
                      variant="ghost"
                      size="sm"
                      className="text-coffee-dark hover:text-coffee-darker hover:bg-coffee-light/10 transition-colors border border-coffee-light/30 bg-white/50"
                    >
                      <ChevronDown className="h-4 w-4 mr-2" />
                      Afficher plus ({users.length - visibleCount} restants)
                    </Button>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
