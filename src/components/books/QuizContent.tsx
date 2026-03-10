
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/i18n/LanguageContext";

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
  const { t } = useTranslation();
  const q = t.reading.quiz;

  return (
    <div className="py-2 space-y-3">
      {/* Segment badge */}
      <div className="text-center">
        <span className="inline-block text-xs font-semibold tracking-wide uppercase text-primary/80">
          {q.segmentLabel} {chapterNumber}
        </span>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          {q.segmentHint}
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
          placeholder={q.placeholder}
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
          {attempts}/{maxAttempts} {q.attempts}
        </p>
      </div>
    </div>
  );
}
