
import { WelcomeModal } from "@/components/onboarding/WelcomeModal";
import { FavoriteBooksForm } from "@/components/onboarding/FavoriteBooksForm";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { getUserFavoriteBooks } from "@/services/user/favoriteBookService";

export function UserOnboarding() {
  const { user } = useAuth();
  const [showWelcome, setShowWelcome] = useState(false);
  const [showFavBooks, setShowFavBooks] = useState(false);

  useEffect(() => {
    try {
      if (!user?.id) return;

      const alreadyDone = localStorage.getItem("onboardingDone") === "true";

      if (!alreadyDone) {
        setShowWelcome(true);
      } else {
        checkFavoriteBooks();
      }
    } catch (e) {
      console.error("Erreur dans useEffect UserOnboarding:", e);
    }
  }, [user]);

  const checkFavoriteBooks = async () => {
    try {
      if (!user?.id) return;
      
      const favorites = await getUserFavoriteBooks(user.id);
      if (favorites.length === 0) {
        setShowFavBooks(true);
      }
    } catch (e) {
      console.error("Erreur dans checkFavoriteBooks:", e);
    }
  };

  const handleWelcomeClose = (skip?: boolean) => {
    try {
      setShowWelcome(false);
      localStorage.setItem("onboardingDone", "true");
      if (!skip) {
        checkFavoriteBooks();
      }
    } catch (e) {
      console.error("Erreur dans handleWelcomeClose:", e);
    }
  };

  const handleBooksComplete = () => {
    try {
      setShowFavBooks(false);
      localStorage.setItem("favBooksOnboardingDone", "true");
    } catch (e) {
      console.error("Erreur dans handleBooksComplete:", e);
    }
  };

  return (
    <>
      {(() => {
        try {
          return <WelcomeModal open={showWelcome} onClose={handleWelcomeClose} />;
        } catch (e) {
          console.error("Erreur dans le rendu de WelcomeModal:", e);
          return null;
        }
      })()}
      
      {(() => {
        try {
          return (
            <FavoriteBooksForm
              open={showFavBooks}
              onComplete={handleBooksComplete}
              onSkip={() => setShowFavBooks(false)}
            />
          );
        } catch (e) {
          console.error("Erreur dans le rendu de FavoriteBooksForm:", e);
          return null;
        }
      })()}
    </>
  );
}
