
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
  console.info("[APP ROUTER] AppRouter component mounting");
  
  const { user, isLoading, isInitialized } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isReady, setIsReady] = useState(false);

  console.info("[APP ROUTER] Current state:", {
    hasUser: !!user,
    isLoading,
    isInitialized,
    pathname: location.pathname
  });

  // Attendre que tout soit prêt
  useEffect(() => {
    console.info("[APP ROUTER] Checking if ready:", { isLoading, isInitialized });
    if (!isLoading && isInitialized) {
      console.info("[APP ROUTER] Setting ready to true");
      setIsReady(true);
    }
  }, [isLoading, isInitialized]);

  // Navigation logic simplifiée
  useEffect(() => {
    if (!isReady) {
      console.info("[APP ROUTER] Not ready yet, skipping navigation logic");
      return;
    }

    const currentPath = location.pathname;
    console.info("[APP ROUTER] Navigation logic executing for path:", currentPath);
    
    // Paths autorisés (version minimale)
    const allowedPaths = ["/", "/home", "/auth", "/explore", "/profile", "/reading-list", "/books", "/diagnostic"];
    
    const isAllowedPath = allowedPaths.some(path => {
      if (path === "/") return currentPath === "/";
      return currentPath.startsWith(path);
    });
    
    if (!isAllowedPath) {
      console.warn("[APP ROUTER] Invalid path detected:", currentPath);
      navigate("/", { replace: true });
      return;
    }
    
    // Redirection auth simplifiée
    if (!user && !["/auth", "/", "/diagnostic"].includes(currentPath)) {
      console.info("[APP ROUTER] User not authenticated, redirecting to /auth");
      navigate("/auth", { replace: true });
      return;
    }
    
    if (user && currentPath === "/") {
      console.info("[APP ROUTER] User authenticated on root, redirecting to /home");
      navigate("/home", { replace: true });
      return;
    }
    
    console.info("[APP ROUTER] Navigation logic completed, staying on:", currentPath);
  }, [user, isReady, location.pathname, navigate]);

  if (!isReady) {
    console.info("[APP ROUTER] Showing loading fallback");
    return <LoadingFallback />;
  }

  console.info("[APP ROUTER] Rendering routes");

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
