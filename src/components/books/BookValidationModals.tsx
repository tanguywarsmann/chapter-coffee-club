
import { Book } from "@/types/book";
import { ValidationModal } from "./ValidationModal";
import { QuizModal } from "./QuizModal";
import { PublicReadingQuestion } from "@/types/reading";
import { SuccessMessage } from "./SuccessMessage";
import { LockTimer } from "./LockTimer";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Clock } from "lucide-react";
import { memo } from "react";
import { resolveExpectedSegments } from "@/hooks/useExpectedSegments";

interface BookValidationModalsProps {
  book: Book;
  showValidationModal: boolean;
  showQuizModal: boolean;
  showSuccessMessage?: boolean;
  validationSegment: number | null;
  currentQuestion: PublicReadingQuestion | null;
  isValidating: boolean;
  isLocked?: boolean;
  remainingLockTime?: number | null;
  jokersUsed?: number;
  jokersAllowed?: number;
  jokersRemaining?: number;
  isUsingJoker?: boolean;
  userId?: string; // ✅ Ajout pour passer à SuccessMessage
  onValidationClose: () => void;
  onValidationConfirm: () => void;
  onQuizClose: () => void;
  onQuizComplete: (args: { correct: boolean; useJoker: boolean }) => void;
  onSuccessClose?: () => void;
  onLockExpire?: () => void;
}

// Utilisation de memo pour éviter les rendus inutiles des modales
export const BookValidationModals = memo(({
  book,
  showValidationModal,
  showQuizModal,
  showSuccessMessage = false,
  validationSegment,
  currentQuestion,
  isValidating,
  isLocked = false,
  remainingLockTime = null,
  jokersUsed = 0,
  jokersAllowed = 0,
  jokersRemaining = 0,
  isUsingJoker = false,
  userId, // ✅ Récupérer userId
  onValidationClose,
  onValidationConfirm,
  onQuizClose,
  onQuizComplete,
  onSuccessClose,
  onLockExpire
}: BookValidationModalsProps) => {
  // Fallback robuste pour expectedSegments
  const expectedSegmentsSafe = resolveExpectedSegments(book);
  
  // N'effectuer le rendu que si une des modales est visible
  if (!showValidationModal && !showQuizModal && !showSuccessMessage) {
    return null;
  }
  
  return (
    <>
      {showValidationModal && validationSegment && (
        <>
          {isLocked && remainingLockTime && remainingLockTime > 0 ? (
            <ValidationModal
              bookTitle={book.title}
              segment={validationSegment}
              isOpen={showValidationModal}
              isValidating={isValidating}
              isLocked={true}
              remainingLockTime={remainingLockTime}
              jokersUsed={jokersUsed}
              jokersAllowed={jokersAllowed}
              onClose={onValidationClose}
              onValidate={onValidationConfirm}
              onLockExpire={onLockExpire}
            />
          ) : (
            <ValidationModal
              bookTitle={book.title}
              segment={validationSegment}
              isOpen={showValidationModal}
              isValidating={isValidating}
              jokersUsed={jokersUsed}
              jokersAllowed={jokersAllowed}
              onClose={onValidationClose}
              onValidate={onValidationConfirm}
            />
          )}
        </>
      )}
      
      {showQuizModal && currentQuestion && (
        <QuizModal
          bookTitle={book.title}
          chapterNumber={currentQuestion.segment || 0}
          onComplete={onQuizComplete}
          onClose={onQuizClose}
          question={currentQuestion}
          expectedSegments={expectedSegmentsSafe}
          progressId={book.id}
          jokersRemaining={jokersRemaining}
          isUsingJoker={isUsingJoker}
        />
      )}
      
      {showSuccessMessage && (
        <SuccessMessage
          isOpen={showSuccessMessage}
          onClose={onSuccessClose}
          segment={currentQuestion?.segment || 0}
          expectedSegments={expectedSegmentsSafe}
          userId={userId} // ✅ Passer userId à SuccessMessage
        />
      )}
    </>
  );
});

BookValidationModals.displayName = "BookValidationModals";
