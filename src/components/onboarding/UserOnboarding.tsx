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
    if (!user?.id) return;

    const alreadyDone = localStorage.getItem("onboardingDone") === "true";

    if (!alreadyDone) {
      setShowWelcome(true);
    } else {
      checkFavoriteBooks();
    }
  }, [user]);

  const checkFavoriteBooks = async () => {
    const favorites = await getUserFavoriteBooks(user.id);
    if (favorites.length === 0) {
      setShowFavBooks(true);
    }
  };

  const handleWelcomeClose = (skip?: boolean) => {
    setShowWelcome(false);
    localStorage.setItem("onboardingDone", "true");
    if (!skip) {
      checkFavoriteBooks();
    }
  };

  const handleBooksComplete = () => {
    setShowFavBooks(false);
    localStorage.setItem("favBooksOnboardingDone", "true");
  };

  return (
    <>
      <WelcomeModal open={showWelcome} onClose={handleWelcomeClose} />
      <FavoriteBooksForm
        open={showFavBooks}
        onComplete={handleBooksComplete}
        onSkip={() => setShowFavBooks(false)}
      />
    </>
  );
}
