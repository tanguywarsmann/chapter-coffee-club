
import { useState, useEffect } from "react";
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
import { texts } from "@/i18n/texts";
import { useAuth } from "@/contexts/AuthContext";

interface CurrentBookProps {
  book: Book | null;
  onProgressUpdate?: (bookId: string) => void;
}

export function CurrentBook({ book, onProgressUpdate }: CurrentBookProps) {
  console.log("Rendering CurrentBook", { 
    bookId: book?.id || 'undefined',
    bookTitle: book?.title || 'undefined' 
  });

  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Si le livre est null ou undefined, on affiche un message alternatif
  if (!book) {
    console.log("Pas de livre en cours dans CurrentBook");

    return (
      <Card className="border-coffee-light">
        <CardHeader className="pb-2">
          <CardTitle className="text-h4 font-serif text-coffee-darker">{texts.currentReadings}</CardTitle>
        </CardHeader>
        <CardContent className="text-center p-6">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-h4 font-medium text-coffee-darker mb-2">{texts.noCurrentReading}</h3>
          <p className="text-muted-foreground mb-4">{texts.startYourNextAdventure}</p>
          <Button 
            className="bg-coffee-dark hover:bg-coffee-darker"
            onClick={() => navigate("/explore")}
          >
            {texts.exploreBooks}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const {
    isValidating,
    showQuiz,
    setShowQuiz,
    quizChapter,
    currentQuestion,
    handleValidateReading,
    handleQuizComplete
  } = useCurrentBookValidation(user?.id || null, book, onProgressUpdate);

  // Wrapper to convert new signature to old signature - but handleQuizComplete now expects new signature
  const handleQuizCompleteWrapper = (args: { correct: boolean; useJoker: boolean }) => {
    handleQuizComplete(args);
  };

  const chaptersRead = book.chaptersRead || 0;
  const totalChapters = book.totalChapters || book.expectedSegments || 1;

  console.log("Progress debug →", {
    title: book.title,
    chaptersRead,
    totalChapters
  });

  const progressPercentage = calculateReadingProgress(chaptersRead, totalChapters);
  const handleNavigateToBook = () => navigate(`/books/${book.id}`);

  return (
    <>
      <Card className="border-coffee-light">
        <CardHeader className="pb-2">
          <CardTitle className="text-h4 font-serif text-coffee-darker">{texts.currentReadings}</CardTitle>
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
          onComplete={handleQuizCompleteWrapper}
          onClose={() => setShowQuiz(false)}
          question={currentQuestion}
        />
      )}
    </>
  );
}
