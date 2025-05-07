
import { Award, Book, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { getUserBadges } from "@/services/badgeService";
import { getTotalPagesRead, getBooksReadCount } from "@/services/reading/statsService";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export function StatsCards() {
  const [booksRead, setBooksRead] = useState<number>(0);
  const [pagesRead, setPagesRead] = useState<number>(0);
  const [badgesCount, setBadgesCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Récupérer le nombre réel de badges débloqués depuis Supabase
        if (user?.id) {
          const userBadges = await getUserBadges(user.id);
          setBadgesCount(userBadges.length);
        }

        const userData = localStorage.getItem("user");
        const parsed = userData ? JSON.parse(userData) : null;
        if (!parsed?.id) return;
        
        const [booksCount, pagesCount] = await Promise.all([
          getBooksReadCount(parsed.id),
          getTotalPagesRead(parsed.id)
        ]);
        
        setBooksRead(booksCount);
        setPagesRead(pagesCount);
      } catch (error) {
        console.error("Erreur lors du chargement des statistiques:", error);
        toast.error("Impossible de charger vos statistiques");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  // Ne pas afficher "0 badge" mais plutôt masquer le texte
  const displayBadgesText = badgesCount > 0 ? (
    <p className="text-sm font-medium text-coffee-darker">
      Badge{badgesCount > 1 ? "s" : ""} obtenu{badgesCount > 1 ? "s" : ""}
    </p>
  ) : (
    <p className="text-sm font-medium text-coffee-darker">Badges</p>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
      <div className="bg-gradient-to-br from-coffee-light to-chocolate-light rounded-lg p-4 flex items-center justify-between transition-all duration-300 hover:shadow-md">
        <div>
          {displayBadgesText}
          <p className="text-3xl font-bold text-coffee-darker">{isLoading ? "—" : badgesCount}</p>
        </div>
        <Award className="h-8 w-8 text-coffee-darker" />
      </div>
      <div className="bg-gradient-to-br from-coffee-light to-chocolate-light rounded-lg p-4 flex items-center justify-between transition-all duration-300 hover:shadow-md">
        <div>
          <p className="text-sm font-medium text-coffee-darker">Livre{booksRead > 1 ? "s" : ""} terminé{booksRead > 1 ? "s" : ""}</p>
          <p className="text-3xl font-bold text-coffee-darker">{isLoading ? "—" : booksRead}</p>
        </div>
        <Book className="h-8 w-8 text-coffee-darker" />
      </div>
      <div className="bg-gradient-to-br from-coffee-light to-chocolate-light rounded-lg p-4 flex items-center justify-between transition-all duration-300 hover:shadow-md">
        <div>
          <p className="text-sm font-medium text-coffee-darker">Pages lues</p>
          <p className="text-3xl font-bold text-coffee-darker">{isLoading ? "—" : pagesRead}</p>
        </div>
        <FileText className="h-8 w-8 text-coffee-darker" />
      </div>
    </div>
  );
}
