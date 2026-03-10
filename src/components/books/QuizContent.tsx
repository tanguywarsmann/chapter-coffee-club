
import { Input } from "@/components/ui/input";

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
    <div className="py-2 space-y-3">
      {/* Segment badge */}
      <div className="text-center">
        <span className="inline-block text-xs font-semibold tracking-wide uppercase text-primary/80">
          Segment {chapterNumber}
        </span>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          Environ 30 pages, variable selon l'édition
        </p>
      </div>

      {/* Question — compact */}
      <p
        className="text-sm text-foreground/90 leading-snug text-center"
        id="quiz-question"
      >
        {question}
      </p>

      {/* Single-line input */}
      <div>
        <Input
          id="answer"
          placeholder="Réponse en un mot"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          className="h-9 border-coffee-medium/60 text-sm text-foreground bg-background placeholder:text-muted-foreground/60"
          aria-describedby="quiz-question attempts-counter"
          aria-required="true"
          autoComplete="off"
        />
        <p
          id="attempts-counter"
          className="text-[11px] text-muted-foreground mt-1 text-right"
          aria-live="polite"
        >
          {attempts}/{maxAttempts} tentatives
        </p>
      </div>
    </div>
  );
}
