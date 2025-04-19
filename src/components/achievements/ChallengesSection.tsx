
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function ChallengesSection() {
  return (
    <Card className="border-coffee-light">
      <CardHeader>
        <CardTitle className="text-xl font-serif text-coffee-darker">Défis actuels</CardTitle>
        <CardDescription>Des défis pour vous motiver à lire plus</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="border border-coffee-light rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-medium text-coffee-darker text-lg">Lecture quotidienne</h3>
                <p className="text-sm text-muted-foreground">Lisez tous les jours pendant 7 jours consécutifs</p>
              </div>
              <div className="bg-coffee-light rounded-full px-3 py-1 text-xs font-medium text-coffee-darker">
                En cours
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progression</span>
                <span className="font-medium text-coffee-darker">5/7 jours</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-coffee-dark" style={{ width: '71.4%' }}></div>
              </div>
            </div>
          </div>

          <div className="border border-coffee-light rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-medium text-coffee-darker text-lg">Explorateur de genres</h3>
                <p className="text-sm text-muted-foreground">Lisez des livres de 3 catégories différentes</p>
              </div>
              <div className="bg-coffee-light rounded-full px-3 py-1 text-xs font-medium text-coffee-darker">
                En cours
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progression</span>
                <span className="font-medium text-coffee-darker">2/3 catégories</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-coffee-dark" style={{ width: '66.7%' }}></div>
              </div>
            </div>
          </div>

          <div className="border border-coffee-light rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-medium text-coffee-darker text-lg">Marathon de pages</h3>
                <p className="text-sm text-muted-foreground">Lisez 500 pages en un mois</p>
              </div>
              <div className="bg-coffee-light rounded-full px-3 py-1 text-xs font-medium text-coffee-darker">
                En cours
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progression</span>
                <span className="font-medium text-coffee-darker">385/500 pages</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-coffee-dark" style={{ width: '77%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
