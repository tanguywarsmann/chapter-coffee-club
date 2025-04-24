
import { Book } from "@/types/book";
import { ValidationModal } from "./ValidationModal";
import { QuizModal } from "./QuizModal";
import { ReadingQuestion } from "@/types/reading";

interface BookValidationModalsProps {
  book: Book;
  showValidationModal: boolean;
  showQuizModal: boolean;
  validationSegment: number | null;
  currentQuestion: ReadingQuestion | null;
  isValidating: boolean;
  onValidationClose: () => void;
  onValidationConfirm: () => void;
  onQuizClose: () => void;
  onQuizComplete: (passed: boolean) => void;
}

export const BookValidationModals = ({
  book,
  showValidationModal,
  showQuizModal,
  validationSegment,
  currentQuestion,
  isValidating,
  onValidationClose,
  onValidationConfirm,
  onQuizClose,
  onQuizComplete
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
      {showQuizModal && currentQuestion && validationSegment && (
        <QuizModal
          bookTitle={book.title}
          chapterNumber={validationSegment}
          onComplete={onQuizComplete}
          onClose={onQuizClose}
          question={currentQuestion}
        />
      )}
    </>
  );
};
