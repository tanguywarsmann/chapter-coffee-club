
import React, { useEffect } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { BookListSection } from "@/components/reading/BookListSection";
import { LoadingBookList } from "@/components/reading/LoadingBookList";
import { BookEmptyState } from "@/components/reading/BookEmptyState";
import { ReadingListHeader } from "@/components/reading/ReadingListHeader";
import { FetchingStatus } from "@/components/reading/FetchingStatus";
import { useReadingListPage } from "@/hooks/useReadingListPage";

export default function ReadingList() {
  console.log("[DEBUG] Montage du composant ReadingList");
  
  const {
    books,
    loading,
    error,
    sortBy,
    setSortBy,
    navigateToBook,
    fetchBooks
  } = useReadingListPage();

  useEffect(() => {
    // N'appelons fetchBooks que si nous n'avons pas de données et que nous ne sommes pas déjà en train de charger
    if (!loading.isLoading && !loading.isFetching && 
        !books.toRead?.length && !books.inProgress?.length && !books.completed?.length) {
      console.log("[DEBUG] fetchBooks vraiment appelé - données initiales manquantes");
      fetchBooks();
    } else {
      console.log("[DEBUG] fetchBooks ignoré - données déjà présentes ou chargement en cours");
    }
  }, [fetchBooks, loading.isLoading, loading.isFetching, books.toRead?.length, books.inProgress?.length, books.completed?.length]);

  // Log spécifique pour le débogage des listes de livres
  console.log("[DEBUG] État des listes dans ReadingList.tsx", {
    toReadCount: books.toRead?.length || 0,
    inProgressCount: books.inProgress?.length || 0,
    completedCount: books.completed?.length || 0,
    isLoading: loading.isLoading,
    isLoadingReadingList: loading.isLoadingReadingList,
    isDataReady: loading.isDataReady
  });

  const renderContent = () => {
    // Afficher toujours le loader si les données ne sont pas prêtes
    if (loading.isLoading || loading.isLoadingReadingList || !loading.isDataReady) {
      console.log("[DEBUG] Affichage de LoadingBookList - isLoading:", loading.isLoading, 
                 "isLoadingReadingList:", loading.isLoadingReadingList,
                 "isDataReady:", loading.isDataReady);
      return <LoadingBookList />;
    }
    
    if (error) {
      console.log("[DEBUG] Affichage de BookEmptyState - erreur détectée");
      return <BookEmptyState hasError={true} />;
    }
    
    if (!books.toRead?.length && !books.inProgress?.length && !books.completed?.length) {
      console.log("[DEBUG] Toutes les listes sont vides, affichage de l'état vide");
      return (
        <BookEmptyState 
          hasError={false} 
          title="Aucune lecture trouvée" 
          description="Vous n'avez pas encore de livres dans votre liste de lecture."
        />
      );
    }
    
    console.log("[DEBUG] Rendu des sections de livre avec:", {
      inProgress: books.inProgress?.length || 0,
      toRead: books.toRead?.length || 0,
      completed: books.completed?.length || 0
    });
    
    return (
      <>
        {(books.inProgress?.length > 0) && (
          <BookListSection
            title="En cours de lecture"
            description="Reprenez où vous vous êtes arrêté"
            books={books.inProgress}
            showProgress
            actionLabel="Continuer la lecture"
            onAction={navigateToBook}
          />
        )}
        
        {(books.toRead?.length > 0) && (
          <BookListSection
            title="À lire"
            description="Votre liste de lecture à venir"
            books={books.toRead}
            actionLabel="Commencer la lecture"
            onAction={navigateToBook}
          />
        )}
        
        {(books.completed?.length > 0) && (
          <BookListSection
            title="Livres terminés"
            description="Vos lectures complétées"
            books={books.completed}
            showDate
            actionLabel="Relire"
            onAction={navigateToBook}
          />
        )}
      </>
    );
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <AppHeader />
        
        <main className="container py-6 space-y-8">
          <ReadingListHeader 
            sortBy={sortBy}
            onSortChange={setSortBy}
          />
          
          <FetchingStatus isFetching={loading.isFetching} />

          {renderContent()}
        </main>
      </div>
    </AuthGuard>
  );
}
