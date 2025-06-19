import { useEffect, useState } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Suspense, lazy } from "react";
import { AuthGuard } from "../auth/AuthGuard";
import { PageTransition } from "@/components/ui/page-transition";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import { usePrefetch } from "@/hooks/usePrefetch";
import Home from "@/pages/Home";
import Auth from "@/pages/Auth";
import Login from "@/pages/Login";
import ResetPassword from "@/pages/ResetPassword";

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

const HomeFallback = () => <PageSkeleton variant="home" />;
const ListFallback = () => <PageSkeleton variant="list" />;
const ProfileFallback = () => <PageSkeleton variant="profile" />;
const BookFallback = () => <PageSkeleton variant="book" />;
const GenericFallback = () => <PageSkeleton />;

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

  // Check for document ready state
  useEffect(() => {
    if (document.readyState !== "complete") {
      const handleDocumentReady = () => {
        setIsDocumentReady(true);
      };
      window.addEventListener("load", handleDocumentReady);
      return () => window.removeEventListener("load", handleDocumentReady);
    }
  }, []);

  // Central navigation logic
  useEffect(() => {
    if (!isLoading && isInitialized && isDocumentReady) {
      // Ne pas rediriger si on est sur une page de livre, d'auth ou de reset password
      if (location.pathname.startsWith("/books/") || 
          location.pathname === "/auth" || 
          location.pathname === "/" ||
          location.pathname === "/reset-password") {
        return;
      }
      
      const allowed = ["/home", "/discover", "/explore", "/reading-list", "/profile"];
      
      const isAllowedPath = allowed.some(path => 
        location.pathname === path || 
        location.pathname.startsWith(path + "/") ||
        location.pathname.startsWith("/u/") ||
        location.pathname.startsWith("/followers/") ||
        location.pathname.startsWith("/achievements") ||
        location.pathname.startsWith("/admin")
      );
      
      if (!isAllowedPath) {
        const target = "/";
        navigate(target, { replace: true });
        return;
      }
      
      if (!user && !location.pathname.startsWith("/books/")) {
        const target = "/auth";
        navigate(target, { replace: true });
        return;
      }
      
      if (user && location.pathname === "/") {
        const target = "/home";
        navigate(target, { replace: true });
        return;
      }
    }
  }, [user, isLoading, isInitialized, isDocumentReady, location.pathname, navigate]);

  if (isLoading || !isInitialized || !isDocumentReady) {
    return <LoadingFallback />;
  }

  return (
    <PageTransition key={location.pathname}>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/reset-password" element={
          <Suspense fallback={<GenericFallback />}>
            <ResetPassword />
          </Suspense>
        } />
        
        <Route path="/home" element={
          <AuthGuard>
            <Home />
          </AuthGuard>
        } />
        
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
