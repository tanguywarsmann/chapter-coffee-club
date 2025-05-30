
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  console.info("[LOGIN] Login component mounting");
  
  const { error, setError } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    console.info("[LOGIN] Login component mounted, checking for auth errors");
    const authError = localStorage.getItem("auth_error");
    if (authError) {
      console.error("Auth error found:", authError);
      setError(null);
      localStorage.removeItem("auth_error");
    }
  }, [setError]);

  const handleClick = () => {
    console.log('Button clicked! Navigating to /auth');
    navigate('/auth');
  };

  console.info("[LOGIN] Rendering Login component");

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      backgroundColor: 'red',
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
          READ - Test de rendu
        </h1>
        <p style={{ color: 'black', marginBottom: '20px' }}>
          Si vous voyez ceci, le composant Login s'affiche correctement.
        </p>
        <button 
          style={{
            backgroundColor: '#B05F2C',
            color: 'white',
            padding: '12px 24px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
          onClick={handleClick}
        >
          Aller à la page Auth
        </button>
      </div>
    </div>
  );
}
