
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserQuest } from "@/types/quest";
import { Sparkles, Trophy, Zap } from "lucide-react";

interface BookQuestDialogProps {
  open: boolean;
  quests: UserQuest[];
  setOpen: (open: boolean) => void;
}

export function BookQuestDialog({ open, quests, setOpen }: BookQuestDialogProps) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md border-amber-500 border-2 animate-enter bg-gradient-to-br from-amber-50 to-yellow-50">
        <DialogHeader>
          <DialogTitle className="text-center text-h3 font-serif text-amber-900 flex items-center justify-center gap-2">
            <Trophy className="h-8 w-8 text-amber-600 animate-pulse" />
            Challenge Complété !
            <Sparkles className="h-8 w-8 text-amber-600 animate-pulse" />
          </DialogTitle>
          <DialogDescription className="text-center text-amber-800 font-medium">
            🏆 Vous avez accompli un exploit rare et prestigieux !
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 flex flex-col items-center space-y-6">
          {quests.map(quest => (
            <div
              key={quest.id}
              className="w-full bg-white/80 backdrop-blur-sm border-2 border-amber-400 rounded-2xl p-6 shadow-2xl animate-scale-in"
            >
              <div className="flex flex-col items-center space-y-3 text-center">
                <div className="text-5xl mb-2">
                  {quest.quest?.icon === 'zap' ? <Zap className="h-12 w-12 text-amber-600" /> : '🏆'}
                </div>
                <h3 className="font-serif text-h4 text-amber-900">
                  {quest.quest?.title || quest.quest_slug}
                </h3>
                <p className="text-body text-amber-800">
                  {quest.quest?.description || "Quête accomplie !"}
                </p>
                {quest.quest?.xp_reward && (
                  <div className="mt-2 px-4 py-2 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full">
                    <span className="font-bold text-amber-900 flex items-center gap-1">
                      <Zap className="h-4 w-4" />
                      +{quest.quest.xp_reward} XP
                    </span>
                  </div>
                )}
                {quest.quest?.category && (
                  <div className="text-caption text-amber-700 uppercase tracking-wider font-semibold">
                    {quest.quest.category}
                  </div>
                )}
              </div>
            </div>
          ))}

          <Button
            onClick={() => setOpen(false)}
            className="mt-4 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white font-bold px-8 py-6 text-lg shadow-lg"
          >
            🎉 Fantastique !
          </Button>
          <Button
            variant="outline"
            className="border-2 border-amber-400 text-amber-900 hover:bg-amber-50"
            onClick={() => {
              setOpen(false);
              window.location.href = "/achievements";
            }}
          >
            Voir toutes mes quêtes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
