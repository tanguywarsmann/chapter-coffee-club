
import { UserQuest, Quest } from "@/types/quest";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, BookOpen, Sunrise, RefreshCw, Award, Lock } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface QuestCardProps {
  quest?: UserQuest;
  questInfo: Quest;
  isLocked?: boolean;
}

export function QuestCard({ quest, questInfo, isLocked = false }: QuestCardProps) {
  const getIcon = () => {
    const icon = quest?.quest?.icon || questInfo?.icon;
    if (!icon) return <Award className="h-5 w-5" />;

    switch (icon) {
      case "sun":
        return <Sunrise className="h-5 w-5" />;
      case "zap":
        return <Zap className="h-5 w-5" />;
      case "books":
        return <BookOpen className="h-5 w-5" />;
      case "refresh":
        return <RefreshCw className="h-5 w-5" />;
      default:
        return <Award className="h-5 w-5" />;
    }
  };

  // Mode locked (quête non débloquée)
  if (isLocked) {
    return (
      <Card className="border-gray-300 bg-gray-50/50 opacity-75">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-gray-200 p-2 mt-1">
              <Lock className="h-5 w-5 text-gray-500" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-gray-700">
                  {questInfo.title}
                </h3>
                {questInfo.category && (
                  <span className="text-caption text-gray-500 uppercase tracking-wider px-2 py-0.5 bg-gray-200 rounded">
                    {questInfo.category}
                  </span>
                )}
              </div>
              <p className="text-body-sm text-gray-600 italic mt-1">
                Accomplissez l'exploit pour découvrir les détails...
              </p>
              {questInfo.xp_reward && (
                <p className="text-caption text-gray-500 mt-2 flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  {questInfo.xp_reward} XP
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Mode unlocked (quête débloquée)
  return (
    <Card className="border-amber-400 bg-gradient-to-br from-amber-50 to-yellow-50 hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-amber-100 p-2 mt-1 text-amber-600">
            {getIcon()}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-amber-900">
                {quest?.quest?.title || questInfo.title}
              </h3>
              {questInfo.category && (
                <span className="text-caption text-amber-700 uppercase tracking-wider px-2 py-0.5 bg-amber-200 rounded">
                  {questInfo.category}
                </span>
              )}
            </div>
            <p className="text-body-sm text-amber-800 mt-1">
              {quest?.quest?.description || questInfo.description}
            </p>
            {quest?.unlocked_at && (
              <p className="text-caption text-amber-700 mt-2">
                ✅ Débloquée le {format(new Date(quest.unlocked_at), "d MMMM yyyy", { locale: fr })}
              </p>
            )}
            {questInfo.xp_reward && (
              <p className="text-caption text-amber-700 mt-1 flex items-center gap-1 font-semibold">
                <Zap className="h-3 w-3" />
                +{questInfo.xp_reward} XP
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
