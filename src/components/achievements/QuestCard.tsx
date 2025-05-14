
import { UserQuest } from "@/types/quest";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, BookOpen, Sunrise, RefreshCw, Award } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface QuestCardProps {
  quest: UserQuest;
}

export function QuestCard({ quest }: QuestCardProps) {
  const getIcon = () => {
    if (!quest.quest?.icon) return <Award className="h-5 w-5 text-coffee-dark" />;
    
    switch (quest.quest.icon) {
      case "sun":
        return <Sunrise className="h-5 w-5 text-amber-500" />;
      case "zap":
        return <Zap className="h-5 w-5 text-yellow-500" />;
      case "books":
        return <BookOpen className="h-5 w-5 text-blue-500" />;
      case "refresh":
        return <RefreshCw className="h-5 w-5 text-green-500" />;
      default:
        return <Award className="h-5 w-5 text-coffee-dark" />;
    }
  };

  return (
    <Card className="border-coffee-light hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-coffee-lightest p-2 mt-1">
            {getIcon()}
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-coffee-darker">
              {quest.quest?.title || quest.quest_slug}
            </h3>
            <p className="text-sm text-muted-foreground">
              {quest.quest?.description || "Quête débloquée !"}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Débloquée le {format(new Date(quest.unlocked_at), "d MMMM yyyy", { locale: fr })}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
