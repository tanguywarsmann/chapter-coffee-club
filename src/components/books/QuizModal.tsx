// src/components/books/QuizModal.tsx
import React, { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { QuizContent } from "./QuizContent";
import { PublicReadingQuestion } from "@/types/reading";
// import { JokerConfirmationModal } from "./JokerConfirmationModal"; // (non utilisé)
import { CorrectAnswerReveal } from "./CorrectAnswerReveal";
import { useJokersInfo } from "@/hooks/useJokersInfo";
import { supabase } from "@/integrations/supabase/client";
import { useJokerAndReveal } from "@/services/jokerService";
import { trackJokerUsed, trackAnswerRevealed } from "@/services/analytics/jokerAnalytics";
import { debugLog, auditJokerState, canUseJokers } from "@/utils/jokerConstraints";
import { collectJokerAuditData } from "@/utils/jokerAudit";
import { useAuth } from "@/contexts/AuthContext";
import { validateReadingSegmentBeta } from "@/services/reading/validationServiceBeta"; // garde la validation serveur existante

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
  isUsingJoker = false,
}: QuizModalProps) {
  const [answer, setAnswer] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [showJokerConfirmation, setShowJokerConfirmation] = useState(false);
  const [showAnswerReveal, setShowAnswerReveal] = useState(false);
  const [revealedAnswer, setRevealedAnswer] = useState<string | null>(null);
  const [answerRevealedAt, setAnswerRevealedAt] = useState<string | null>(null);
  const [jokerStartTime, setJokerStartTime] = useState<number | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const maxAttempts = 3;

  const inFlightRef = useRef(false);
  const hasCalledComplete = useRef(false); // Protection contre les appels multiples
  const abortRef = useRef<AbortController | null>(null); // 🔒 annulation requête

  const { user } = useAuth();
  const shouldReduce = useReducedMotion();

  // Reset protections au changement de question + cleanup sur unmount
  useEffect(() => {
    hasCalledComplete.current = false;
    return () => {
      hasCalledComplete.current = false;
      abortRef.current?.abort();
    };
  }, [question?.id]);

  // Jokers (hook centralisé)
  const {
    jokersAllowed,
    jokersUsed,
    jokersRemaining: hookJokersRemaining,
    updateJokersInfo,
  } = useJokersInfo({
    bookId: question.book_slug || progressId || null,
    userId: user?.id || null,
    expectedSegments,
  });

  const actualJokersRemaining = jokersRemaining ?? hookJokersRemaining;

  // Fermer proprement (annule la requête en vol)
  const handleClose = () => {
    abortRef.current?.abort();
    onClose();
  };

  const handleSubmit = async () => {
    if (!answer.trim()) {
      toast.error("Veuillez entrer une réponse");
      return;
    }

    // ✅ Phase 1.3: Simplified anti-double-click
    if (isSubmitting) {
      console.log("❌ Prevented double submission");
      return;
    }
    setIsSubmitting(true);

    try {
      if (!user?.id) {
        toast.error("Vous devez être connecté pour valider");
        return;
      }

      // Résoudre le bookId depuis le slug
      const { data: bookData, error: bookError } = await supabase
        .from("books")
        .select("id")
        .eq("slug", question.book_slug)
        .maybeSingle();

      if (bookError || !bookData?.id) {
        console.error("Book lookup error:", bookError);
        toast.error("Erreur lors de la recherche du livre.");
        return;
      }

      // (Re)créer un AbortController pour cette tentative
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      console.log("🔍 Validation attempt", {
        userAnswer: answer.trim(),
        bookId: bookData.id,
        questionId: question.id,
        attempts,
      });

      // Validation côté serveur (service existant) — on passe un AbortSignal (cast safe)
      const result = await (validateReadingSegmentBeta as any)({
        bookId: bookData.id,
        questionId: question.id,
        answer: answer.trim(),
        userId: user.id,
        usedJoker: false,
        correct: null, // laisser le serveur décider
        signal: abortRef.current.signal, // 👈 annulation si fermeture
      });

      console.log("✅ Validation result:", result);

      if (result?.ok) {
        // ✅ Phase 1.2: Afficher les XP dans le toast
        toast.success("✅ Segment validé !", {
          description: "+10 XP • Prochain segment dans 30 pages",
          duration: 4000,
        });
        if (!hasCalledComplete.current) {
          hasCalledComplete.current = true;
          onComplete({ correct: true, useJoker: false });
        }
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        toast.error("Réponse incorrecte", {
          description: `${maxAttempts - newAttempts} tentative(s) restante(s)`,
          duration: 4000,
        });

        // Joker proposé dès la 1ère mauvaise réponse si autorisé serveur
        const canUseJokerFlag = canUseJokers(expectedSegments);
        if (newAttempts >= 1 && actualJokersRemaining > 0 && canUseJokerFlag && !isUsingJoker) {
          setJokerStartTime(Date.now());
          setShowJokerConfirmation(true);
        } else if (!canUseJokerFlag) {
          toast.error("Jokers indisponibles", {
            description: "Livre trop court (< 3 segments)",
            duration: 4000,
          });
          if (newAttempts >= maxAttempts && !hasCalledComplete.current) {
            hasCalledComplete.current = true;
            onComplete({ correct: false, useJoker: false });
          }
        } else if (newAttempts >= maxAttempts) {
          toast.error("Tentatives épuisées", {
            description: "Réessayez plus tard",
            duration: 4000,
          });
          if (!hasCalledComplete.current) {
            hasCalledComplete.current = true;
            onComplete({ correct: false, useJoker: false });
          }
        }
      }
    } catch (error: any) {
      if (error?.name === "AbortError") {
        console.warn("⛔ Validation aborted");
        return;
      }
      console.error("❌ Single validation error:", error);

      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      const canUseJokerFlag = canUseJokers(expectedSegments);
      const canUseJoker =
        canUseJokerFlag && actualJokersRemaining > 0 && !isUsingJoker;

      if (canUseJoker && newAttempts >= 1) {
        setJokerStartTime(Date.now());
        setShowJokerConfirmation(true);
      } else if (!canUseJokerFlag) {
        toast.error("Les jokers ne sont pas disponibles pour ce livre (moins de 3 segments).");
        if (newAttempts >= maxAttempts) {
          if (!hasCalledComplete.current) {
            hasCalledComplete.current = true;
            onComplete({ correct: false, useJoker: false });
          }
        } else {
          toast.error(`Réponse incorrecte. Il vous reste ${maxAttempts - newAttempts} tentative(s).`);
        }
      } else if (newAttempts >= maxAttempts) {
        toast.error("Nombre maximum de tentatives atteint. Réessayez plus tard.");
        if (!hasCalledComplete.current) {
          hasCalledComplete.current = true;
          onComplete({ correct: false, useJoker: false });
        }
      } else {
        toast.error(`Réponse incorrecte. Il vous reste ${maxAttempts - newAttempts} tentative(s).`);
      }
    } finally {
      setIsSubmitting(false);
      console.log("=== END SINGLE VALIDATION ===");
    }
  };

  const handleJokerConfirm = async () => {
    setShowJokerConfirmation(false);

    if (isRevealing) return; // anti double-clic
    setIsRevealing(true);

    try {
      debugLog(`Joker confirmation started`, {
        userId: user?.id,
        questionId: question?.id,
        bookTitle,
        segment: chapterNumber,
        expectedSegments,
        jokersRemaining: actualJokersRemaining,
        jokersAllowed,
        jokersUsed,
      });

      if (question?.book_id) {
        const bookId = question.book_id;
        auditJokerState(bookId, expectedSegments, "QuizModal.handleJokerConfirm");
        collectJokerAuditData({
          bookId,
          expectedSegments,
          currentJokersAllowed: jokersAllowed,
          currentJokersUsed: jokersUsed,
          currentJokersRemaining: actualJokersRemaining,
          wouldBeBlockedByNewRule: expectedSegments < 3,
          context: "QuizModal.handleJokerConfirm",
        });
      }

      console.info("[JOKER] before-call", {
        bookSlug: question?.book_slug,
        segment: chapterNumber,
        questionId: question?.id,
      });

      const result = await useJokerAndReveal({
        bookId: question.book_id, // l’Edge Function peut déduire via questionId si besoin
        questionId: question.id,
        userId: user!.id,
        expectedSegments,
      });

      console.info("[JOKER] after-call", { payload: result });

      // Compat: supporte { answer } ou string
      const revealed = (typeof result === "string" ? result : result?.answer ?? "").trim();
      if (!revealed) {
        console.error("[JOKER] empty answer", result);
        toast.error("Impossible d'afficher la bonne réponse (données manquantes).");
        return;
      }

      setRevealedAnswer(revealed);
      setAnswerRevealedAt(new Date().toISOString());
      setShowAnswerReveal(true);

      // Analytics
      if (jokerStartTime) {
        try {
          await trackJokerUsed({
            bookId: question.book_slug || "",
            segment: chapterNumber,
            attemptsBefore: attempts,
            timeToJokerMs: Date.now() - jokerStartTime,
          });
          await trackAnswerRevealed({
            bookId: question.book_slug || "",
            segment: chapterNumber,
            correctAnswerLength: revealed.length,
          });
        } catch (analyticsError) {
          console.error("Analytics error:", analyticsError);
        }
      }

      await updateJokersInfo();
      toast.success("Joker utilisé ! La bonne réponse est révélée.");
    } catch (error: any) {
      console.error("Joker reveal error:", error);
      // Si le backend renvoie 403 pour < 3 segments
      if (error?.status === 403 || /trop court|moins de 3 segments/i.test(error?.message || "")) {
        toast.error("Jokers indisponibles sur ce livre (moins de 3 segments).");
      } else {
        toast.error("Erreur lors de l'utilisation du joker. Veuillez réessayer.");
      }
    } finally {
      setIsRevealing(false);
    }
  };

  const handleAnswerRevealContinue = () => {
    setShowAnswerReveal(false);
    if (!hasCalledComplete.current) {
      hasCalledComplete.current = true;
      onComplete({ correct: true, useJoker: true });
    }
  };

  const handleJokerCancel = () => {
    setShowJokerConfirmation(false);
    setJokerStartTime(null);
    if (!hasCalledComplete.current) {
      hasCalledComplete.current = true;
      onComplete({ correct: false, useJoker: false });
    }
  };

  return (
    <>
      {/* Quiz main dialog */}
      <Dialog
        open={!showJokerConfirmation && !showAnswerReveal}
        onOpenChange={handleClose}
      >
        <DialogContent className="sm:max-w-md border-coffee-medium">
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

          <AnimatePresence mode="wait">
            <motion.div
              key="quiz-content"
              initial={{ opacity: 0, y: shouldReduce ? 0 : 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: shouldReduce ? 0 : -8 }}
              transition={{ duration: 0.18 }}
            >
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
              
              {/* ✅ Phase 3.1: Aria-live pour les tentatives */}
              <div className="sr-only" aria-live="polite" aria-atomic="true">
                {attempts > 0 && `${maxAttempts - attempts} tentative(s) restante(s)`}
              </div>

              {/* Debug expected_segments */}
              {import.meta.env.VITE_DEBUG_JOKER && (
                <>{console.info("[JOKER expectedSegments]", expectedSegments, bookTitle)}</>
              )}

              <DialogFooter className="sm:justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="border-coffee-medium text-foreground hover:bg-muted"
                  aria-label="Annuler le quiz de lecture"
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={
                    !answer.trim() || showAnswerReveal || isRevealing || isSubmitting
                  }
                  className="bg-coffee-dark hover:bg-coffee-darker text-white"
                  aria-label="Valider ma réponse au quiz"
                  aria-describedby={!answer.trim() ? "answer-requirement" : undefined}
                  data-testid="submit-answer-button"
                >
                  {isSubmitting ? "Validation..." : "Valider ma réponse"}
                </Button>
                {!answer.trim() && (
                  <div id="answer-requirement" className="sr-only" aria-live="polite">
                    Vous devez saisir une réponse avant de valider
                  </div>
                )}
              </DialogFooter>
            </motion.div>
          </AnimatePresence>
        </DialogContent>
      </Dialog>

      {/* Answer Reveal Dialog */}
      <Dialog open={showAnswerReveal} onOpenChange={() => setShowAnswerReveal(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center font-serif">Segment {chapterNumber} validé</DialogTitle>
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

      {/* Joker Confirmation Dialog */}
      <Dialog open={showJokerConfirmation} onOpenChange={() => setShowJokerConfirmation(false)}>
        <DialogContent className="sm:max-w-md border-coffee-medium">
          <DialogHeader>
            <DialogTitle className="text-center font-serif text-coffee-darker">
              Utiliser un joker
            </DialogTitle>
            <DialogDescription className="text-center text-body-sm text-foreground/80">
              Révèle la bonne réponse pour ce segment en dépensant un joker.
            </DialogDescription>
          </DialogHeader>

          <AnimatePresence mode="wait">
            <motion.div
              key="joker-content"
              initial={{ opacity: 0, scale: shouldReduce ? 1 : 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: shouldReduce ? 1 : 0.98 }}
              transition={{ duration: 0.18 }}
            >
              <div className="py-4 text-center space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-amber-800 text-body-sm">
                    Utiliser un joker révélera immédiatement la bonne réponse et validera ce segment.
                  </p>
                </div>

                <div className="text-body-sm text-muted-foreground">
                  <p>
                    Jokers restants :{" "}
                    <span className="font-semibold text-coffee-dark">{actualJokersRemaining}</span>
                  </p>
                  <p>Segment : {chapterNumber}</p>
                </div>
              </div>

              <DialogFooter className="sm:justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={handleJokerCancel}
                  disabled={isRevealing}
                  className="border-coffee-medium text-foreground hover:bg-muted"
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleJokerConfirm}
                  disabled={isRevealing}
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                >
                  {isRevealing ? "Révélation..." : "Utiliser le joker"}
                </Button>
              </DialogFooter>
            </motion.div>
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </>
  );
}
