
import { Book } from "@/types/book";
import { BookGrid } from "@/components/books/BookGrid";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface FeaturedBooksProps {
  recentlyAdded: Book[];
  popular: Book[];
  recommended: Book[];
}

export function FeaturedBooks({ recentlyAdded, popular, recommended }: FeaturedBooksProps) {
  return (
    <Card className="border-coffee-light">
      <CardHeader>
        <CardTitle className="text-h4 font-serif text-coffee-darker">Découvrir des livres</CardTitle>
        <CardDescription>Explorer notre catalogue pour trouver votre prochaine lecture</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="recommended">
          <TabsList className="mb-4 bg-muted border-coffee-light">
            <TabsTrigger value="recommended" className="data-[state=active]:bg-coffee-dark data-[state=active]:text-white">
              Recommandés
            </TabsTrigger>
            <TabsTrigger value="popular" className="data-[state=active]:bg-coffee-dark data-[state=active]:text-white">
              Populaires
            </TabsTrigger>
            <TabsTrigger value="recent" className="data-[state=active]:bg-coffee-dark data-[state=active]:text-white">
              Nouveautés
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="recommended">
            <BookGrid books={recommended} />
          </TabsContent>
          
          <TabsContent value="popular">
            <BookGrid books={popular} />
          </TabsContent>
          
          <TabsContent value="recent">
            <BookGrid books={recentlyAdded} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
