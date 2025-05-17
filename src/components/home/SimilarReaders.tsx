
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { useIsMobile } from '@/hooks/use-mobile';

interface SimilarReader {
  id: string;
  name: string;
  avatar?: string;
  matchPercentage: number;
  commonInterests: string[];
}

export default function SimilarReaders() {
  const [readers, setReaders] = useState<SimilarReader[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const isMobile = useIsMobile();
  
  // If mobile, don't even try to load this component
  if (isMobile) {
    return null;
  }

  useEffect(() => {
    // Simulation of loading similar readers
    // In a future version, this will be connected to a real service
    const loadReaders = async () => {
      setLoading(true);
      try {
        // This is a placeholder for the future similar readers service
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Test data
        setReaders([
          {
            id: "user-1",
            name: "Marie L.",
            matchPercentage: 85,
            commonInterests: ["Philosophy", "Novels"]
          },
          {
            id: "user-2",
            name: "Thomas K.",
            matchPercentage: 72,
            commonInterests: ["Science Fiction", "Classics"]
          }
        ]);
      } catch (error) {
        console.error("Error loading similar readers:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      loadReaders();
    }
  }, [user?.id]);

  if (!user) return null;
  
  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-serif">Similar Readers</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent>
          {[1, 2].map(i => (
            <div key={i} className="flex items-center gap-3 mb-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (readers.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-serif">Similar Readers</CardTitle>
          <CardDescription>Discover people with similar tastes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">
              Continue reading to discover readers with similar tastes
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-serif">Similar Readers</CardTitle>
        <CardDescription>Based on your recent readings</CardDescription>
      </CardHeader>
      <CardContent>
        {readers.map(reader => (
          <div key={reader.id} className="flex items-start space-x-3 mb-4 last:mb-0">
            <Avatar>
              <AvatarImage src={reader.avatar ?? ""} />
              <AvatarFallback>{reader.name.substring(0, 2)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center">
                <span className="text-sm font-medium">{reader.name}</span>
                <span className="ml-2 text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded-full">
                  {reader.matchPercentage}% match
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {reader.commonInterests.join(' · ')}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
