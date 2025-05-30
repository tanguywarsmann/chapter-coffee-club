
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Home() {
  console.info("[HOME] Home component mounting");
  
  const { user } = useAuth();
  const navigate = useNavigate();

  console.info("[HOME] Rendering Home component, user:", user?.email || "none");

  const handleLogout = async () => {
    // Pour l'instant, on redirige vers la page d'accueil
    navigate("/");
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      backgroundColor: '#4CAF50', // Vert pour distinguer de Auth
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 9999
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '8px',
        textAlign: 'center',
        maxWidth: '400px',
        width: '90%'
      }}>
        <h1 style={{ 
          fontSize: '24px', 
          marginBottom: '20px',
          color: 'black'
        }}>
          READ - Page d'accueil
        </h1>
        <p style={{ color: 'black', marginBottom: '20px' }}>
          Bienvenue {user?.email || "utilisateur"} !
        </p>
        <p style={{ color: 'black', marginBottom: '20px' }}>
          Si vous voyez ceci, la page Home s'affiche correctement.
        </p>
        <button 
          style={{
            backgroundColor: '#B05F2C',
            color: 'white',
            padding: '12px 24px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
            marginRight: '10px'
          }}
          onClick={handleLogout}
        >
          Se déconnecter
        </button>
        <button 
          style={{
            backgroundColor: '#666',
            color: 'white',
            padding: '12px 24px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
          onClick={() => navigate("/reading-list")}
        >
          Ma liste de lecture
        </button>
      </div>
    </div>
  );
}
