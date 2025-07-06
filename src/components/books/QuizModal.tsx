
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
    <Dialog 
      open={true} 
      onOpenChange={onClose}
      aria-labelledby="quiz-modal-title"
      aria-describedby="quiz-modal-description"
    >
      <DialogContent 
        className="sm:max-w-md border-coffee-medium"
        role="dialog"
        aria-modal="true"
      >
        <DialogHeader>
          <DialogTitle 
            id="quiz-modal-title"
            className="text-center text-coffee-darker font-serif"
          >
            Vérification de lecture: Chapitre {chapterNumber}
          </DialogTitle>
          <DialogDescription 
            id="quiz-modal-description"
            className="text-center text-sm text-foreground/80"
          >
            Répondez par un mot pour valider votre compréhension.
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
          <Button 
            variant="outline" 
            onClick={onClose} 
            className="border-coffee-medium text-foreground hover:bg-muted"
            aria-label="Annuler le quiz de lecture"
          >
            Annuler
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!answer.trim()}
            className="bg-coffee-dark hover:bg-coffee-darker text-white"
            aria-label="Valider ma réponse au quiz"
            aria-describedby={!answer.trim() ? "answer-requirement" : undefined}
          >
            Valider ma réponse
          </Button>
          {!answer.trim() && (
            <div 
              id="answer-requirement" 
              className="sr-only"
              aria-live="polite"
            >
              Vous devez saisir une réponse avant de valider
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
