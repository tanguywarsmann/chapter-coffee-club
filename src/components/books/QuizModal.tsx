
import React, { useState, useRef } from "react";
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
import { debugLog, auditJokerState, canUseJokers } from "@/utils/jokerConstraints";
import { collectJokerAuditData } from "@/utils/jokerAudit";
import { useAuth } from "@/contexts/AuthContext";
import { validateReadingSegmentBeta } from "@/services/reading/validationServiceBeta";

// Fixed: useJoker is always boolean, never undefined
type OnCompleteArgs = { correct: boolean; useJoker: boolean };

interface QuizModalProps {
  bookTitle: string;
  chapterNumber: number;
  onComplete: (args: OnCompleteArgs) => void;
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
  const [isRevealing, setIsRevealing] = useState(false);
  const maxAttempts = 3;
  const inFlightRef = useRef(false);

  // Récupérer l'utilisateur authentifié
  const { user } = useAuth();

  // Récupérer les informations de jokers via le hook dédié avec le bon userId
  const { jokersAllowed, jokersUsed, jokersRemaining: hookJokersRemaining, updateJokersInfo } = useJokersInfo({
    bookId: question.book_slug || progressId || null,
    userId: user?.id || null,
    expectedSegments
  });

  // Utiliser les jokers du hook si pas fournis en props
  const actualJokersRemaining = jokersRemaining ?? hookJokersRemaining;

  const handleSubmit = async () => {
    console.log("=== SINGLE VALIDATION CALL ===");
    
    if (!answer.trim()) {
      toast.error("Veuillez entrer une réponse");
      return;
    }

    // Prevent double submissions
    if (inFlightRef.current) {
      console.log("❌ Prevented double submission");
      return;
    }
    inFlightRef.current = true;

    try {
      if (!user?.id) {
        toast.error("Vous devez être connecté pour valider");
        return;
      }

      // Get book UUID from slug first
      const { data: bookData, error: bookError } = await supabase
        .from('books')
        .select('id')
        .eq('slug', question.book_slug)
        .maybeSingle();
      
      console.log("📚 Book lookup:", { bookData, bookError });
      
      if (bookError || !bookData) {
        console.error('Book lookup error:', bookError);
        toast.error("Erreur lors de la recherche du livre.");
        return;
      }

      console.log("🔍 DEBUG: User answer validation:", {
        userAnswer: answer.trim(),
        bookId: bookData.id,
        questionId: question.id,
        attempts: attempts
      });

      // Validation côté serveur - laisse le serveur vérifier si la réponse est correcte
      const result = await validateReadingSegmentBeta({
        bookId: bookData.id,
        questionId: question.id,
        answer: answer.trim(),
        userId: user.id,
        usedJoker: false,
        correct: null // Laisser le serveur décider
      });

      console.log("✅ Validation result:", result);

      if (result?.ok) {
        toast.success("Réponse correcte ! Segment validé !");
        
        // Call onComplete ONCE - this should trigger all necessary updates
        console.log("📞 Calling onComplete ONCE");
        onComplete({ correct: true, useJoker: false });
      } else {
        // Réponse incorrecte - gérer les tentatives et jokers
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        toast.error("Réponse incorrecte. Essayez encore !");
        
        // Proposer le joker dès la 1ère mauvaise réponse
        const canUseJokerFlag = canUseJokers(expectedSegments);
        if (newAttempts >= 1 && actualJokersRemaining > 0 && canUseJokerFlag && !isUsingJoker) {
          setJokerStartTime(Date.now());
          setShowJokerConfirmation(true);
        } else if (!canUseJokerFlag) {
          // Joker not available due to constraint
          toast.error("Les jokers ne sont pas disponibles pour ce livre (moins de 3 segments).");
          if (newAttempts >= maxAttempts) {
            onComplete({ correct: false, useJoker: false });
          }
        } else if (newAttempts >= maxAttempts) {
          toast.error("Nombre maximum de tentatives atteint. Réessayez plus tard.");
          onComplete({ correct: false, useJoker: false });
        }
      }
      
    } catch (error) {
      console.error('❌ Single validation error:', error);
      
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      
      // Check if joker can be used immediately after first wrong answer
      const canUseJokerFlag = canUseJokers(expectedSegments);
      const canUseJoker = canUseJokerFlag && actualJokersRemaining > 0 && !isUsingJoker;
      
      console.log('[JOKER DEBUG] Quiz failed - checking joker availability:', {
        expectedSegments,
        canUseJokerFlag,
        actualJokersRemaining,
        isUsingJoker,
        canUseJoker,
        newAttempts
      });
      
      if (canUseJoker && newAttempts >= 1) {
        setJokerStartTime(Date.now());
        setShowJokerConfirmation(true);
      } else if (!canUseJokerFlag) {
        // Joker not available due to constraint - show appropriate message
        toast.error("Les jokers ne sont pas disponibles pour ce livre (moins de 3 segments).");
        if (newAttempts >= maxAttempts) {
          onComplete({ correct: false, useJoker: false });
        } else {
          toast.error(`Réponse incorrecte. Il vous reste ${maxAttempts - newAttempts} tentative(s).`);
        }
      } else if (newAttempts >= maxAttempts) {
        toast.error("Nombre maximum de tentatives atteint. Réessayez plus tard.");
        onComplete({ correct: false, useJoker: false });
      } else {
        toast.error(`Réponse incorrecte. Il vous reste ${maxAttempts - newAttempts} tentative(s).`);
      }
    } finally {
      inFlightRef.current = false;
      console.log("=== END SINGLE VALIDATION ===");
    }
  };

