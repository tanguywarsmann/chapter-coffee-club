import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface ReturnRitualProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ReturnRitual({ isOpen, onClose }: ReturnRitualProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">Tu es revenu</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center gap-6 py-6">
          {/* Renardeau simple */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-8xl"
          >
            🦊
          </motion.div>

          <div className="text-center space-y-3 px-4">
            <p className="text-foreground/80 leading-relaxed">
              C'est ça, être lecteur.
            </p>
            <p className="text-foreground/80 leading-relaxed">
              Faire des pauses, puis revenir.
            </p>
          </div>

          <Button onClick={onClose} className="w-full max-w-xs">
            Reprendre mon entraînement
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
