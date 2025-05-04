
import { Award, Book, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { getUserBadges } from "@/mock/badges";
import { getTotalPagesRead, getBooksReadCount } from "@/services/reading/statsService";
import { toast } from "sonner";

export function StatsCards() {
  const [badges, setBadges] = useState<any[]>([]);
  const [booksRead, setBooksRead] = useState<number>(0);
  const [pagesRead, setPagesRead] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const badgesData = getUserBadges();
        setBadges(badgesData);

        const user = localStorage.getItem("user");
        const parsed = user ? JSON.parse(user) : null;
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
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
      <div className="bg-gradient-to-br from-coffee-light to-chocolate-light rounded-lg p-4 flex items-center justify-between transition-all duration-300 hover:shadow-md">
        <div>
          <p className="text-sm font-medium text-coffee-darker">Badge{badges.length > 1 ? "s" : ""} obtenu{badges.length > 1 ? "s" : ""}</p>
          <p className="text-3xl font-bold text-coffee-darker">{isLoading ? "—" : badges.length}</p>
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
