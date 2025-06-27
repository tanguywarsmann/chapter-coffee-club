
import { useEffect, useState } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Suspense, lazy } from "react";
import { AuthGuard } from "../auth/AuthGuard";
import { PageTransition } from "@/components/ui/page-transition";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppFooter } from "@/components/layout/AppFooter";
import { usePrefetch } from "@/hooks/usePrefetch";
import { isPublicRoute, requiresAuth } from "@/utils/publicRoutes";
import Home from "@/pages/Home";
import Auth from "@/pages/Auth";
import ResetPassword from "@/pages/ResetPassword";
import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";
import PublicHome from "@/pages/PublicHome";

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
const Landing = lazy(() => import("@/pages/Landing"));

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

  // Navigation logic - improved with public/private route handling
  useEffect(() => {
    if (!isLoading && isInitialized && isDocumentReady) {
      const currentPath = location.pathname;
      
      // Ne pas rediriger si on est sur une route publique
      if (isPublicRoute(currentPath)) {
        return;
      }
      
      // Si l'utilisateur n'est pas connecté et tente d'accéder à une route privée
      if (!user && requiresAuth(currentPath)) {
        navigate("/auth", { replace: true });
        return;
      }
      
      // Si l'utilisateur est connecté et sur la page d'accueil, rediriger vers /home
      if (user && currentPath === "/") {
        navigate("/home", { replace: true });
        return;
      }
    }
  }, [user, isLoading, isInitialized, isDocumentReady, location.pathname, navigate]);

  // Détermine si on affiche la version publique ou privée
  const isPublic = isPublicRoute(location.pathname);
  
  // Pour les routes publiques - avec PublicLayout qui gère son propre header
  if (isPublic) {
    return (
      <PageTransition key={location.pathname}>
        <Routes>          
          <Route path="/" element={
            <PublicLayout>
              <PublicHome />
            </PublicLayout>
          } />
          
          <Route path="/landing" element={
            <PublicLayout>
              <Suspense fallback={<GenericFallback />}>
                <Landing />
              </Suspense>
            </PublicLayout>
          } />
          
          <Route path="/auth" element={
            <PublicLayout>
              <Auth />
            </PublicLayout>
          } />
          
          <Route path="/reset-password" element={
            <PublicLayout>
              <Suspense fallback={<GenericFallback />}>
                <ResetPassword />
              </Suspense>
            </PublicLayout>
          } />
          
          <Route path="/blog" element={
            <PublicLayout>
              <Blog />
            </PublicLayout>
          } />
          
          <Route path="/blog/:slug" element={
            <PublicLayout>
              <BlogPost />
            </PublicLayout>
          } />
          
          <Route path="/books/:id" element={
            <PublicLayout>
              <Suspense fallback={<BookFallback />}>
                <BookPage />
              </Suspense>
            </PublicLayout>
          } />
          
          <Route path="*" element={
            <PublicLayout>
              <Suspense fallback={<GenericFallback />}>
                <NotFound />
              </Suspense>
            </PublicLayout>
          } />
        </Routes>
      </PageTransition>
    );
  }

  // Pour les routes privées, vérifier l'authentification
  if (isLoading || !isInitialized || !isDocumentReady) {
    return <LoadingFallback />;
  }

  // Layout privé - structure simplifiée avec UN SEUL AppHeader
  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <PageTransition key={location.pathname}>
        <main className="flex-1">
          <Routes>
            <Route path="/home" element={
              <AuthGuard>
                <Home />
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
        </main>
      </PageTransition>
      <AppFooter />
    </div>
  );
}

export default { AppRouter };
