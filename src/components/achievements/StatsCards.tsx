
import { Award, Book, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { getUserBadges } from "@/mock/badges";
import { getTotalPagesRead, getBooksReadCount } from "@/services/reading/statsService";

export function StatsCards() {
  const badges = getUserBadges();
  const [booksRead, setBooksRead] = useState<number>(0);
  const [pagesRead, setPagesRead] = useState<number>(0);

  useEffect(() => {
    const user = localStorage.getItem("user");
    const parsed = user ? JSON.parse(user) : null;
    if (!parsed?.id) return;
    getBooksReadCount(parsed.id).then(setBooksRead);
    getTotalPagesRead(parsed.id).then(setPagesRead);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-gradient-to-br from-coffee-light to-chocolate-light rounded-lg p-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-coffee-darker">Badge{badges.length > 1 ? "s" : ""} obtenu{badges.length > 1 ? "s" : ""}</p>
          <p className="text-3xl font-bold text-coffee-darker">{badges.length}</p>
        </div>
        <Award className="h-8 w-8 text-coffee-darker" />
      </div>
      <div className="bg-gradient-to-br from-coffee-light to-chocolate-light rounded-lg p-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-coffee-darker">Livre{booksRead > 1 ? "s" : ""} terminé{booksRead > 1 ? "s" : ""}</p>
          <p className="text-3xl font-bold text-coffee-darker">{booksRead}</p>
        </div>
        <Book className="h-8 w-8 text-coffee-darker" />
      </div>
      <div className="bg-gradient-to-br from-coffee-light to-chocolate-light rounded-lg p-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-coffee-darker">Pages lues</p>
          <p className="text-3xl font-bold text-coffee-darker">{pagesRead}</p>
        </div>
        <FileText className="h-8 w-8 text-coffee-darker" />
      </div>
    </div>
  );
}
