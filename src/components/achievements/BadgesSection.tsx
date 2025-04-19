
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BadgeGrid } from "./BadgeGrid";
import { getUserBadges } from "@/mock/badges";
import { Badge } from "@/types/badge";

const lockedBadges: Omit<Badge, "dateEarned">[] = [
  {
    id: "locked1",
    name: "Lecteur Assidu",
    description: "Lire pendant 30 jours consécutifs",
    icon: "🔥",
    color: "orange-100"
  },
  {
    id: "locked2",
    name: "Explorateur Littéraire",
    description: "Lire des livres dans 5 catégories différentes",
    icon: "🧭",
    color: "blue-100"
  },
  {
    id: "locked3",
    name: "Marathonien",
    description: "Lire 10 livres en un mois",
    icon: "🏃",
    color: "green-100"
  },
  {
    id: "locked4",
    name: "Expert en Classiques",
    description: "Lire 10 classiques de la littérature",
    icon: "📜",
    color: "coffee-light"
  },
  {
    id: "locked5",
    name: "Lecteur Nocturne",
    description: "Lire plus de 3 heures après 22h",
    icon: "🌙",
    color: "purple-100"
  }
];

export function BadgesSection() {
  const badges = getUserBadges();

  return (
    <Card className="border-coffee-light">
      <CardHeader>
        <CardTitle className="text-xl font-serif text-coffee-darker">Badges</CardTitle>
        <CardDescription>Collectionnez des badges en relevant des défis de lecture</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="earned">
          <TabsList className="mb-6 bg-muted border-coffee-light">
            <TabsTrigger value="earned" className="data-[state=active]:bg-coffee-dark data-[state=active]:text-white">
              Badges obtenus ({badges.length})
            </TabsTrigger>
            <TabsTrigger value="locked" className="data-[state=active]:bg-coffee-dark data-[state=active]:text-white">
              À débloquer ({lockedBadges.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="earned">
            <BadgeGrid badges={badges} />
          </TabsContent>
          
          <TabsContent value="locked">
            <BadgeGrid badges={lockedBadges} isLocked />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
