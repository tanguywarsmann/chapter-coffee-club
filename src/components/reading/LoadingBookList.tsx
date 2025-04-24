
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function LoadingBookList() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container py-6 space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-serif font-medium text-coffee-darker">Ma liste de lecture</h1>
        </div>
        <Card className="border-coffee-light">
          <CardHeader>
            <Skeleton className="h-7 w-52" />
            <Skeleton className="h-4 w-40" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-64 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
