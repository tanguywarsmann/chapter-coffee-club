
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
      <p className="text-body-sm text-foreground/80 mb-4 text-center">
        Pour valider votre lecture du chapitre {chapterNumber} de "{bookTitle}", 
        veuillez répondre à la question suivante:
      </p>
      
      <div className="space-y-4">
        <h3 className="font-medium text-foreground" id="quiz-question">
          {question}
        </h3>
        
        <div className="mt-2">
          <Label htmlFor="answer" className="text-body-sm font-medium text-foreground">
            Votre réponse
          </Label>
          <Textarea
            id="answer"
            placeholder="Votre réponse..."
            rows={3}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="w-full border-coffee-medium resize-none mt-1 text-foreground bg-background"
            aria-describedby="quiz-question attempts-counter"
            aria-required="true"
          />
          <p 
            id="attempts-counter"
            className="text-caption text-foreground/70 mt-1"
            aria-live="polite"
          >
            Tentatives: {attempts}/{maxAttempts}
          </p>
        </div>
      </div>
    </div>
  );
}
