
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { addFavoriteBook } from "@/services/user/favoriteBookService";
import { useAuth } from "@/contexts/AuthContext";

interface FavoriteBooksFormProps {
  open: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export function FavoriteBooksForm({ open, onComplete, onSkip }: FavoriteBooksFormProps) {
  const { user } = useAuth();
  const [books, setBooks] = useState<string[]>(["", "", ""]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (index: number, value: string) => {
    const newBooks = [...books];
    newBooks[index] = value;
    setBooks(newBooks);
  };

  const handleSubmit = async () => {
    if (!user?.id) {
      toast.error("Vous devez être connecté pour continuer");
      return;
    }

    const nonEmptyBooks = books.filter(book => book.trim() !== "");
    
    if (nonEmptyBooks.length === 0) {
      toast.error("Veuillez entrer au moins un livre préféré");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const promises = nonEmptyBooks.map((title, index) => 
        addFavoriteBook(user.id as string, title, index + 1)
      );
      
      await Promise.all(promises);
      
      toast.success("Vos livres préférés ont été enregistrés");
      onComplete();
    } catch (error) {
      console.error("Erreur lors de l'enregistrement des livres:", error);
      toast.error("Une erreur est survenue lors de l'enregistrement");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={(isOpen) => !isOpen && onSkip()}
      aria-labelledby="favorites-modal-title"
      aria-describedby="favorites-modal-description"
    >
      <DialogContent 
        className="max-w-md w-[95vw] border-coffee-light rounded-lg"
        role="dialog"
        aria-modal="true"
      >
        <DialogHeader>
          <DialogTitle 
            id="favorites-modal-title"
            className="font-serif text-2xl text-coffee-darker"
          >
            Quels sont vos livres préférés ?
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <p 
            id="favorites-modal-description"
            className="text-foreground/80"
          >
            Partagez jusqu'à trois livres qui ont marqué votre vie de lecteur.
          </p>
          
          <fieldset className="space-y-4">
            <legend className="sr-only">
              Formulaire de saisie de vos livres préférés
            </legend>
            {[0, 1, 2].map((index) => (
              <div key={index} className="space-y-2">
                <Label 
                  htmlFor={`book-${index}`} 
                  className="text-foreground font-medium"
                >
                  Livre {index + 1} {index === 0 ? "(obligatoire)" : "(facultatif)"}
                </Label>
                <Input
                  id={`book-${index}`}
                  value={books[index]}
                  onChange={(e) => handleChange(index, e.target.value)}
                  placeholder={`Titre de votre livre préféré ${index + 1}`}
                  className="border-coffee-light text-foreground bg-background"
                  required={index === 0}
                  aria-required={index === 0}
                  aria-describedby={index === 0 ? "book-0-help" : undefined}
                />
                {index === 0 && (
                  <p id="book-0-help" className="text-xs text-foreground/70">
                    Ce champ est obligatoire
                  </p>
                )}
              </div>
            ))}
          </fieldset>
        </div>
        
        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button 
            onClick={handleSubmit}
            className="w-full bg-coffee-dark hover:bg-coffee-darker text-white"
            disabled={isSubmitting || !books[0].trim()}
            aria-describedby={!books[0].trim() ? "submit-requirement" : undefined}
          >
            {isSubmitting ? "Enregistrement..." : "Enregistrer mes livres préférés"}
          </Button>
          
          <button
            type="button"
            onClick={onSkip}
            className="mt-2 text-sm text-foreground/80 hover:text-foreground underline focus:outline-none focus:ring-2 focus:ring-coffee-dark focus:ring-offset-2 rounded"
            aria-label="Ignorer cette étape et continuer"
          >
            Je préfère le faire plus tard
          </button>
          
          {!books[0].trim() && (
            <div 
              id="submit-requirement" 
              className="sr-only"
              aria-live="polite"
            >
              Vous devez saisir au moins un livre préféré
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
