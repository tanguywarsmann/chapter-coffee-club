
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface QuizModalProps {
  bookTitle: string;
  chapterNumber: number;
  onComplete: (passed: boolean) => void;
  onClose: () => void;
}

export function QuizModal({ bookTitle, chapterNumber, onComplete, onClose }: QuizModalProps) {
  const [answer, setAnswer] = useState("");
  const [attempts, setAttempts] = useState(0);
  const maxAttempts = 3;

  // Get a question based on the book title and chapter number
  const getQuestion = () => {
    // In a real app, these would come from a database
    const questions = {
      "Les Misérables": [
        { question: "Comment s'appelle l'évêque qui accueille Jean Valjean ?", answer: ["Myriel", "Monseigneur Myriel", "L'évêque Myriel"] },
        { question: "Quel objet Jean Valjean vole-t-il qui le conduit en prison ?", answer: ["pain", "miche de pain", "une miche de pain"] },
        { question: "Quel est le nom de la fille de Fantine ?", answer: ["Cosette"] }
      ],
      "Le Comte de Monte-Cristo": [
        { question: "Sur quelle île Edmond Dantès est-il emprisonné ?", answer: ["If", "Château d'If", "l'île d'If"] },
        { question: "Quel trésor Edmond découvre-t-il grâce à l'abbé Faria ?", answer: ["Spada", "trésor de Spada", "le trésor de Spada"] }
      ],
      "Notre-Dame de Paris": [
        { question: "Quel est le métier de Quasimodo ?", answer: ["sonneur", "sonneur de cloches", "carillonneur"] },
        { question: "Comment s'appelle la bohémienne dont Quasimodo tombe amoureux ?", answer: ["Esmeralda", "La Esmeralda"] }
      ],
      "default": [
        { question: "Qui est l'auteur principal de ce livre ?", answer: ["auteur"] }
      ]
    };

    // Select questions for the current book or use default
    const bookQuestions = questions[bookTitle as keyof typeof questions] || questions.default;
    
    // Select a question based on chapter number (cycling through available questions)
    const questionIndex = (chapterNumber - 1) % bookQuestions.length;
    return bookQuestions[questionIndex];
  };

  const currentQuestion = getQuestion();

  const checkAnswer = (userAnswer: string): boolean => {
    const normalizedUserAnswer = userAnswer.trim().toLowerCase();
    
    return currentQuestion.answer.some(acceptedAnswer => 
      normalizedUserAnswer.includes(acceptedAnswer.toLowerCase())
    );
  };

  const handleSubmit = () => {
    if (!answer.trim()) {
      toast.error("Veuillez entrer une réponse");
      return;
    }

    const isCorrect = checkAnswer(answer);
    
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
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-4 text-center">
            Pour valider votre lecture du chapitre {chapterNumber} de "{bookTitle}", 
            veuillez répondre à la question suivante:
          </p>
          
          <div className="space-y-4">
            <h3 className="font-medium text-coffee-darker">{currentQuestion.question}</h3>
            
            <div className="mt-2">
              <Label htmlFor="answer" className="sr-only">Votre réponse</Label>
              <Textarea
                id="answer"
                placeholder="Votre réponse..."
                rows={3}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="w-full border-coffee-medium resize-none"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Tentatives: {attempts}/{maxAttempts}
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
