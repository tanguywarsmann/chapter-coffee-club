
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
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'blue',
      color: 'white'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '4px solid white',
          borderTop: '4px solid transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 16px'
        }}></div>
        <p>Chargement...</p>
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
    <Routes>
      {/* Route principale - Login pour les utilisateurs non connectés */}
      <Route path="/" element={
        <div>
          {console.log("[APP ROUTER] Rendering root route - Login component")}
          <Login />
        </div>
      } />
      
      {/* Route d'authentification alternative */}
      <Route path="/auth" element={
        <div>
          {console.log("[APP ROUTER] Rendering /auth route")}
          <Auth />
        </div>
      } />
      
      {/* Page de diagnostic */}
      <Route path="/diagnostic" element={
        <div>
          {console.log("[APP ROUTER] Rendering /diagnostic route")}
          <DiagnosticPage />
        </div>
      } />
      
      {/* Routes protégées */}
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
        <div style={{ padding: '40px', textAlign: 'center', backgroundColor: 'yellow' }}>
          {console.log("[APP ROUTER] Rendering fallback route for unknown path")}
          <h1>Page non trouvée</h1>
          <button onClick={() => window.location.href = "/"}>
            Retour à l'accueil
          </button>
        </div>
      } />
    </Routes>
  );
}

export default AppRouter;
