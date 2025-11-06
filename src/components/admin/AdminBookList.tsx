import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle, CheckCircle, BookOpen, Info, Trash, ArrowDownToLine, RefreshCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BookMetadataEditor } from "@/components/admin/BookMetadataEditor";
import { AddBookForm } from "@/components/admin/AddBookForm";
import { DeleteBookDialog } from "@/components/admin/DeleteBookDialog";
import { toast } from "sonner";
import { generateAndSaveCover } from "@/utils/generateCover";
import { Book } from "@/types/book";

// Define BookValidationStatus as an extension of the Book type
interface BookValidationStatus extends Book {
  slug: string; // Make slug required in this context
  total_pages: number; // Make total_pages required in this context
  expectedSegments: number; // Already in Book but as optional, here it's required
  availableQuestions: number; // Specific to validation status
  segments: number[]; // Available segments
  missingSegments: number[]; // Missing segments
  status: 'complete' | 'incomplete' | 'missing'; // Validation status
  cover_url?: string; // Cover URL
}

type BookSegmentStatus = {
  id: string;
  slug: string;
  title: string;
  expected_segments: number | null;
  available_questions: number;
  missing_segments: number[];
  status: 'unknown' | 'missing' | 'incomplete' | 'complete';
};

export function AdminBookList() {
  const [books, setBooks] = useState<BookValidationStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookToDelete, setBookToDelete] = useState<{id: string; title: string} | null>(null);
  const [isFixingSegments, setIsFixingSegments] = useState(false);
  const [updateTrigger, setUpdateTrigger] = useState(0);
  const [isManuallyRefreshing, setIsManuallyRefreshing] = useState(false);
  const [generatingCovers, setGeneratingCovers] = useState<Set<string>>(new Set());


  // Fonction pour corriger les segments commençant à 0
  const fixSegmentIndexing = async () => {
    setIsFixingSegments(true);

    try {
      // Récupérer tous les segments avec index 0
      const { data: segmentsAtZero, error: fetchError } = await supabase
        .from('reading_questions')
        .select('id, book_slug, segment')
        .eq('segment', 0);

      if (fetchError) throw fetchError;

      if (!segmentsAtZero || segmentsAtZero.length === 0) {
        toast("Aucun segment avec index 0 n'a été trouvé.", {
          description: "Information"
        });
        setIsFixingSegments(false);
        return;
      }

      // Pour chaque segment avec index 0, vérifiez s'il existe déjà un segment avec index 1
      const updatedCount = { success: 0, skipped: 0, failed: 0 };

      for (const segment of segmentsAtZero) {
        // Vérifier si un segment 1 existe déjà pour ce livre
        const { data: existingSegments, error: checkError } = await supabase
          .from('reading_questions')
          .select('id')
          .eq('book_slug', segment.book_slug)
          .eq('segment', 1)
          .maybeSingle();

        if (checkError) {
          console.error(`Erreur lors de la vérification du segment 1 pour ${segment.book_slug}:`, checkError);
          updatedCount.failed++;
          continue;
        }

        if (existingSegments) {
          // Si un segment 1 existe déjà, supprimer le segment 0
          const { error: deleteError } = await supabase
            .from('reading_questions')
            .delete()
            .eq('id', segment.id);

          if (deleteError) {
            console.error(`Erreur lors de la suppression du segment 0 pour ${segment.book_slug}:`, deleteError);
            updatedCount.failed++;
          } else {
            updatedCount.skipped++;
          }
        } else {
          // Si aucun segment 1 n'existe, mettre à jour le segment 0 en segment 1
          const { error: updateError } = await supabase
            .from('reading_questions')
            .update({ segment: 1 })
            .eq('id', segment.id);

          if (updateError) {
            console.error(`Erreur lors de la mise à jour du segment 0 vers 1 pour ${segment.book_slug}:`, updateError);
            updatedCount.failed++;
          } else {
            updatedCount.success++;
          }
        }
      }

      toast.success(`${updatedCount.success} segments mis à jour, ${updatedCount.skipped} segments supprimés car redondants, ${updatedCount.failed} erreurs.`, {
        description: "Correction des segments terminée"
      });

      // Rafraîchir les données
      fetchBooksValidationStatus();

    } catch (error: any) {
      console.error("Erreur lors de la correction des segments:", error);
      toast.error(`Impossible de corriger les segments: ${error.message}`, {
        description: "Erreur"
      });
    } finally {
      setIsFixingSegments(false);
    }
  };

  // Fonction pour obtenir l'état de validation des livres
  const fetchBooksValidationStatus = useCallback(async () => {
    console.log("Fetching books validation status...", new Date().toISOString());
    setIsLoading(true);
    setError(null);

    try {
      // Récupérer tous les livres avec expected_segments
      const { data: booksData, error: booksError } = await supabase
        .from('books')
        .select('id, title, slug, total_pages, cover_url, expected_segments');

      if (booksError) throw booksError;

      // Récupérer l'état des segments depuis la vue
      const { data: statuses } = await supabase
        .from('book_segment_status')
        .select('*');

      const bySlug = new Map(statuses?.map(s => [s.slug, s as BookSegmentStatus]) ?? []);

      // Transformer les données pour l'affichage
      const booksWithStatus: BookValidationStatus[] = booksData.map(book => {
        const totalPages = book.total_pages || 0;
        const expectedSegments = book.expected_segments ?? 0;
        const statusData = bySlug.get(book.slug);

        const availableQuestions = statusData?.available_questions ?? 0;
        const missingSegments = statusData?.missing_segments ?? [];
        const status = statusData?.status === 'complete' ? 'complete' :
                      statusData?.status === 'incomplete' ? 'incomplete' : 'missing';

        // Create a BookValidationStatus object with all required fields
        return {
          id: book.id,
          title: book.title,
          slug: book.slug,
          total_pages: totalPages,
          expectedSegments: expectedSegments,
          availableQuestions: availableQuestions,
          segments: [], // We don't need this for display anymore
          missingSegments: missingSegments,
          status: status,
          cover_url: book.cover_url,
          // Add required fields from Book
          author: "", // Default value since it might not be available
          description: "", // Default value
          totalChapters: expectedSegments, // Use expectedSegments as totalChapters
          chaptersRead: availableQuestions, // Use availableQuestions as chaptersRead
          isCompleted: status === 'complete', // Mark as completed if all segments are available
          language: "fr", // Default value
          categories: [], // Default empty array
          pages: totalPages, // Use total_pages as pages
          publicationYear: new Date().getFullYear(), // Default to current year
        };
      });

      // Trier les livres : d'abord les incomplets, puis les manquants, puis les complets
      booksWithStatus.sort((a, b) => {
        const statusOrder = { incomplete: 0, missing: 1, complete: 2 };
        return statusOrder[a.status] - statusOrder[b.status];
      });

      setBooks(booksWithStatus);
      console.log("Fetched", booksWithStatus.length, "books");
    } catch (err: any) {
      console.error('Erreur lors de la récupération des données:', err);
      setError(err.message || "Erreur lors de la récupération des données");
    } finally {
      setIsLoading(false);
      setIsManuallyRefreshing(false);
    }
  }, []);

  // Force refresh when updateTrigger changes
  useEffect(() => {
    console.log("updateTrigger changed:", updateTrigger);
    fetchBooksValidationStatus();
  }, [updateTrigger, fetchBooksValidationStatus]);

  // Initial fetch
  useEffect(() => {
    fetchBooksValidationStatus();
  }, [fetchBooksValidationStatus]);

  // Fonction pour mettre à jour la liste après une modification
  const handleBookUpdate = useCallback(() => {
    console.log("handleBookUpdate called - forcing refresh");
    setUpdateTrigger(prev => prev + 1);
  }, []);

  // Fonction pour recharger manuellement les données
  const handleManualRefresh = () => {
    console.log("Manual refresh requested");
    setIsManuallyRefreshing(true);
    fetchBooksValidationStatus();
  };

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

  // Handler pour générer une couverture
  const handleGenerateCover = async (book: BookValidationStatus) => {
    setGeneratingCovers(prev => new Set(prev).add(book.id));

    try {
      const url = await generateAndSaveCover(book);
      toast.success(`URL: ${url}`, {
        description: `Couverture générée pour "${book.title}"`
      });
      handleBookUpdate();
    } catch (error: any) {
      toast.error(error.message, {
        description: "Erreur lors de la génération de la couverture"
      });
    } finally {
      setGeneratingCovers(prev => {
        const newSet = new Set(prev);
        newSet.delete(book.id);
        return newSet;
      });
    }
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
                <p className="text-body-sm flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>
                    Rappel : le segment 1 correspond aux pages 1 à 30, le segment 2 aux pages 31 à 60, etc.
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );

  if (isLoading && !isManuallyRefreshing) {
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
          <h3 className="text-h4 font-medium mb-2 text-destructive">Erreur</h3>
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
        <h2 className="text-h4 font-serif font-medium text-coffee-darker">
          État des questions de validation ({books.length} livres)
        </h2>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleManualRefresh}
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={isManuallyRefreshing}
          >
            {isManuallyRefreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCcw className="h-4 w-4" />
            )}
            Recharger manuellement
          </Button>
          <Button
            onClick={fixSegmentIndexing}
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={isFixingSegments}
          >
            {isFixingSegments ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowDownToLine className="h-4 w-4" />
            )}
            {isFixingSegments ? "Correction..." : "Corriger les segments à zéro"}
          </Button>
          <AddBookForm onBookAdded={handleBookUpdate} />
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
              <TableHead className="text-center">Cover</TableHead>
              <TableHead className="text-right">État</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {books.map(book => (
              <TableRow key={book.id}>
                <TableCell className="font-medium">{book.title}</TableCell>
                <TableCell className="text-right">{book.total_pages}</TableCell>
                <TableCell className="text-right">{book.expectedSegments}</TableCell>
                <TableCell className="text-right">{book.availableQuestions}</TableCell>
                <TableCell className="text-right">
                  {Math.round((book.availableQuestions / book.expectedSegments) * 100)}%
                </TableCell>
                <TableCell className="text-center">
                  {book.cover_url ? (
                    <div className="flex items-center justify-center text-green-600">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleGenerateCover(book)}
                      disabled={generatingCovers.has(book.id)}
                      className="text-caption px-2 py-1 h-6"
                    >
                      {generatingCovers.has(book.id) ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        "📕 Générer"
                      )}
                    </Button>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {renderStatus(book.status)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end items-center gap-2">
                    <BookMetadataEditor book={book} onUpdate={handleBookUpdate} />
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
                <TableCell colSpan={8} className="h-24 text-center">
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
          onDeleted={handleBookUpdate}
        />
      )}
    </div>
  );
}
