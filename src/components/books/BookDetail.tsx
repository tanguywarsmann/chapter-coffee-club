
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
import { BookActions } from "./BookActions";
import { BookProgressBar } from "./BookProgressBar";
import { BookDescription } from "./BookDescription";

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
        console.log("User authenticated:", data.user);
        setUserId(data.user.id);
      } else {
        console.warn("No authenticated user found");
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

  useEffect(() => {
    if (progressPercent > 0 && progressRef.current) {
      setTimeout(() => {
        progressRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 350);
    }
  }, [progressPercent]);

  const moveToNextSegment = async () => {
    if (!userId) return;
    
    try {
      // Synchroniser pour avoir les dernières données
      const syncedBook = await syncBookWithAPI(userId, book.id);
      if (syncedBook) {
        setCurrentBook(syncedBook);
        
        // Calculer le prochain segment à valider
        const nextSegment = Math.floor((syncedBook.chaptersRead * 30) / 30) + 1;
        console.log("Prochain segment à valider:", nextSegment);
        
        // Vérifier si le segment n'est pas déjà validé
        const alreadyValidated = await isSegmentAlreadyValidated(userId, book.id, nextSegment);
        
        if (!alreadyValidated) {
          setValidationSegment(nextSegment);
          await prepareAndShowQuestion(nextSegment);
        } else {
          toast.info(`Segment ${nextSegment} déjà validé`, {
            action: {
              label: "Segment suivant",
              onClick: () => moveToNextSegment(),
            },
          });
        }
      }
    } catch (error) {
      console.error('Error moving to next segment:', error);
      toast.error("Erreur lors du passage au segment suivant");
    }
  };

  const handleStartReading = async () => {
    if (!userId) {
      toast.error("Vous devez être connecté pour commencer une lecture");
      return;
    }
    setIsInitializing(true);
    console.log('Starting reading with userId:', userId, 'bookId:', book.id);

    try {
      // Vérifier d'abord si la lecture existe déjà
      const syncedBook = await syncBookWithAPI(userId, book.id);
      let readingExists = false;
      
      if (syncedBook && syncedBook.chaptersRead > 0) {
        readingExists = true;
        setCurrentBook(syncedBook);
      }
      
      if (!readingExists) {
        // Initialiser seulement si nécessaire
        const progress = await initializeNewBookReading(userId, book.id);
        
        if (progress) {
          toast.success("Lecture initialisée avec succès");
          const updatedBook = await syncBookWithAPI(userId, book.id);
          if (updatedBook) {
            setCurrentBook(updatedBook);
          }
        }
      }
      
      // Vérifier si le segment 1 a déjà été validé
      const segment1Validated = await isSegmentAlreadyValidated(userId, book.id, 1);
      
      if (segment1Validated) {
        toast.info("Premier segment déjà validé. Vous pouvez continuer votre progression.", {
          action: {
            label: "Continuer la lecture",
            onClick: () => moveToNextSegment(),
          },
        });
      } else {
        setValidationSegment(1);
        await prepareAndShowQuestion(1);
      }
      
      setTimeout(() => {
        progressRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 400);

      if (onChapterComplete) {
        onChapterComplete(book.id);
      }
    } catch (error) {
      console.error('Error starting book:', error);
      toast.error("Une erreur est survenue lors de l'initialisation de la lecture: " +
        (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsInitializing(false);
    }
  };

  const prepareAndShowQuestion = async (segment: number) => {
    if (!userId) {
      toast.error("Données de validation incomplètes");
      return;
    }
    
    setIsValidating(true);
    
    try {
      // Vérifier si le segment a déjà été validé
      const segmentValidated = await isSegmentAlreadyValidated(userId, currentBook.id, segment);
      
      if (segmentValidated) {
        toast.info(`Segment ${segment} déjà validé`, {
          action: {
            label: "Segment suivant",
            onClick: () => moveToNextSegment(),
          },
        });
        setValidationSegment(null);
        setIsValidating(false);
        return;
      }
      
      console.log(`Préparation de la question pour le livre ${currentBook.id}, segment ${segment}`);
      
      const question = await getQuestionForBookSegment(currentBook.id, segment);
      
      if (question) {
        console.log("Question trouvée dans Supabase:", question);
        setCurrentQuestion(question);
        setShowQuizModal(true);
      } else {
        console.log("Aucune question trouvée dans Supabase pour le livre " + currentBook.id + ", segment " + segment + ". Utilisation de la question par défaut.");
        const fallbackQuestion = getFallbackQuestion();
        setCurrentQuestion(fallbackQuestion);
        setShowQuizModal(true);
      }
    } catch (error) {
      console.error('Error fetching question:', error);
      toast.error("Erreur lors de la récupération de la question: " + 
        (error instanceof Error ? error.message : String(error)));
      const fallbackQuestion = getFallbackQuestion();
      setCurrentQuestion(fallbackQuestion);
      setShowQuizModal(true);
    } finally {
      setIsValidating(false);
    }
  };

  const handleValidateSegment = async () => {
    if (!userId || !validationSegment) {
      toast.error("Données de validation incomplètes");
      setShowValidationModal(false);
      return;
    }
    
    setIsValidating(true);
    
    try {
      // Vérifier si le segment a déjà été validé
      const segmentValidated = await isSegmentAlreadyValidated(userId, currentBook.id, validationSegment);
      
      if (segmentValidated) {
        toast.info(`Segment ${validationSegment} déjà validé`, {
          action: {
            label: "Segment suivant",
            onClick: () => moveToNextSegment(),
          },
        });
        setShowValidationModal(false);
      } else {
        await prepareAndShowQuestion(validationSegment);
        setShowValidationModal(false);
      }
    } catch (error) {
      console.error('Error during validation:', error);
      toast.error("Erreur lors de la validation: " +
        (error instanceof Error ? error.message : String(error)));
      setShowValidationModal(false);
    } finally {
      setIsValidating(false);
    }
  };
  
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
            onClick: () => moveToNextSegment(),
          },
        });
      } else {
        toast.success(`Segment ${validationSegment} validé avec succès! 🎉`, {
          action: {
            label: "Continuer la lecture",
            onClick: () => moveToNextSegment(),
          },
        });
      }
      
      const updatedBook = await syncBookWithAPI(userId, book.id);
      if (updatedBook) {
        setCurrentBook(updatedBook);
      }
      
      if (onChapterComplete) {
        onChapterComplete(book.id);
      }
      
    } catch (error: any) {
      console.error('Error during quiz validation:', error);
      toast.error("Erreur lors de la validation: " +
        (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsValidating(false);
      setValidationSegment(null);
    }
  };

  return (
    <Card className="border-coffee-light">
      <BookDetailHeader title={currentBook.title} />
      <CardContent className="space-y-4">
        <BookCoverInfo book={currentBook} />
        <BookDescription description={currentBook.description} />
        <BookActions
          isInitializing={isInitializing}
          onStartReading={handleStartReading}
          pages={currentBook.pages}
          language={currentBook.language}
        />
        <BookProgressBar progressPercent={progressPercent} ref={progressRef} />
        {showValidationModal && validationSegment && (
          <ValidationModal
            bookTitle={currentBook.title}
            segment={validationSegment}
            isOpen={showValidationModal}
            isValidating={isValidating}
            onClose={() => setShowValidationModal(false)}
            onValidate={handleValidateSegment}
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
