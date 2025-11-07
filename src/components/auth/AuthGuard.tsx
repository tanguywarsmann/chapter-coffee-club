
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const navigate = useNavigate();
  const { user, isLoading, isInitialized } = useAuth();

  // Redirect immediately if not authenticated
  useEffect(() => {
    if (isInitialized && !isLoading && !user) {
      navigate('/auth', { replace: true });
    }
  }, [isInitialized, isLoading, user, navigate]);

  // P1-6: Block all rendering until fully initialized AND user is confirmed
  // Use skeleton instead of spinner to prevent flash and match page layouts
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="h-16 bg-white border-b border-border" /> {/* Header skeleton */}
        <div className="mx-auto w-full px-4 max-w-none py-8 space-y-6">
          <Card className="max-w-4xl mx-auto">
            <CardContent className="p-6">
              <div className="space-y-4">
                <Skeleton className="h-10 w-3/4" shimmer />
                <Skeleton className="h-6 w-1/2" shimmer />
                <Skeleton className="h-32 w-full" shimmer />
                <Skeleton className="h-32 w-full" shimmer />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // If initialized but no user, show minimal skeleton while redirecting
  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <div className="h-16 bg-white border-b border-border" />
        <div className="mx-auto w-full px-4 max-w-none py-8">
          <Card className="max-w-4xl mx-auto">
            <CardContent className="p-6">
              <Skeleton className="h-10 w-48 mx-auto" shimmer />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Only render children when we have a confirmed authenticated user
  return <>{children}</>;
}
