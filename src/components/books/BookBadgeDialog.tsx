
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { BadgeCard } from "@/components/achievements/BadgeCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/types/badge";

interface BookBadgeDialogProps {
  open: boolean;
  badges: Badge[];
  setOpen: (open: boolean) => void;
}

export function BookBadgeDialog({ open, badges, setOpen }: BookBadgeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md border-coffee-medium animate-enter">
        <DialogHeader>
          <DialogTitle className="text-center text-h4 font-serif text-coffee-darker">
            🎉 Nouveau badge débloqué !
          </DialogTitle>
          <DialogDescription className="text-center">
            Félicitations pour cette nouvelle étape dans votre parcours de lecture !
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 flex flex-col items-center space-y-6">
          {badges.map(badge => (
            <div key={badge.id} className="flex flex-col items-center space-y-3">
              <BadgeCard badge={badge} className="scale-125 animate-scale-in" />
            </div>
          ))}

          <Button
            onClick={() => setOpen(false)}
            className="mt-4 bg-coffee-dark hover:bg-coffee-darker"
          >
            Super !
          </Button>
          <Button
            variant="outline"
            className="border-coffee-light"
            onClick={() => {
              setOpen(false);
              window.location.href = "/achievements";
            }}
          >
            Voir tous mes badges
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
