
import { Book } from "@/types/book";
import { ValidationModal } from "./ValidationModal";
import { QuizModal } from "./QuizModal";
import { ReadingQuestion } from "@/types/reading";
import { SuccessMessage } from "./SuccessMessage";
import { LockTimer } from "./LockTimer";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Clock } from "lucide-react";
import { memo } from "react";

interface BookValidationModalsProps {
  book: Book;
  showValidationModal: boolean;
  showQuizModal: boolean;
  showSuccessMessage?: boolean;
  validationSegment: number | null;
  currentQuestion: ReadingQuestion | null;
  isValidating: boolean;
  isLocked?: boolean;
  remainingLockTime?: number | null;
  onValidationClose: () => void;
  onValidationConfirm: () => void;
  onQuizClose: () => void;
  onQuizComplete: (passed: boolean) => void;
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
  onValidationClose,
  onValidationConfirm,
  onQuizClose,
  onQuizComplete,
  onSuccessClose,
  onLockExpire
}: BookValidationModalsProps) => {
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
        />
      )}
      
      {showSuccessMessage && (
        <SuccessMessage
          isOpen={showSuccessMessage}
          onClose={onSuccessClose}
          segment={currentQuestion?.segment || 0}
        />
      )}
    </>
  );
});

BookValidationModals.displayName = "BookValidationModals";
