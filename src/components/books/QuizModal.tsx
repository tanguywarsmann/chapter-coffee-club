
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { QuizContent } from "./QuizContent";
import { PublicReadingQuestion } from "@/types/reading";
import { JokerConfirmationModal } from "./JokerConfirmationModal";
import { CorrectAnswerReveal } from "./CorrectAnswerReveal";
import { useJokersInfo } from "@/hooks/useJokersInfo";
import { supabase } from "@/integrations/supabase/client";
import { useJokerAndReveal } from "@/services/jokerService";
import { trackJokerUsed, trackAnswerRevealed } from "@/services/analytics/jokerAnalytics";

interface QuizModalProps {
  bookTitle: string;
  chapterNumber: number;
  onComplete: (passed: boolean, useJoker?: boolean) => void;
  onClose: () => void;
  question: PublicReadingQuestion;
  expectedSegments?: number;
  progressId?: string;
  jokersRemaining?: number;
  isUsingJoker?: boolean;
}

export function QuizModal({ 
  bookTitle,
  chapterNumber,
  onComplete,
  onClose,
  question,
  expectedSegments = 0,
  progressId,
  jokersRemaining = 0,
  isUsingJoker = false
}: QuizModalProps) {
  const [answer, setAnswer] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [showJokerConfirmation, setShowJokerConfirmation] = useState(false);
  const [showAnswerReveal, setShowAnswerReveal] = useState(false);
  const [revealedAnswer, setRevealedAnswer] = useState<string | null>(null);
  const [answerRevealedAt, setAnswerRevealedAt] = useState<string | null>(null);
  const [jokerStartTime, setJokerStartTime] = useState<number | null>(null);
  const maxAttempts = 3;

  // Récupérer les informations de jokers via le hook dédié
  const { jokersAllowed, jokersUsed } = useJokersInfo({
    bookId: question.book_slug || progressId || null,
    userId: null, // Pas accès direct au userId ici
    expectedSegments
  });

  const handleSubmit = async () => {
    if (!answer.trim()) {
      toast.error("Veuillez entrer une réponse");
      return;
    }

    try {
      // Use secure server-side answer validation
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Vous devez être connecté pour valider une réponse");
        return;
      }

      const { data, error } = await supabase.functions.invoke('validate-answer', {
        body: {
          questionId: question.id,
          userAnswer: answer.trim(),
          bookId: question.book_slug,
          segment: chapterNumber,
          progressId
        }
      });

      if (error) {
        console.error('Validation error:', error);
        toast.error("Erreur lors de la validation. Veuillez réessayer.");
        return;
      }

      const { isCorrect } = data;
      
      if (isCorrect) {
        toast.success("Bonne réponse !");
        onComplete(true);
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        
        // Check if joker can be used immediately after first wrong answer
        const canUseJoker = jokersRemaining > 0 && !isUsingJoker;
        if (canUseJoker) {
          setJokerStartTime(Date.now());
          setShowJokerConfirmation(true);
        } else if (newAttempts >= maxAttempts) {
          toast.error("Nombre maximum de tentatives atteint. Réessayez plus tard.");
          onComplete(false);
        } else {
          toast.error(`Réponse incorrecte. Il vous reste ${maxAttempts - newAttempts} tentative(s).`);
        }
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error("Erreur lors de la soumission. Veuillez réessayer.");
    }
  };

  const handleJokerConfirm = async () => {
    setShowJokerConfirmation(false);
    
    try {
      // Use joker and reveal correct answer
      const result = await useJokerAndReveal({
        bookSlug: question.book_slug,
        segment: chapterNumber,
        questionId: question.id
      });

      // Track analytics
      if (jokerStartTime) {
        trackJokerUsed({
          bookId: question.book_slug || '',
          segment: chapterNumber,
          attemptsBefore: attempts,
          timeToJokerMs: Date.now() - jokerStartTime
        });
      }

      trackAnswerRevealed({
        bookId: question.book_slug || '',
        segment: chapterNumber,
        correctAnswerLength: result.correctAnswer.length
      });

      // Set revealed answer state
      setRevealedAnswer(result.correctAnswer);
      setAnswerRevealedAt(result.revealedAt);
      setShowAnswerReveal(true);

      toast.success("Joker utilisé ! La bonne réponse est révélée.");
    } catch (error) {
      console.error('Joker reveal error:', error);
      toast.error("Erreur lors de l'utilisation du joker. Veuillez réessayer.");
      // Fallback to normal joker completion
      onComplete(false, true);
    }
  };

  const handleAnswerRevealContinue = () => {
    setShowAnswerReveal(false);
    onComplete(true); // Answer was validated with joker
  };

  const handleJokerCancel = () => {
    setShowJokerConfirmation(false);
    setJokerStartTime(null);
    onComplete(false); // Just fail normally
  };

  return (
    <>
      <Dialog 
        open={!showJokerConfirmation && !showAnswerReveal} 
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
              className="text-center text-body-sm text-foreground/80"
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
            data-testid="quiz-answer-input"
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
              data-testid="submit-answer-button"
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

      {/* Answer Reveal Dialog */}
      <Dialog open={showAnswerReveal} onOpenChange={() => setShowAnswerReveal(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center font-serif">
              Segment {chapterNumber} validé
            </DialogTitle>
          </DialogHeader>
          
          {revealedAnswer && answerRevealedAt && (
            <CorrectAnswerReveal
              correctAnswer={revealedAnswer}
              segment={chapterNumber}
              revealedAt={answerRevealedAt}
              onContinue={handleAnswerRevealContinue}
            />
          )}
        </DialogContent>
      </Dialog>

      <JokerConfirmationModal
        isOpen={showJokerConfirmation}
        segment={chapterNumber}
        jokersUsed={jokersUsed}
        jokersAllowed={jokersAllowed}
        jokersRemaining={jokersRemaining}
        isUsingJoker={isUsingJoker}
        onConfirm={handleJokerConfirm}
        onCancel={handleJokerCancel}
      />
    </>
  );
}
