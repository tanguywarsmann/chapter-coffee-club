
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

  const stats = [
    {
      icon: Award,
      value: badgesCount,
      label: badgesCount === 0 ? "Aucun badge" : badgesCount === 1 ? "Badge obtenu" : "Badges obtenus",
      gradient: "from-amber-100 to-yellow-100",
      iconColor: "text-amber-600"
    },
    {
      icon: Book,
      value: booksRead,
      label: booksRead === 0 ? "Aucun livre terminé" : booksRead === 1 ? "Livre terminé" : "Livres terminés",
      gradient: "from-blue-100 to-indigo-100",
      iconColor: "text-blue-600"
    },
    {
      icon: FileText,
      value: pagesRead,
      label: "Pages lues",
      gradient: "from-green-100 to-emerald-100",
      iconColor: "text-green-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat, index) => (
        <div 
          key={index}
          className="bg-white/80 backdrop-blur-sm border border-coffee-light/30 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 group"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-coffee-medium uppercase tracking-wide mb-2">
                {stat.label}
              </h3>
              <p className="text-3xl font-serif font-bold text-coffee-darker">
                {isLoading ? "—" : stat.value.toLocaleString()}
              </p>
            </div>
            <div className={`p-3 bg-gradient-to-br ${stat.gradient} rounded-xl group-hover:scale-110 transition-transform duration-300`}>
              <stat.icon className={`h-7 w-7 ${stat.iconColor}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
