
import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Book } from "@/types/book";
import { toast } from "sonner";
import { initializeNewBookReading, syncBookWithAPI } from "@/services/reading";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { ValidationModal } from "./ValidationModal";
import { QuizModal } from "./QuizModal";
import { getQuestionForBookSegment, getFallbackQuestion, isSegmentAlreadyValidated } from "@/services/questionService";
import { ReadingQuestion } from "@/types/reading";
import { validateReading } from "@/services/reading/validationService";
import { BookDetailHeader } from "./BookDetailHeader";
import { BookCoverInfo } from "./BookCoverInfo";
import { BookProgressBar } from "./BookProgressBar";
import { BookDescription } from "./BookDescription";
import { Button } from "@/components/ui/button";

interface BookDetailProps {
  book: Book;
  onChapterComplete?: (bookId: string) => void;
}

export const BookDetail = ({ book, onChapterComplete }: BookDetailProps) => {
  const [isInitializing, setIsInitializing] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [validationSegment, setValidationSegment] = useState<number | null>(null);
  const [currentBook, setCurrentBook] = useState<Book>(book);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [currentQuestion, setCurrentQuestion] = useState<ReadingQuestion | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user?.id) {
        setUserId(data.user.id);
      } else {
        toast.warning("Vous n'êtes pas connecté. Certaines fonctionnalités seront limitées.");
      }
    };
    getUser();
  }, []);

  useEffect(() => {
    if (currentBook && currentBook.totalChapters) {
      setProgressPercent(
        Math.min(
          100,
          Math.round(((currentBook.chaptersRead || 0) / currentBook.totalChapters) * 100)
        )
      );
    }
  }, [currentBook]);

  // Gestion du focus sur la barre de progression
  useEffect(() => {
    if (progressPercent > 0 && progressRef.current) {
      setTimeout(() => {
        progressRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 350);
    }
  }, [progressPercent]);

  // Calcul du segment actuel à valider
  const getCurrentSegmentToValidate = () => {
    return Math.floor((currentBook.current_page ?? 0) / 30) + 1;
  };

  // Lance la validation pour le segment courant
  const startQuizForCurrentSegment = async () => {
    if (!userId) {
      toast.error("Vous devez être connecté pour valider votre lecture.");
      return;
    }
    const segment = getCurrentSegmentToValidate();
    const segmentValidated = await isSegmentAlreadyValidated(userId, book.id, segment);
    if (segmentValidated) {
      toast.info("Segment déjà validé, vous pouvez continuer.", {
        action: {
          label: "Segment suivant",
          onClick: () => showNextSegmentQuizIfAvailable(),
        },
      });
      return;
    }
    setValidationSegment(segment);
    await prepareAndShowQuestion(segment);
  };

  // Affiche la question du segment suivant si possible
  const showNextSegmentQuizIfAvailable = async () => {
    if (!userId) return;
    // Resynchro pour avoir le current_page à jour !
    const syncedBook = await syncBookWithAPI(userId, book.id);
    if (syncedBook) {
      setCurrentBook(syncedBook);
      const nextSegment = Math.floor((syncedBook.current_page ?? 0) / 30) + 1;
      const alreadyValidated = await isSegmentAlreadyValidated(userId, book.id, nextSegment);
      if (!alreadyValidated) {
        setValidationSegment(nextSegment);
        await prepareAndShowQuestion(nextSegment);
      } else {
        toast.info(`Segment ${nextSegment} déjà validé`, {
          action: {
            label: "Segment suivant",
            onClick: () => showNextSegmentQuizIfAvailable(),
          },
        });
      }
    }
  };

  // 1. Action principale : bouton contextuel
  const handleMainButtonClick = async () => {
    if (!userId) {
      toast.error("Vous devez être connecté pour commencer ou valider votre lecture");
      return;
    }

    const lectureInit = !!currentBook.current_page || !!currentBook.chaptersRead;
    setIsInitializing(true);
    try {
      if (!lectureInit) {
        // Lecture non commencée → initialiser lecture + checker s'il existe déjà validation segment 1
        const syncedBook = await syncBookWithAPI(userId, book.id);
        let progressCreated = false;
        if (!syncedBook || (!syncedBook.current_page && !syncedBook.chaptersRead)) {
          const progress = await initializeNewBookReading(userId, book.id);
          if (progress) {
            const updatedBook = await syncBookWithAPI(userId, book.id);
            if (updatedBook) setCurrentBook(updatedBook);
            progressCreated = true;
          }
        } else if (syncedBook) {
          setCurrentBook(syncedBook);
        }

        // Segment 1 déjà validé ?
        const segment1Validated = await isSegmentAlreadyValidated(userId, book.id, 1);
        if (segment1Validated) {
          toast.info("Segment déjà validé, vous pouvez continuer.", {
            action: {
              label: "Continuer la lecture",
              onClick: () => showNextSegmentQuizIfAvailable(),
            },
          });
        } else {
          setValidationSegment(1);
          await prepareAndShowQuestion(1);
        }
      } else {
        // Lecture déjà commencée → direct quiz sur le segment courant
        await startQuizForCurrentSegment();
      }
    } catch (error) {
      toast.error("Impossible de lancer la validation: " +
        (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsInitializing(false);
    }
  };

  // Prépare et ouvre la QuizModal avec la bonne question
  const prepareAndShowQuestion = async (segment: number) => {
    if (!userId) {
      toast.error("Données de validation incomplètes");
      return;
    }
    setIsValidating(true);
    try {
      const segmentValidated = await isSegmentAlreadyValidated(userId, currentBook.id, segment);
      if (segmentValidated) {
        toast.info(`Segment ${segment} déjà validé`, {
          action: {
            label: "Segment suivant",
            onClick: () => showNextSegmentQuizIfAvailable(),
          },
        });
        setValidationSegment(null);
        setIsValidating(false);
        return;
      }
      const question = await getQuestionForBookSegment(currentBook.id, segment);
      if (question) {
        setCurrentQuestion(question);
        setShowQuizModal(true);
      } else {
        const fallbackQuestion = getFallbackQuestion();
        setCurrentQuestion(fallbackQuestion);
        setShowQuizModal(true);
      }
    } catch (error) {
      toast.error("Erreur lors de la récupération de la question: " + 
        (error instanceof Error ? error.message : String(error)));
      const fallbackQuestion = getFallbackQuestion();
      setCurrentQuestion(fallbackQuestion);
      setShowQuizModal(true);
    } finally {
      setIsValidating(false);
    }
  };

  // Validation finale : après quiz réussi
  const handleQuizComplete = async (passed: boolean) => {
    setShowQuizModal(false);
    if (!passed || !userId || !validationSegment) {
      if (!passed) {
        toast.error("Réponse incorrecte. Réessayez plus tard.");
      }
      setValidationSegment(null);
      return;
    }
    try {
      setIsValidating(true);
      const result = await validateReading({
        user_id: userId,
        book_id: book.id,
        segment: validationSegment
      });

      if (result.already_validated) {
        toast.info(`Segment ${validationSegment} déjà validé`, {
          action: {
            label: "Segment suivant",
            onClick: () => showNextSegmentQuizIfAvailable(),
          },
        });
      } else {
        toast.success(`Segment ${validationSegment} validé 🎉`, {
          action: {
            label: "Continuer la lecture",
            onClick: () => showNextSegmentQuizIfAvailable(),
          },
        });
      }

      // MAJ progression – lecture
      const updatedBook = await syncBookWithAPI(userId, book.id);
      if (updatedBook) setCurrentBook(updatedBook);

      if (onChapterComplete) onChapterComplete(book.id);
    } catch (error: any) {
      toast.error("Erreur lors de la validation: " + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsValidating(false);
      setValidationSegment(null);
    }
  };

  // Interface du bouton principal, contextuel selon l’état
  const renderMainButton = () => {
    const lectureInit = !!currentBook.current_page || !!currentBook.chaptersRead;
    return (
      <Button
        disabled={isInitializing || isValidating}
        onClick={handleMainButtonClick}
        className="w-full bg-coffee-dark text-white hover:bg-coffee-darker py-3 text-lg font-serif my-4"
      >
        {isInitializing
          ? "Chargement..."
          : lectureInit
            ? "Valider ma lecture"
            : "Commencer ma lecture"}
      </Button>
    );
  };

  return (
    <Card className="border-coffee-light">
      <BookDetailHeader title={currentBook.title} />
      <CardContent className="space-y-4">
        <BookCoverInfo book={currentBook} />
        <BookDescription description={currentBook.description} />
        {renderMainButton()}
        <BookProgressBar progressPercent={progressPercent} ref={progressRef} />
        {showValidationModal && validationSegment && (
          <ValidationModal
            bookTitle={currentBook.title}
            segment={validationSegment}
            isOpen={showValidationModal}
            isValidating={isValidating}
            onClose={() => setShowValidationModal(false)}
            onValidate={() => {
              setShowValidationModal(false);
              prepareAndShowQuestion(validationSegment);
            }}
          />
        )}
        {showQuizModal && currentQuestion && validationSegment && (
          <QuizModal
            bookTitle={currentBook.title}
            chapterNumber={validationSegment}
            onComplete={handleQuizComplete}
            onClose={() => setShowQuizModal(false)}
            question={currentQuestion}
          />
        )}
      </CardContent>
    </Card>
  );
};
