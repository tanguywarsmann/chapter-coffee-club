
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle, CheckCircle, BookOpen, Info, Trash } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BookMetadataEditor } from "@/components/admin/BookMetadataEditor";
import { AddBookForm } from "@/components/admin/AddBookForm";
import { DeleteBookDialog } from "@/components/admin/DeleteBookDialog";

interface BookValidationStatus {
  id: string;
  title: string;
  slug: string;
  totalPages: number;
  expectedSegments: number;
  availableQuestions: number;
  segments: number[];
  missingSegments: number[];
  status: 'complete' | 'incomplete' | 'missing';
}

export function AdminBookList() {
  const [books, setBooks] = useState<BookValidationStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookToDelete, setBookToDelete] = useState<{id: string; title: string} | null>(null);

  // Fonction pour calculer le nombre de segments basé sur le nombre de pages
  const calculateExpectedSegments = (totalPages: number): number => {
    return Math.ceil(totalPages / 30);
  };

  // Fonction pour obtenir l'état de validation des livres
  const fetchBooksValidationStatus = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Récupérer tous les livres
      const { data: booksData, error: booksError } = await supabase
        .from('books')
        .select('id, title, slug, total_pages');
      
      if (booksError) throw booksError;
      
      // Récupérer toutes les questions
      const { data: questionsData, error: questionsError } = await supabase
        .from('reading_questions')
        .select('book_slug, segment');
      
      if (questionsError) throw questionsError;
      
      // Transformer les données pour l'affichage
      const booksWithStatus: BookValidationStatus[] = booksData.map(book => {
        const totalPages = book.total_pages || 0;
        const expectedSegments = calculateExpectedSegments(totalPages);
        
        // Récupérer les segments qui ont des questions pour ce livre
        const bookQuestions = questionsData.filter(q => q.book_slug === book.slug);
        const segments = bookQuestions.map(q => q.segment);
        const uniqueSegments = [...new Set(segments)];
        
        // Calculer les segments manquants
        const missingSegments = [];
        for (let i = 0; i < expectedSegments; i++) {
          if (!uniqueSegments.includes(i)) {
            missingSegments.push(i);
          }
        }
        
        let status: 'complete' | 'incomplete' | 'missing';
        if (uniqueSegments.length === 0) {
          status = 'missing';
        } else if (uniqueSegments.length === expectedSegments) {
          status = 'complete';
        } else {
          status = 'incomplete';
        }
        
        return {
          id: book.id,
          title: book.title,
          slug: book.slug,
          totalPages: totalPages,
          expectedSegments: expectedSegments,
          availableQuestions: uniqueSegments.length,
          segments: uniqueSegments,
          missingSegments: missingSegments,
          status: status
        };
      });
      
      // Trier les livres : d'abord les incomplets, puis les manquants, puis les complets
      booksWithStatus.sort((a, b) => {
        const statusOrder = { incomplete: 0, missing: 1, complete: 2 };
        return statusOrder[a.status] - statusOrder[b.status];
      });
      
      setBooks(booksWithStatus);
    } catch (err: any) {
      console.error('Erreur lors de la récupération des données:', err);
      setError(err.message || "Erreur lors de la récupération des données");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBooksValidationStatus();
  }, []);

  // Fonction pour afficher le statut avec une icône
  const renderStatus = (status: 'complete' | 'incomplete' | 'missing') => {
    switch (status) {
      case 'complete':
        return (
          <div className="flex items-center text-green-600">
            <CheckCircle className="w-5 h-5 mr-1" />
            <span>Complet</span>
          </div>
        );
      case 'incomplete':
        return (
          <div className="flex items-center text-amber-600">
            <AlertTriangle className="w-5 h-5 mr-1" />
            <span>Incomplet</span>
          </div>
        );
      case 'missing':
        return (
          <div className="flex items-center text-destructive">
            <AlertTriangle className="w-5 h-5 mr-1" />
            <span>Aucune question</span>
          </div>
        );
    }
  };

  // Handler pour ouvrir la boîte de dialogue de suppression
  const handleDeleteClick = (book: {id: string; title: string}) => {
    setBookToDelete(book);
  };

  // Composant pour afficher les segments manquants
  const MissingSegmentsDialog = ({ book }: { book: BookValidationStatus }) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="ml-2" disabled={book.missingSegments.length === 0}>
          Voir segments manquants
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Segments manquants pour "{book.title}"
          </DialogTitle>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto p-4">
          {book.missingSegments.length === 0 ? (
            <p className="text-green-600 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              Tous les segments ont des questions
            </p>
          ) : (
            <div>
              <p className="mb-3">
                {book.missingSegments.length} segment{book.missingSegments.length > 1 ? 's' : ''} sur {book.expectedSegments} manquant{book.missingSegments.length > 1 ? 's' : ''} :
              </p>
              <div className="flex flex-wrap gap-2">
                {book.missingSegments.map(segmentNum => (
                  <Badge key={segmentNum} variant="secondary" className="px-3 py-1">
                    Segment {segmentNum}
                  </Badge>
                ))}
              </div>
              <div className="mt-4 p-3 bg-muted rounded-md">
                <p className="text-sm flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>
                    Rappel : le segment 0 correspond aux pages 0 à 29, le segment 1 aux pages 30 à 59, etc.
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <Loader2 className="animate-spin h-8 w-8 mx-auto mb-4 text-coffee-dark" />
          <p className="text-coffee-dark">Chargement des données...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-destructive" />
          <h3 className="text-lg font-medium mb-2 text-destructive">Erreur</h3>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={fetchBooksValidationStatus} className="mt-4">
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-serif font-medium text-coffee-darker">
          État des questions de validation ({books.length} livres)
        </h2>
        <div className="flex items-center gap-2">
          <AddBookForm onBookAdded={fetchBooksValidationStatus} />
          <Button onClick={fetchBooksValidationStatus} size="sm" variant="outline" className="gap-2">
            <Loader2 className="h-4 w-4" />
            Actualiser
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/3">Titre</TableHead>
              <TableHead className="text-right">Pages</TableHead>
              <TableHead className="text-right">Segments attendus</TableHead>
              <TableHead className="text-right">Questions disponibles</TableHead>
              <TableHead className="text-right">Couverture</TableHead>
              <TableHead className="text-right">État</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {books.map(book => (
              <TableRow key={book.id}>
                <TableCell className="font-medium">{book.title}</TableCell>
                <TableCell className="text-right">{book.totalPages}</TableCell>
                <TableCell className="text-right">{book.expectedSegments}</TableCell>
                <TableCell className="text-right">{book.availableQuestions}</TableCell>
                <TableCell className="text-right">
                  {Math.round((book.availableQuestions / book.expectedSegments) * 100)}%
                </TableCell>
                <TableCell className="text-right">
                  {renderStatus(book.status)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end items-center gap-2">
                    <BookMetadataEditor book={book} onUpdate={fetchBooksValidationStatus} />
                    <MissingSegmentsDialog book={book} />
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-destructive hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => handleDeleteClick({id: book.id, title: book.title})}
                    >
                      <Trash className="h-4 w-4" />
                      <span className="sr-only">Supprimer</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {books.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Aucun livre trouvé
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {bookToDelete && (
        <DeleteBookDialog
          open={!!bookToDelete}
          onOpenChange={(open) => !open && setBookToDelete(null)}
          bookId={bookToDelete.id}
          bookTitle={bookToDelete.title}
          onDeleted={fetchBooksValidationStatus}
        />
      )}
    </div>
  );
}
