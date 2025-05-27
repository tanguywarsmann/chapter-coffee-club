
import { useEffect, useState } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { Suspense, lazy } from "react";
import { AuthGuard } from "../auth/AuthGuard";
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

// Simplified loading fallback for better performance
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-logo-background">
    <div className="text-center">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-coffee-dark mx-auto mb-4"></div>
      <p className="text-coffee-dark">Chargement...</p>
    </div>
  </div>
);

export function AppRouter() {
  const { user, isLoading, isInitialized } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDocumentReady, setIsDocumentReady] = useState(document.readyState === "complete");

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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-coffee-dark mx-auto mb-4" />
          <p className="text-muted-foreground">
            Initialisation de l'application...
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            {!isInitialized ? "Chargement de l'authentification..." : 
             !isDocumentReady ? "Chargement des ressources..." : 
             "Vérification de la session..."}
          </p>
        </div>
      </div>
    );
  }

  // Render routes when ready
  return (
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
          <Suspense fallback={<LoadingFallback />}>
            <BookPage />
          </Suspense>
        </AuthGuard>
      } />
      
      <Route path="/profile/:userId?" element={
        <AuthGuard>
          <Suspense fallback={<LoadingFallback />}>
            <Profile />
          </Suspense>
        </AuthGuard>
      } />
      
      <Route path="/u/:userId" element={
        <AuthGuard>
          <Suspense fallback={<LoadingFallback />}>
            <PublicProfilePage />
          </Suspense>
        </AuthGuard>
      } />
      
      <Route path="/discover" element={
        <AuthGuard>
          <Suspense fallback={<LoadingFallback />}>
            <Discover />
          </Suspense>
        </AuthGuard>
      } />
      
      <Route path="/reading-list" element={
        <AuthGuard>
          <Suspense fallback={<LoadingFallback />}>
            <ReadingList />
          </Suspense>
        </AuthGuard>
      } />
      
      <Route path="/explore" element={
        <AuthGuard>
          <Suspense fallback={<LoadingFallback />}>
            <Explore />
          </Suspense>
        </AuthGuard>
      } />
      
      <Route path="/achievements" element={
        <AuthGuard>
          <Suspense fallback={<LoadingFallback />}>
            <Achievements />
          </Suspense>
        </AuthGuard>
      } />
      
      <Route path="/followers/:type/:userId?" element={
        <AuthGuard>
          <Suspense fallback={<LoadingFallback />}>
            <Followers />
          </Suspense>
        </AuthGuard>
      } />
      
      <Route path="/admin" element={
        <AuthGuard>
          <Suspense fallback={<LoadingFallback />}>
            <Admin />
          </Suspense>
        </AuthGuard>
      } />
      
      <Route path="*" element={
        <Suspense fallback={<LoadingFallback />}>
          <NotFound />
        </Suspense>
      } />
    </Routes>
  );
}

export default { AppRouter };
