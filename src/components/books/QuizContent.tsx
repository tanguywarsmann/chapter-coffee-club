
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface QuizContentProps {
  bookTitle: string;
  chapterNumber: number;
  question: string;
  answer: string;
  attempts: number;
  maxAttempts: number;
  setAnswer: (answer: string) => void;
}

export function QuizContent({
  bookTitle,
  chapterNumber,
  question,
  answer,
  attempts,
  maxAttempts,
  setAnswer,
}: QuizContentProps) {
  return (
    <div className="py-4">
      <p className="text-sm text-muted-foreground mb-4 text-center">
        Pour valider votre lecture du chapitre {chapterNumber} de "{bookTitle}", 
        veuillez répondre à la question suivante:
      </p>
      
      <div className="space-y-4">
        <h3 className="font-medium text-coffee-darker">{question}</h3>
        
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
  );
}
