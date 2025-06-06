
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { QuizContent } from "./QuizContent";
import { ReadingQuestion } from "@/types/reading";

interface QuizModalProps {
  bookTitle: string;
  chapterNumber: number;
  onComplete: (passed: boolean) => void;
  onClose: () => void;
  question: ReadingQuestion;
}

export function QuizModal({ 
  bookTitle,
  chapterNumber,
  onComplete,
  onClose,
  question
}: QuizModalProps) {
  const [answer, setAnswer] = useState("");
  const [attempts, setAttempts] = useState(0);
  const maxAttempts = 3;

  const handleSubmit = () => {
    if (!answer.trim()) {
      toast.error("Veuillez entrer une réponse");
      return;
    }

    const isCorrect = question.answer === "libre" || 
      answer.trim().toLowerCase() === question.answer.trim().toLowerCase();
    
    if (isCorrect) {
      toast.success("Bonne réponse !");
      onComplete(true);
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      
      if (newAttempts >= maxAttempts) {
        toast.error("Nombre maximum de tentatives atteint. Réessayez plus tard.");
        onComplete(false);
      } else {
        toast.error(`Réponse incorrecte. Il vous reste ${maxAttempts - newAttempts} tentative(s).`);
      }
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-coffee-medium">
        <DialogHeader>
          <DialogTitle className="text-center text-coffee-darker font-serif">
            Vérification de lecture: Chapitre {chapterNumber}
          </DialogTitle>
          <DialogDescription className="text-center text-sm text-muted-foreground">
            Répondez par un mot.
          </DialogDescription>
        </DialogHeader>
        
        <QuizContent
          bookTitle={bookTitle}
          chapterNumber={chapterNumber}
          question={question.question}
          answer={answer}
          attempts={attempts}
          maxAttempts={maxAttempts}
          setAnswer={setAnswer}
        />
        
        <DialogFooter className="sm:justify-center gap-2">
          <Button variant="outline" onClick={onClose} className="border-coffee-medium">
            Annuler
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!answer.trim()}
            className="bg-coffee-dark hover:bg-coffee-darker"
          >
            Valider ma réponse
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
