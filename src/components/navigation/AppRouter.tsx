
import { Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { isPublicRoute } from "@/utils/publicRoutes";
import { useLocation } from "react-router-dom";

// Lazy load components
const Index = lazy(() => import("@/pages/Index"));
const Home = lazy(() => import("@/pages/Home"));
const Auth = lazy(() => import("@/pages/Auth"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const Profile = lazy(() => import("@/pages/Profile"));
const ReadingList = lazy(() => import("@/pages/ReadingList"));
const Achievements = lazy(() => import("@/pages/Achievements"));
const Discover = lazy(() => import("@/pages/Discover"));
const Explore = lazy(() => import("@/pages/Explore"));
const Admin = lazy(() => import("@/pages/Admin"));
const Blog = lazy(() => import("@/pages/Blog"));
const BlogPost = lazy(() => import("@/pages/BlogPost"));
const BookPage = lazy(() => import("@/pages/BookPage"));
const PublicProfilePage = lazy(() => import("@/pages/PublicProfilePage"));
const Followers = lazy(() => import("@/pages/Followers"));
const Landing = lazy(() => import("@/pages/Landing"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const SitemapXml = lazy(() => import("@/pages/SitemapXml"));

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-logo-accent"></div>
  </div>
);

export function AppRouter() {
  const location = useLocation();
  const currentPath = location.pathname;

  // Handle sitemap.xml route with proper content type
  if (currentPath === '/sitemap.xml') {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <SitemapXml />
      </Suspense>
    );
  }

  // Check if current route is public
  const isPublic = isPublicRoute(currentPath);

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={
          <PublicLayout>
            <Index />
          </PublicLayout>
        } />
        <Route path="/landing" element={
          <PublicLayout>
            <Landing />
          </PublicLayout>
        } />
        <Route path="/auth" element={
          <PublicLayout>
            <Auth />
          </PublicLayout>
        } />
        <Route path="/reset-password" element={
          <PublicLayout>
            <ResetPassword />
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
            <BookPage />
          </PublicLayout>
        } />
        <Route path="/u/:userId" element={
          <PublicLayout>
            <PublicProfilePage />
          </PublicLayout>
        } />
        
        {/* Protected routes */}
        <Route path="/home" element={
          <AuthGuard>
            <Home />
          </AuthGuard>
        } />
        <Route path="/profile" element={
          <AuthGuard>
            <Profile />
          </AuthGuard>
        } />
        <Route path="/reading-list" element={
          <AuthGuard>
            <ReadingList />
          </AuthGuard>
        } />
        <Route path="/achievements" element={
          <AuthGuard>
            <Achievements />
          </AuthGuard>
        } />
        <Route path="/discover" element={
          <AuthGuard>
            <Discover />
          </AuthGuard>
        } />
        <Route path="/explore" element={
          <AuthGuard>
            <Explore />
          </AuthGuard>
        } />
        <Route path="/admin" element={
          <AuthGuard>
            <Admin />
          </AuthGuard>
        } />
        <Route path="/followers/:type/:userId" element={
          <AuthGuard>
            <Followers />
          </AuthGuard>
        } />
        
        {/* 404 route */}
        <Route path="*" element={
          <PublicLayout>
            <NotFound />
          </PublicLayout>
        } />
      </Routes>
    </Suspense>
  );
}
