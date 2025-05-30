
import { Routes, Route } from "react-router-dom";
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
const DiagnosticPage = () => {
  console.info("[DIAGNOSTIC] DiagnosticPage rendering");
  return (
    <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'system-ui' }}>
      <h1 style={{ color: '#B05F2C' }}>Hello from diagnostic</h1>
      <p>Cette page teste la publication minimale de READ.</p>
      <p>Build réussi et routing fonctionnel !</p>
    </div>
  );
};

const LoadingFallback = () => {
  console.info("[APP ROUTER] Rendering LoadingFallback");
  return (
    <div className="min-h-screen flex items-center justify-center bg-logo-background">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-coffee-dark mx-auto"></div>
        <p className="text-coffee-dark font-medium">Chargement...</p>
      </div>
    </div>
  );
};

export function AppRouter() {
  console.info("[APP ROUTER] AppRouter component mounting");
  
  const { user, isLoading, isInitialized } = useAuth();

  console.info("[APP ROUTER] Current state:", {
    hasUser: !!user,
    isLoading,
    isInitialized,
    pathname: window.location.pathname
  });

  // Affichage du loader tant que l'auth n'est pas initialisée
  if (isLoading || !isInitialized) {
    console.info("[APP ROUTER] Showing loading fallback - auth not ready");
    return <LoadingFallback />;
  }

  console.info("[APP ROUTER] Auth ready, rendering routes");

  return (
    <div>
      <Routes>
        {/* Routes publiques - accessibles sans authentification */}
        <Route path="/" element={
          (() => {
            console.info("[APP ROUTER] Rendering root route with Login component");
            return <Login />;
          })()
        } />
        <Route path="/auth" element={
          (() => {
            console.info("[APP ROUTER] Rendering /auth route");
            return <Auth />;
          })()
        } />
        <Route path="/diagnostic" element={<DiagnosticPage />} />
        
        {/* Routes protégées - nécessitent une authentification */}
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
          (() => {
            console.info("[APP ROUTER] Rendering fallback route for unknown path");
            return (
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <h1>Page non trouvée</h1>
                <button onClick={() => window.location.href = "/auth"}>
                  Retour à la connexion
                </button>
              </div>
            );
          })()
        } />
      </Routes>
    </div>
  );
}

export default AppRouter;
