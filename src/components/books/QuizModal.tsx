
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface QuizModalProps {
  bookTitle: string;
  chapterNumber: number;
  onComplete: (passed: boolean) => void;
  onClose: () => void;
}

export function QuizModal({ bookTitle, chapterNumber, onComplete, onClose }: QuizModalProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  // Mock questions - in a real app these would come from a database
  const question = {
    text: "Quelle est la principale thématique abordée dans ce chapitre ?",
    options: [
      { id: "a", text: "La résilience face aux défis" },
      { id: "b", text: "L'importance des relations familiales" },
      { id: "c", text: "La découverte de soi à travers le voyage" },
      { id: "d", text: "L'impact de la technologie sur nos vies" },
    ],
    correctAnswer: "c" // In a real app, this would be hidden from frontend
  };

  const handleSubmit = () => {
    if (selectedAnswer) {
      // In a real app, validation would happen on the server
      onComplete(selectedAnswer === question.correctAnswer);
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
            
            <RadioGroup value={selectedAnswer || ""} onValueChange={setSelectedAnswer}>
              {question.options.map((option) => (
                <div key={option.id} className="flex items-center space-x-2 py-2">
                  <RadioGroupItem 
                    value={option.id} 
                    id={option.id} 
                    className="border-coffee-medium text-coffee-dark"
                  />
                  <Label htmlFor={option.id} className="cursor-pointer w-full">
                    {option.text}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>
        
        <DialogFooter className="sm:justify-center gap-2">
          <Button variant="outline" onClick={onClose} className="border-coffee-medium">
            Annuler
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!selectedAnswer}
            className="bg-coffee-dark hover:bg-coffee-darker"
          >
            Valider ma réponse
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
