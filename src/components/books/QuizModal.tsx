
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
      "Les Misérables": {
        1: { question: "Comment s'appelle l'évêque qui accueille Jean Valjean ?", answer: ["myriel", "monseigneur myriel", "l'évêque myriel", "eveque myriel", "évêque myriel"] },
        2: { question: "Quel objet Jean Valjean vole-t-il qui le conduit en prison ?", answer: ["pain", "miche de pain", "une miche de pain", "du pain"] },
        3: { question: "Quel est le nom de la fille de Fantine ?", answer: ["cosette"] },
        4: { question: "Comment s'appelle l'inspecteur qui poursuit Jean Valjean ?", answer: ["javert"] },
        5: { question: "Dans quelle ville Jean Valjean devient-il maire ?", answer: ["montreuil", "montreuil-sur-mer"] }
      },
      "Le Comte de Monte-Cristo": {
        1: { question: "Sur quelle île Edmond Dantès est-il emprisonné ?", answer: ["if", "château d'if", "chateau d'if", "l'île d'if", "ile d'if", "île d'if"] },
        2: { question: "Quel trésor Edmond découvre-t-il grâce à l'abbé Faria ?", answer: ["spada", "trésor de spada", "tresor de spada", "le trésor de spada", "le tresor de spada"] },
        3: { question: "Quel est le nom du navire sur lequel travaillait Edmond ?", answer: ["pharaon", "le pharaon"] },
        4: { question: "Quel nom prend Edmond après son évasion ?", answer: ["monte-cristo", "comte de monte-cristo", "le comte de monte-cristo"] },
        5: { question: "Qui a dénoncé Edmond par jalousie ?", answer: ["danglars", "fernand", "mondego"] }
      },
      "Notre-Dame de Paris": {
        1: { question: "Quel est le métier de Quasimodo ?", answer: ["sonneur", "sonneur de cloches", "carillonneur"] },
        2: { question: "Comment s'appelle la bohémienne dont Quasimodo tombe amoureux ?", answer: ["esmeralda", "la esmeralda"] },
        3: { question: "Quel est le nom du prêtre qui a recueilli Quasimodo ?", answer: ["frollo", "claude frollo", "l'archidiacre frollo", "archidiacre frollo"] },
        4: { question: "Quel animal accompagne souvent Esmeralda ?", answer: ["chèvre", "chevre", "une chèvre", "une chevre", "djali"] },
        5: { question: "En quelle année se déroule l'histoire ?", answer: ["1482"] }
      },
      "Harry Potter à l'école des sorciers": {
        1: { question: "Où dort Harry Potter chez les Dursley ?", answer: ["placard", "sous l'escalier", "sous l escalier", "dans le placard", "placard sous l'escalier", "placard sous l escalier"] },
        2: { question: "Quel est le numéro du coffre de Harry à Gringotts ?", answer: ["687"] },
        3: { question: "Quel animal Harry achète-t-il comme compagnon ?", answer: ["chouette", "une chouette", "hibou", "un hibou", "hedwige"] },
        4: { question: "Dans quelle maison Harry est-il placé à Poudlard ?", answer: ["gryffondor"] },
        5: { question: "Quel objet magique Harry reçoit-il à Noël ?", answer: ["cape", "cape d'invisibilité", "cape d invisibilité", "une cape d'invisibilité"] }
      },
      "Le Petit Prince": {
        1: { question: "Sur quelle planète vit le Petit Prince ?", answer: ["b612", "asteroide b612", "astéroïde b612"] },
        2: { question: "Quel animal le Petit Prince demande-t-il au narrateur de dessiner au début ?", answer: ["mouton", "un mouton"] },
        3: { question: "Quelle fleur le Petit Prince aime-t-il particulièrement ?", answer: ["rose", "une rose", "sa rose"] },
        4: { question: "Quel animal rencontre le Petit Prince dans le désert ?", answer: ["renard", "un renard", "le renard"] },
        5: { question: "Comment le Petit Prince quitte-t-il la Terre ?", answer: ["serpent", "morsure", "morsure de serpent", "piqûre de serpent", "piqure de serpent"] }
      },
      "Les Trois Mousquetaires": {
        1: { question: "Comment s'appelle le jeune héros qui rejoint les mousquetaires ?", answer: ["d'artagnan", "dartagnan"] },
        2: { question: "Quel est le nom de la femme espionne aux ordres du cardinal ?", answer: ["milady", "milady de winter"] },
        3: { question: "Nommez l'un des trois mousquetaires.", answer: ["athos", "porthos", "aramis"] },
        4: { question: "Quelle devise célèbre unit les mousquetaires ?", answer: ["un pour tous", "tous pour un", "un pour tous, tous pour un"] },
        5: { question: "Que recherche la reine Anne d'Autriche à Londres ?", answer: ["ferrets", "les ferrets", "ferrets de diamants", "les ferrets de diamants"] }
      },
      "L'Étranger": {
        1: { question: "Comment s'appelle le personnage principal ?", answer: ["meursault"] },
        2: { question: "Quel événement ouvre le roman ?", answer: ["mort", "la mort", "mort de sa mère", "la mort de sa mère", "décès de sa mère"] },
        3: { question: "Dans quelle ville se déroule l'histoire ?", answer: ["alger"] },
        4: { question: "Quel crime commet Meursault ?", answer: ["meurtre", "un meurtre", "tue un arabe", "il tue un arabe"] },
        5: { question: "Quelle est la dernière chose que Meursault souhaite avant son exécution ?", answer: ["cris", "des cris", "huées", "des huées", "haine", "la haine"] }
      },
      "default": {
        1: { question: "Qui est l'auteur principal de ce livre ?", answer: ["auteur"] }
      }
    };

    // Select questions for the current book or use default
    const bookQuestions = questions[bookTitle as keyof typeof questions] || questions.default;
    
    // Get chapter-specific question or cycle through existing ones if chapter exceeds available questions
    const chapterQuestions = bookQuestions[chapterNumber as keyof typeof bookQuestions];
    if (chapterQuestions) {
      return chapterQuestions;
    } else {
      // Fallback: cycle through available questions if specific chapter question not available
      const availableChapters = Object.keys(bookQuestions).map(Number).filter(n => !isNaN(n)).sort((a, b) => a - b);
      const cycleIndex = (chapterNumber - 1) % availableChapters.length;
      const fallbackChapter = availableChapters[cycleIndex];
      return bookQuestions[fallbackChapter as keyof typeof bookQuestions];
    }
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
