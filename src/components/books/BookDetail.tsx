
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Book as BookIcon, Bookmark, Share2, Loader2, ChevronDown } from "lucide-react";
import { Book } from "@/types/book";
import { toast } from "sonner";
import { initializeNewBookReading, syncBookWithAPI } from "@/services/reading";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { ValidationModal } from "./ValidationModal";
import { Progress } from "@/components/ui/progress";

interface BookDetailProps {
  book: Book;
  onChapterComplete?: (bookId: string) => void;
}

export const BookDetail = ({ book, onChapterComplete }: BookDetailProps) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationSegment, setValidationSegment] = useState<number | null>(null);
  const [currentBook, setCurrentBook] = useState<Book>(book);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const progressRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Get the user ID from Supabase auth session -- no localStorage fallback!
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
    // Met à jour la progression (en %) si book.chaptersRead/totalChapters changent
    if (currentBook && currentBook.totalChapters) {
      setProgressPercent(
        Math.min(
          100,
          Math.round(((currentBook.chaptersRead || 0) / currentBook.totalChapters) * 100)
        )
      );
    }
  }, [currentBook]);

  // Animation de scroll sur la barre de progression
  useEffect(() => {
    if (progressPercent > 0 && progressRef.current) {
      setTimeout(() => {
        progressRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 350); // Attend la mise à jour du DOM
    }
  }, [progressPercent]);

  const handleStartReading = async () => {
    if (!userId) {
      toast.error("Vous devez être connecté pour commencer une lecture");
      return;
    }
    setIsInitializing(true);
    console.log('Starting reading with userId:', userId, 'bookId:', book.id);

    try {
      // 1. Initialise la lecture (lecture_progress si inexistant)
      const progress = await initializeNewBookReading(userId, book.id);

      if (progress) {
        toast.success("Lecture initialisée avec succès");
        // 2. Sync le livre (récupère le statut, chaptersRead...)
        const syncedBook = await syncBookWithAPI(userId, book.id);
        if (syncedBook) {
          setCurrentBook(syncedBook);
          toast.success("Mise à jour du livre réussie");
        }
        // 3. Redirige automatiquement sur la page du livre (id ou slug)
        //    - Ici, par cohérence app, reste sur /books/:id (déjà sur la bonne page, mais on peut forcer la route si besoin)
        if (window.location.pathname !== `/books/${book.id}`) {
          navigate(`/books/${book.id}`);
        }

        // 4. Si première lecture (segment 1, aucune progression), ouvre la modale de validation
        if (progress.current_page === 0) {
          setValidationSegment(1);
          setShowValidationModal(true);
        }

        // 5. Défile/anim la barre de progression
        setTimeout(() => {
          progressRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 400);
        
        // 6. Recharge la {reading_list} locale si besoin — délégué à la sync du parent ou via useReadingList, sinon à faire côté parent
        if (onChapterComplete) {
          onChapterComplete(book.id); // Permet la mise à jour de la page parent
        }
      } else {
        toast.error("Erreur lors de l'initialisation de la lecture. Veuillez réessayer.");
        console.error('Failed to initialize reading. No progress returned.');
      }
    } catch (error) {
      console.error('Error starting book:', error);
      toast.error("Une erreur est survenue lors de l'initialisation de la lecture: " +
        (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsInitializing(false);
    }
  };

  // Handler de validation (callback de la modal)
  const handleValidateSegment = () => {
    setShowValidationModal(false);
    toast.success("Étape validée !");
    // Peut synchroniser de nouveau le livre ici si besoin
  };

  return (
    <Card className="border-coffee-light">
      <CardHeader>
        <CardTitle className="text-2xl font-serif text-coffee-darker">{currentBook.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-4">
          <div className="book-cover w-32 h-48 flex-shrink-0">
            {currentBook.coverImage ? (
              <img src={currentBook.coverImage} alt={currentBook.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-chocolate-medium">
                <span className="text-white font-serif italic text-4xl">{currentBook.title.substring(0, 1)}</span>
              </div>
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-medium text-coffee-darker">{currentBook.title}</h2>
            <p className="text-sm text-muted-foreground">{currentBook.author}</p>
            <div className="mt-2 flex flex-wrap gap-1">
              {currentBook.categories.map((category, index) => (
                <span key={index} className="px-2 py-1 bg-coffee-light/30 text-coffee-darker rounded-full text-xs">
                  {category}
                </span>
              ))}
            </div>
          </div>
        </div>
        <p className="text-coffee-darker">{currentBook.description}</p>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">
            {currentBook.pages} pages • {currentBook.language}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" className="border-coffee-medium text-coffee-darker hover:bg-coffee-light/20">
              <Bookmark className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="border-coffee-medium text-coffee-darker hover:bg-coffee-light/20">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {/* Progress Bar Section */}
        <div ref={progressRef} className="my-3">
          <div className="flex items-center gap-2">
            <Progress value={progressPercent} />
            <span className="text-xs font-medium text-coffee-darker">{progressPercent}%</span>
          </div>
          {/* Animation icon to show scroll/feedback */}
          {progressPercent > 0 && progressPercent < 100 && (
            <div className="flex justify-center mt-1 animate-bounce">
              <ChevronDown className="h-4 w-4 text-coffee-medium opacity-60" />
            </div>
          )}
        </div>
        <Button 
          className="w-full bg-coffee-dark hover:bg-coffee-darker"
          onClick={handleStartReading} 
          disabled={isInitializing}
        >
          {isInitializing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Initialisation...
            </>
          ) : (
            <>
              <BookIcon className="h-4 w-4 mr-2" />
              Commencer ma lecture
            </>
          )}
        </Button>
        {/* Validation Modal pour le segment 1, ouverte après init */}
        {showValidationModal && validationSegment && (
          <ValidationModal
            bookTitle={currentBook.title}
            segment={validationSegment}
            isOpen={showValidationModal}
            isValidating={false}
            onClose={() => setShowValidationModal(false)}
            onValidate={handleValidateSegment}
          />
        )}
      </CardContent>
    </Card>
  );
};
