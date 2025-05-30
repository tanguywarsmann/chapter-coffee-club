
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export default function Auth() {
  console.info("[AUTH] Auth component mounting");
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user, error, setError } = useAuth();

  console.info("[AUTH] Rendering Auth component");

  // Rediriger si déjà connecté
  useEffect(() => {
    if (user) {
      navigate("/home");
    }
  }, [user, navigate]);

  const handleLogin = async () => {
    console.log('Login attempt with:', email);
    if (!email || !password) {
      console.log('Missing email or password');
      return;
    }
    
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        console.error('Login error:', error);
        setError(error.message);
      } else {
        console.log('Login success');
        navigate("/home");
      }
    } catch (err) {
      console.error('Login exception:', err);
      setError("Erreur lors de la connexion.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async () => {
    console.log('Signup attempt with:', email);
    if (!email || !password) {
      console.log('Missing email or password');
      return;
    }
    
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signUp({ email, password });
      
      if (error) {
        console.error('Signup error:', error);
        setError(error.message);
      } else {
        console.log('Signup success');
        alert("Compte créé avec succès. Tu peux maintenant te connecter.");
      }
    } catch (err) {
      console.error('Signup exception:', err);
      setError("Erreur lors de la création du compte.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      backgroundColor: '#B05F2C',
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
        maxWidth: '400px',
        width: '90%'
      }}>
        <h1 style={{ 
          fontSize: '24px', 
          marginBottom: '20px',
          color: 'black',
          textAlign: 'center'
        }}>
          Authentification READ
        </h1>
        
        {error && (
          <div style={{
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            padding: '12px',
            borderRadius: '4px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: 'black' }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '16px'
            }}
            placeholder="votre@email.com"
          />
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: 'black' }}>
            Mot de passe
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '16px'
            }}
            placeholder="Votre mot de passe"
          />
        </div>
        
        <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
          <button
            onClick={handleLogin}
            disabled={isLoading}
            style={{
              backgroundColor: '#B05F2C',
              color: 'white',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px',
              opacity: isLoading ? 0.7 : 1
            }}
          >
            {isLoading ? "Connexion..." : "Se connecter"}
          </button>
          
          <button
            onClick={handleSignup}
            disabled={isLoading}
            style={{
              backgroundColor: 'white',
              color: '#B05F2C',
              padding: '12px 24px',
              border: '2px solid #B05F2C',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px',
              opacity: isLoading ? 0.7 : 1
            }}
          >
            {isLoading ? "Création..." : "Créer un compte"}
          </button>
        </div>
        
        <button
          onClick={() => navigate("/")}
          style={{
            backgroundColor: 'transparent',
            color: '#666',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px',
            marginTop: '16px',
            width: '100%',
            textAlign: 'center'
          }}
        >
          ← Retour
        </button>
      </div>
    </div>
  );
}