  const handleJokerConfirm = async () => {
    setShowJokerConfirmation(false);
    
    // Prevent double-click during revelation
    if (isRevealing) return;
    setIsRevealing(true);
    
    try {
      // AUDIT: Log détaillé de l'utilisation du joker (non intrusif)
      debugLog(`Joker confirmation started`, {
        userId: user?.id,
        questionId: question?.id,
        bookTitle: bookTitle,
        segment: chapterNumber,
        expectedSegments,
        jokersRemaining: actualJokersRemaining,
        jokersAllowed,
        jokersUsed
      });

      // AUDIT: État du livre avant utilisation joker
      if (question?.book_id) {
        const bookId = question.book_id;
        auditJokerState(bookId, expectedSegments, 'QuizModal.handleJokerConfirm');
        
        collectJokerAuditData({
          bookId,
          expectedSegments,
          currentJokersAllowed: jokersAllowed,
          currentJokersUsed: jokersUsed,
          currentJokersRemaining: actualJokersRemaining,
          wouldBeBlockedByNewRule: expectedSegments < 3,
          context: 'QuizModal.handleJokerConfirm'
        });
      }
      
      console.log('[JOKER DEBUG] Starting joker confirmation');
      console.log('[JOKER DEBUG] User:', user?.id);
      console.log('[JOKER DEBUG] Question:', question);
      console.log('[JOKER DEBUG] Chapter:', chapterNumber);
      console.log('[JOKER DEBUG] Actual jokers remaining:', actualJokersRemaining);
      
      // Trace before call
      console.info('[JOKER] before-call', {
        bookSlug: question?.book_slug,
        segment: chapterNumber,
        questionId: question?.id
      });

      // Use joker and reveal correct answer
      const result = await useJokerAndReveal({
        bookSlug: question.book_slug,
        segment: chapterNumber,
        questionId: question.id,
        expectedSegments
      });
      
      console.log('[JOKER DEBUG] Result received:', result);

      // Trace after call
      console.info('[JOKER] after-call', { ok: true, payload: result });

      const answer = (result?.correctAnswer ?? "").trim();
      if (!answer) {
        console.error("[JOKER] empty correctAnswer", result);
        toast.error("Impossible d'afficher la bonne réponse (données manquantes).");
        return;
      }

      // 1) État d'abord
      setRevealedAnswer(answer);
      setAnswerRevealedAt(result?.revealedAt ?? new Date().toISOString());
      setShowAnswerReveal(true);

      // 2) Analytics ensuite (protégées)
      if (jokerStartTime) {
        console.log("📊 Tracking joker analytics");
        try {
          await trackJokerUsed({
            bookId: question.book_slug || '',
            segment: chapterNumber,
            attemptsBefore: attempts,
            timeToJokerMs: Date.now() - jokerStartTime
          });
          
          await trackAnswerRevealed({
            bookId: question.book_slug || '',
            segment: chapterNumber,
            correctAnswerLength: answer.length
          });
        } catch (analyticsError) {
          console.error('Analytics error:', analyticsError);
        }
      }

      // Mettre à jour les informations de jokers après utilisation
      await updateJokersInfo();

      toast.success("Joker utilisé ! La bonne réponse est révélée.");
    } catch (error) {
      console.error('Joker reveal error:', error);
      toast.error("Erreur lors de l'utilisation du joker. Veuillez réessayer.");
      // Ne pas fermer le flux ici : permettre de réessayer
    } finally {
      setIsRevealing(false);
    }
  };

  const handleAnswerRevealContinue = () => {
    setShowAnswerReveal(false);
    // Fixed: Always pass boolean for useJoker
    onComplete({ correct: true, useJoker: true });
  };

  const handleJokerCancel = () => {
    setShowJokerConfirmation(false);
    setJokerStartTime(null);
    // Fixed: Always pass boolean for useJoker
    onComplete({ correct: false, useJoker: false });
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
          
          {/* Log des expected_segments pour debug */}
          {import.meta.env.VITE_DEBUG_JOKER && (
            <>
              {console.info("[JOKER expectedSegments]", expectedSegments, bookTitle)}
            </>
          )}
          
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
              disabled={!answer.trim() || showAnswerReveal || isRevealing}
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
          
          {revealedAnswer && (
            <CorrectAnswerReveal
              correctAnswer={revealedAnswer}
              segment={chapterNumber}
              revealedAt={answerRevealedAt ?? new Date().toISOString()}
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
        jokersRemaining={actualJokersRemaining}
        isUsingJoker={isUsingJoker}
        expectedSegments={expectedSegments}
        onConfirm={handleJokerConfirm}
        onCancel={handleJokerCancel}
      />
    </>
  );
}
