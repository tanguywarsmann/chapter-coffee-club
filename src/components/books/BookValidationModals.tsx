
import { Book } from "@/types/book";
import { ValidationModal } from "./ValidationModal";
import { QuizModal } from "./QuizModal";
import { ReadingQuestion } from "@/types/reading";
import { SuccessMessage } from "./SuccessMessage";

interface BookValidationModalsProps {
  book: Book;
  showValidationModal: boolean;
  showQuizModal: boolean;
  showSuccessMessage?: boolean;
  validationSegment: number | null;
  currentQuestion: ReadingQuestion | null;
  isValidating: boolean;
  onValidationClose: () => void;
  onValidationConfirm: () => void;
  onQuizClose: () => void;
  onQuizComplete: (passed: boolean) => void;
  onSuccessClose?: () => void;
}

export const BookValidationModals = ({
  book,
  showValidationModal,
  showQuizModal,
  showSuccessMessage = false,
  validationSegment,
  currentQuestion,
  isValidating,
  onValidationClose,
  onValidationConfirm,
  onQuizClose,
  onQuizComplete,
  onSuccessClose
}: BookValidationModalsProps) => {
  return (
    <>
      {showValidationModal && validationSegment && (
        <ValidationModal
          bookTitle={book.title}
          segment={validationSegment}
          isOpen={showValidationModal}
          isValidating={isValidating}
          onClose={onValidationClose}
          onValidate={onValidationConfirm}
        />
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
};
