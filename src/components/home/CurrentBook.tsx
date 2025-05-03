
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import { Book } from "@/types/book";
import { Button } from "@/components/ui/button";
import { QuizModal } from "@/components/books/QuizModal";
import { CurrentBookCover } from "./CurrentBookCover";
import { CurrentBookInfo } from "./CurrentBookInfo";
import { useCurrentBookValidation } from "@/hooks/useCurrentBookValidation";
import { calculateReadingProgress } from "@/lib/progress";

interface CurrentBookProps {
  book: Book | null;
  onProgressUpdate?: (bookId: string) => void;
}

export function CurrentBook({ book, onProgressUpdate }: CurrentBookProps) {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  
  const {
    isValidating,
    showQuiz,
    setShowQuiz,
    quizChapter,
    currentQuestion,
    handleValidateReading,
    handleQuizComplete
  } = useCurrentBookValidation(userId, book, onProgressUpdate);

  if (!book) {
    return (
      <Card className="border-coffee-light">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-serif text-coffee-darker">Ma lecture en cours</CardTitle>
        </CardHeader>
        <CardContent className="text-center p-6">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-coffee-darker mb-2">Aucune lecture en cours</h3>
          <p className="text-muted-foreground mb-4">Commencez votre prochaine aventure de lecture</p>
          <Button 
            className="bg-coffee-dark hover:bg-coffee-darker"
            onClick={() => navigate("/explore")}
          >
            Explorer les livres
          </Button>
        </CardContent>
      </Card>
    );
  }

  const progressPercentage = calculateReadingProgress(book.chaptersRead, book.totalChapters);
  const handleNavigateToBook = () => navigate(`/books/${book.id}`);

  return (
    <>
      <Card className="border-coffee-light">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-serif text-coffee-darker">Ma lecture en cours</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <CurrentBookCover book={book} />
            <CurrentBookInfo
              book={book}
              progressPercentage={progressPercentage}
              isValidating={isValidating}
              onValidate={handleValidateReading}
              onNavigate={handleNavigateToBook}
            />
          </div>
        </CardContent>
      </Card>
      
      {showQuiz && currentQuestion && (
        <QuizModal 
          bookTitle={book.title} 
          chapterNumber={quizChapter}
          onComplete={handleQuizComplete}
          onClose={() => setShowQuiz(false)}
          question={currentQuestion}
        />
      )}
    </>
  );
}
