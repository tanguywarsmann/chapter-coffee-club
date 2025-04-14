
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface QuizModalProps {
  bookTitle: string;
  chapterNumber: number;
  onComplete: (passed: boolean) => void;
  onClose: () => void;
}

export function QuizModal({ bookTitle, chapterNumber, onComplete, onClose }: QuizModalProps) {
  const [answer, setAnswer] = useState("");

  // Mock question - in a real app this would come from a database
  const question = {
    text: "Quelle est votre interprétation du thème principal de ce chapitre et comment celui-ci s'inscrit dans l'œuvre globale ?",
    minLength: 50 // Minimum characters required to consider a valid answer
  };

  const handleSubmit = () => {
    if (answer.trim().length >= question.minLength) {
      // In a real app, this would be sent to a backend for evaluation
      // For now, any answer with sufficient length is considered valid
      onComplete(true);
    } else {
      // Answer is too short
      onComplete(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-coffee-medium">
        <DialogHeader>
          <DialogTitle className="text-center text-coffee-darker font-serif">
            Vérification de lecture: Chapitre {chapterNumber}
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-4 text-center">
            Pour valider votre lecture du chapitre {chapterNumber} de "{bookTitle}", 
            veuillez répondre à la question suivante:
          </p>
          
          <div className="space-y-4">
            <h3 className="font-medium text-coffee-darker">{question.text}</h3>
            
            <div className="mt-2">
              <Label htmlFor="answer" className="sr-only">Votre réponse</Label>
              <Textarea
                id="answer"
                placeholder="Votre réponse..."
                rows={6}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="w-full border-coffee-medium resize-none"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Minimum {question.minLength} caractères requis ({answer.length} actuellement)
              </p>
            </div>
          </div>
        </div>
        
        <DialogFooter className="sm:justify-center gap-2">
          <Button variant="outline" onClick={onClose} className="border-coffee-medium">
            Annuler
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={answer.trim().length < question.minLength}
            className="bg-coffee-dark hover:bg-coffee-darker"
          >
            Valider ma réponse
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
