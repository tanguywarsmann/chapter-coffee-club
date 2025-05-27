
import { useEffect, useState } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { Suspense, lazy } from "react";
import { AuthGuard } from "../auth/AuthGuard";
import { PageTransition } from "@/components/ui/page-transition";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import { usePrefetch } from "@/hooks/usePrefetch";
import Home from "@/pages/Home";
import Auth from "@/pages/Auth";
import Login from "@/pages/Login";

// Non-critical components loaded with React.lazy
const BookPage = lazy(() => import("@/pages/BookPage"));
const Profile = lazy(() => import("@/pages/Profile"));
const PublicProfilePage = lazy(() => import("@/pages/PublicProfilePage"));
const Discover = lazy(() => import("@/pages/Discover"));
const ReadingList = lazy(() => import("@/pages/ReadingList"));
const Explore = lazy(() => import("@/pages/Explore"));
const Achievements = lazy(() => import("@/pages/Achievements"));
const Admin = lazy(() => import("@/pages/Admin"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const Followers = lazy(() => import("@/pages/Followers"));

// Fallbacks optimisés pour chaque type de page
const HomeFallback = () => <PageSkeleton variant="home" />;
const ListFallback = () => <PageSkeleton variant="list" />;
const ProfileFallback = () => <PageSkeleton variant="profile" />;
const BookFallback = () => <PageSkeleton variant="book" />;
const GenericFallback = () => <PageSkeleton />;

// Loading général amélioré
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-logo-background transition-opacity duration-300">
    <div className="text-center space-y-4">
      <div className="relative">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-coffee-dark mx-auto"></div>
        <div className="absolute inset-0 rounded-full h-12 w-12 border-2 border-coffee-light/30 mx-auto"></div>
      </div>
      <p className="text-coffee-dark font-medium">Chargement...</p>
    </div>
  </div>
);

export function AppRouter() {
  const { user, isLoading, isInitialized } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDocumentReady, setIsDocumentReady] = useState(document.readyState === "complete");

  // Active le prefetch intelligent
  usePrefetch();

  // Log AppRouter state for debugging
  console.info("[APP ROUTER] State:", {
    currentPath: location.pathname,
    isLoading,
    isInitialized,
    hasUser: !!user,
    userId: user?.id,
    isDocumentReady,
    readyState: document.readyState
  });

  // Check for document ready state
  useEffect(() => {
    if (document.readyState !== "complete") {
      const handleDocumentReady = () => {
        console.info("[APP ROUTER] Document fully loaded");
        setIsDocumentReady(true);
      };
      window.addEventListener("load", handleDocumentReady);
      return () => window.removeEventListener("load", handleDocumentReady);
    }
  }, []);

  // Central navigation logic
  useEffect(() => {
    // Only perform navigation when all conditions are met
    if (!isLoading && isInitialized && isDocumentReady) {
      const allowed = ["/", "/home", "/auth", "/discover", "/explore", "/reading-list"];
      
      // Check if current path is allowed
      const isAllowedPath = allowed.some(path => 
        location.pathname === path || 
        location.pathname.startsWith(path + "/") ||
        location.pathname.startsWith("/books/") ||
        location.pathname.startsWith("/profile/") ||
        location.pathname.startsWith("/u/") ||
        location.pathname.startsWith("/followers/") ||
        location.pathname.startsWith("/achievements") ||
        location.pathname.startsWith("/admin")
      );
      
      if (!isAllowedPath) {
        const target = "/";
        console.info("[ROUTER] redirect →", target, "(path not in whitelist)");
        navigate(target, { replace: true });
        return;
      }
      
      console.info("[ROUTER] accept", location.pathname);
      
      // Navigate to auth if no user and not on auth/root
      if (!user && location.pathname !== "/auth" && location.pathname !== "/") {
        const target = "/auth";
        console.info("[ROUTER] redirect →", target, "(no authenticated user)");
        navigate(target, { replace: true });
        return;
      }
      
      // Navigate to home if user is at root
      if (user && location.pathname === "/") {
        const target = "/home";
        console.info("[ROUTER] redirect →", target, "(authenticated at root)");
        navigate(target, { replace: true });
        return;
      }
    }
  }, [user, isLoading, isInitialized, isDocumentReady, location.pathname, navigate]);

  // Show loading until all conditions are met
  if (isLoading || !isInitialized || !isDocumentReady) {
    return <LoadingFallback />;
  }

  // Render routes when ready avec transitions
  return (
    <PageTransition key={location.pathname}>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/auth" element={<Auth />} />
        
        {/* Protected routes - require AuthGuard */}
        <Route path="/home" element={
          <AuthGuard>
            <Home />
          </AuthGuard>
        } />
        
        {/* Routes with lazy loading */}
        <Route path="/books/:id" element={
          <AuthGuard>
            <Suspense fallback={<BookFallback />}>
              <BookPage />
            </Suspense>
          </AuthGuard>
        } />
        
        <Route path="/profile/:userId?" element={
          <AuthGuard>
            <Suspense fallback={<ProfileFallback />}>
              <Profile />
            </Suspense>
          </AuthGuard>
        } />
        
        <Route path="/u/:userId" element={
          <AuthGuard>
            <Suspense fallback={<ProfileFallback />}>
              <PublicProfilePage />
            </Suspense>
          </AuthGuard>
        } />
        
        <Route path="/discover" element={
          <AuthGuard>
            <Suspense fallback={<ListFallback />}>
              <Discover />
            </Suspense>
          </AuthGuard>
        } />
        
        <Route path="/reading-list" element={
          <AuthGuard>
            <Suspense fallback={<ListFallback />}>
              <ReadingList />
            </Suspense>
          </AuthGuard>
        } />
        
        <Route path="/explore" element={
          <AuthGuard>
            <Suspense fallback={<ListFallback />}>
              <Explore />
            </Suspense>
          </AuthGuard>
        } />
        
        <Route path="/achievements" element={
          <AuthGuard>
            <Suspense fallback={<GenericFallback />}>
              <Achievements />
            </Suspense>
          </AuthGuard>
        } />
        
        <Route path="/followers/:type/:userId?" element={
          <AuthGuard>
            <Suspense fallback={<ListFallback />}>
              <Followers />
            </Suspense>
          </AuthGuard>
        } />
        
        <Route path="/admin" element={
          <AuthGuard>
            <Suspense fallback={<GenericFallback />}>
              <Admin />
            </Suspense>
          </AuthGuard>
        } />
        
        <Route path="*" element={
          <Suspense fallback={<GenericFallback />}>
            <NotFound />
          </Suspense>
        } />
      </Routes>
    </PageTransition>
  );
}

export default { AppRouter };
