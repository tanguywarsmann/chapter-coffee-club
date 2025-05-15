
import { useState, useEffect } from "react";
import { WelcomeModal } from "@/components/onboarding/WelcomeModal";
// import { FavoriteBooksForm } from "@/components/onboarding/FavoriteBooksForm";
import { useAuth } from "@/contexts/AuthContext";
import { getUserFavoriteBooks } from "@/services/user/favoriteBookService";
import { toast } from "sonner";

export function UserOnboarding() {
  const { user } = useAuth();
  const [showWelcome, setShowWelcome] = useState(false);
  const [showFavBooks, setShowFavBooks] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!user?.id || initialized) return;

    const checkOnboardingStatus = async () => {
      // Ne vérifie les livres favoris que si le flag d'accueil est passé
      const welcomeDone = localStorage.getItem("onboardingDone") === "true";
      
      if (!welcomeDone) {
        setShowWelcome(true);
        setInitialized(true);
        return;
      }
      
      // Vérifie si l'utilisateur a déjà des livres favoris
      try {
        const favoriteBooks = await getUserFavoriteBooks(user.id);
        
        if (favoriteBooks.length === 0) {
          // Si pas de livres favoris, afficher le formulaire
          setShowFavBooks(true);
        }
      } catch (error) {
        console.error("Erreur lors de la vérification des livres favoris:", error);
        toast.error("Erreur lors du chargement des données d'onboarding");
      } finally {
        setInitialized(true);
      }
    };
    
    checkOnboardingStatus();
  }, [user, initialized]);

  const handleWelcomeClose = (skipFlag?: boolean) => {
    setShowWelcome(false);
    
    if (!skipFlag) {
      // Si l'utilisateur n'a pas sauté, montrer l'étape suivante
      setShowFavBooks(true);
    }
  };

  const handleFavBooksComplete = () => {
    setShowFavBooks(false);
    localStorage.setItem("favBooksOnboardingDone", "true");
  };

  const handleFavBooksSkip = () => {
    setShowFavBooks(false);
  };

  return (
    <>
      <WelcomeModal
        open={showWelcome}
        onClose={handleWelcomeClose}
      />
    {/* 
<FavoriteBooksForm
  open={showFavBooks}
  onComplete={handleFavBooksComplete}
  onSkip={handleFavBooksSkip}
/> 
*/}
    </>
  );
}
