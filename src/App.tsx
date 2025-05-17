
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Login from "./pages/Login";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import { UserOnboarding } from "./components/onboarding/UserOnboarding";

// Composant de chargement pour Suspense
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-logo-background">
    <div className="text-center">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-coffee-dark mx-auto mb-4"></div>
      <p className="text-coffee-dark">Chargement...</p>
    </div>
  </div>
);

// Chargement différé des composants non critiques
const BookPage = lazy(() => import("./pages/BookPage"));
const Profile = lazy(() => import("./pages/Profile"));
const PublicProfilePage = lazy(() => import("./pages/PublicProfilePage"));
const Discover = lazy(() => import("./pages/Discover"));
const ReadingList = lazy(() => import("./pages/ReadingList"));
const Explore = lazy(() => import("./pages/Explore"));
const Achievements = lazy(() => import("./pages/Achievements"));
const Admin = lazy(() => import("./pages/Admin"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Followers = lazy(() => import("./pages/Followers"));

const queryClient = new QueryClient();

const App = () => {
  console.log("Rendering App component");
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <UserOnboarding />
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/home" element={<Home />} />
            
            {/* Routes avec chargement différé */}
            <Route path="/books/:id" element={
              <Suspense fallback={<LoadingFallback />}>
                <BookPage />
              </Suspense>
            } />
            <Route path="/profile/:userId?" element={
              <Suspense fallback={<LoadingFallback />}>
                <Profile />
              </Suspense>
            } />
            <Route path="/u/:userId" element={
              <Suspense fallback={<LoadingFallback />}>
                <PublicProfilePage />
              </Suspense>
            } />
            <Route path="/discover" element={
              <Suspense fallback={<LoadingFallback />}>
                <Discover />
              </Suspense>
            } />
            <Route path="/reading-list" element={
              <Suspense fallback={<LoadingFallback />}>
                <ReadingList />
              </Suspense>
            } />
            <Route path="/explore" element={
              <Suspense fallback={<LoadingFallback />}>
                <Explore />
              </Suspense>
            } />
            <Route path="/achievements" element={
              <Suspense fallback={<LoadingFallback />}>
                <Achievements />
              </Suspense>
            } />
            <Route path="/followers/:type/:userId?" element={
              <Suspense fallback={<LoadingFallback />}>
                <Followers />
              </Suspense>
            } />
            <Route path="/admin" element={
              <Suspense fallback={<LoadingFallback />}>
                <Admin />
              </Suspense>
            } />
            <Route path="*" element={
              <Suspense fallback={<LoadingFallback />}>
                <NotFound />
              </Suspense>
            } />
          </Routes>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
