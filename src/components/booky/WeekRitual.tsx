import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface WeekRitualProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WeekRitual({ isOpen, onClose }: WeekRitualProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">Première semaine d'entraînement</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center gap-6 py-6">
          {/* Renardeau avec lunettes */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-8xl"
          >
            🦊🤓
          </motion.div>

          <div className="text-center space-y-3 px-4">
            <p className="text-foreground/80 leading-relaxed">
              Tu viens de tenir 7 jours de lecture consécutifs.
            </p>
            <p className="text-foreground/80 leading-relaxed">
              Ton renard te voit comme un vrai marathonien de la lecture.
            </p>
          </div>

          <Button onClick={onClose} className="w-full max-w-xs">
            Continuer mon cycle
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
