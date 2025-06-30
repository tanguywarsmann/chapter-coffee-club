
import { useState } from "react";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EnhancedUserItem } from "./EnhancedUserItem";
import { Users } from "lucide-react";

// Données fictives pour les lecteurs
const mockReaders = [
  {
    id: "reader1",
    name: "Marie Dubois",
    avatar: "/placeholder.svg",
    stats: { booksReading: 2, badges: 15, streak: 12 },
    isFollowing: false
  },
  {
    id: "reader2",
    name: "Thomas Martin",
    avatar: "/placeholder.svg",
    stats: { booksReading: 1, badges: 8, streak: 5 },
    isFollowing: true
  },
  {
    id: "reader3",
    name: "Sophie Chen",
    avatar: "/placeholder.svg",
    stats: { booksReading: 3, badges: 22, streak: 18 },
    isFollowing: false
  },
  {
    id: "reader4",
    name: "Alexandre Petit",
    avatar: "/placeholder.svg",
    stats: { booksReading: 1, badges: 12, streak: 7 },
    isFollowing: false
  },
  {
    id: "reader5",
    name: "Emma Rodriguez",
    avatar: "/placeholder.svg",
    stats: { booksReading: 2, badges: 9, streak: 3 },
    isFollowing: true
  },
  {
    id: "reader6",
    name: "Lucas Dubois",
    avatar: "/placeholder.svg",
    stats: { booksReading: 1, badges: 18, streak: 15 },
    isFollowing: false
  },
  {
    id: "reader7",
    name: "Camille Moreau",
    avatar: "/placeholder.svg",
    stats: { booksReading: 4, badges: 14, streak: 9 },
    isFollowing: false
  }
];

export function ReadersAccordion() {
  const [searchQuery, setSearchQuery] = useState("");
  
  const filteredReaders = mockReaders.filter(reader =>
    reader.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card className="border-coffee-light bg-white/70 backdrop-blur-md">
      <CardHeader>
        <CardTitle className="text-lg font-serif text-coffee-darker flex items-center gap-2">
          <Users className="h-5 w-5 text-coffee-dark" />
          Lecteurs à découvrir
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible defaultValue="readers-list">
          <AccordionItem value="readers-list" className="border-coffee-light/30">
            <AccordionTrigger className="text-coffee-dark hover:text-coffee-darker font-medium">
              Voir les lecteurs ({filteredReaders.length})
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 mt-4">
                {filteredReaders.map((reader) => (
                  <EnhancedUserItem key={reader.id} user={reader} />
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
