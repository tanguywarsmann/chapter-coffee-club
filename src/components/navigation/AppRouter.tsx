
import { useEffect, useState } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AuthGuard } from "../auth/AuthGuard";

// Pages critiques seulement
import Home from "@/pages/Home";
import Auth from "@/pages/Auth";
import Login from "@/pages/Login";
import Profile from "@/pages/Profile";
import Explore from "@/pages/Explore";
import ReadingList from "@/pages/ReadingList";
import BookPage from "@/pages/BookPage";

// Page de diagnostic simple
const DiagnosticPage = () => (
  <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'system-ui' }}>
    <h1 style={{ color: '#B05F2C' }}>Hello from diagnostic</h1>
    <p>Cette page teste la publication minimale de READ.</p>
    <p>Build réussi et routing fonctionnel !</p>
  </div>
);

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-logo-background">
    <div className="text-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-coffee-dark mx-auto"></div>
      <p className="text-coffee-dark font-medium">Chargement...</p>
    </div>
  </div>
);

export function AppRouter() {
  const { user, isLoading, isInitialized } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isReady, setIsReady] = useState(false);

  // Attendre que tout soit prêt
  useEffect(() => {
    if (!isLoading && isInitialized) {
      setIsReady(true);
    }
  }, [isLoading, isInitialized]);

  // Navigation logic simplifiée
  useEffect(() => {
    if (!isReady) return;

    const currentPath = location.pathname;
    
    // Paths autorisés (version minimale)
    const allowedPaths = ["/", "/home", "/auth", "/explore", "/profile", "/reading-list", "/books", "/diagnostic"];
    
    const isAllowedPath = allowedPaths.some(path => {
      if (path === "/") return currentPath === "/";
      return currentPath.startsWith(path);
    });
    
    if (!isAllowedPath) {
      console.warn("[ROUTER] Invalid path detected:", currentPath);
      navigate("/", { replace: true });
      return;
    }
    
    // Redirection auth simplifiée
    if (!user && !["/auth", "/", "/diagnostic"].includes(currentPath)) {
      navigate("/auth", { replace: true });
      return;
    }
    
    if (user && currentPath === "/") {
      navigate("/home", { replace: true });
      return;
    }
  }, [user, isReady, location.pathname, navigate]);

  if (!isReady) {
    return <LoadingFallback />;
  }

  return (
    <Routes>
      {/* Routes publiques */}
      <Route path="/" element={<Login />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/diagnostic" element={<DiagnosticPage />} />
      
      {/* Routes protégées critiques */}
      <Route path="/home" element={
        <AuthGuard>
          <Home />
        </AuthGuard>
      } />
      
      <Route path="/books/:id" element={
        <AuthGuard>
          <BookPage />
        </AuthGuard>
      } />
      
      <Route path="/profile/:userId?" element={
        <AuthGuard>
          <Profile />
        </AuthGuard>
      } />
      
      <Route path="/explore" element={
        <AuthGuard>
          <Explore />
        </AuthGuard>
      } />
      
      <Route path="/reading-list" element={
        <AuthGuard>
          <ReadingList />
        </AuthGuard>
      } />
      
      {/* Routes commentées temporairement pour diagnostic
      <Route path="/u/:userId" element={
        <AuthGuard>
          <Suspense fallback={<div>Loading...</div>}>
            <PublicProfilePage />
          </Suspense>
        </AuthGuard>
      } />
      
      <Route path="/discover" element={
        <AuthGuard>
          <Suspense fallback={<div>Loading...</div>}>
            <Discover />
          </Suspense>
        </AuthGuard>
      } />
      
      <Route path="/achievements" element={
        <AuthGuard>
          <Suspense fallback={<div>Loading...</div>}>
            <Achievements />
          </Suspense>
        </AuthGuard>
      } />
      
      <Route path="/followers/:type/:userId?" element={
        <AuthGuard>
          <Suspense fallback={<div>Loading...</div>}>
            <Followers />
          </Suspense>
        </AuthGuard>
      } />
      
      <Route path="/admin" element={
        <AuthGuard>
          <Suspense fallback={<div>Loading...</div>}>
            <Admin />
          </Suspense>
        </AuthGuard>
      } />
      */}
      
      {/* Fallback pour routes inconnues */}
      <Route path="*" element={
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <h1>Page non trouvée</h1>
          <button onClick={() => navigate("/home")}>
            Retour à l'accueil
          </button>
        </div>
      } />
    </Routes>
  );
}

export default AppRouter;
