
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { DialogDescription } from "@/components/ui/dialog";

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
        { question: "Comment s'appelle l'évêque qui accueille Jean Valjean ?", answer: ["myriel", "monseigneur myriel", "l'évêque myriel", "eveque myriel", "évêque myriel"] },
        { question: "Quel objet Jean Valjean vole-t-il qui le conduit en prison ?", answer: ["pain", "miche de pain", "une miche de pain", "du pain"] },
        { question: "Quel est le nom de la fille de Fantine ?", answer: ["cosette"] }
      ],
      "Le Comte de Monte-Cristo": [
        { question: "Sur quelle île Edmond Dantès est-il emprisonné ?", answer: ["if", "château d'if", "chateau d'if", "l'île d'if", "ile d'if", "île d'if"] },
        { question: "Quel trésor Edmond découvre-t-il grâce à l'abbé Faria ?", answer: ["spada", "trésor de spada", "tresor de spada", "le trésor de spada", "le tresor de spada"] }
      ],
      "Notre-Dame de Paris": [
        { question: "Quel est le métier de Quasimodo ?", answer: ["sonneur", "sonneur de cloches", "carillonneur"] },
        { question: "Comment s'appelle la bohémienne dont Quasimodo tombe amoureux ?", answer: ["esmeralda", "la esmeralda"] }
      ],
      "Harry Potter à l'école des sorciers": [
        { question: "Où dort Harry Potter chez les Dursley ?", answer: ["placard", "sous l'escalier", "sous l escalier", "dans le placard", "placard sous l'escalier", "placard sous l escalier"] },
        { question: "Quel est le numéro du coffre de Harry à Gringotts ?", answer: ["687"] }
      ],
      "Le Petit Prince": [
        { question: "Sur quelle planète vit le Petit Prince ?", answer: ["b612", "asteroide b612", "astéroïde b612"] },
        { question: "Quel animal le Petit Prince demande-t-il au narrateur de dessiner au début ?", answer: ["mouton", "un mouton"] }
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
    if (!userAnswer.trim()) return false;
    
    const normalizedUserAnswer = userAnswer.trim().toLowerCase();
    console.log("Checking answer:", normalizedUserAnswer);
    console.log("Accepted answers:", currentQuestion.answer);
    
    return currentQuestion.answer.some(acceptedAnswer => {
      const isMatch = normalizedUserAnswer.includes(acceptedAnswer.toLowerCase());
      console.log(`Checking if "${normalizedUserAnswer}" includes "${acceptedAnswer}": ${isMatch}`);
      return isMatch;
    });
  };

  const handleSubmit = () => {
    if (!answer.trim()) {
      toast.error("Veuillez entrer une réponse");
      return;
    }

    const isCorrect = checkAnswer(answer);
    console.log("Is answer correct?", isCorrect);
    
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
            Répondez par un mot ou une courte phrase.
          </DialogDescription>
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
