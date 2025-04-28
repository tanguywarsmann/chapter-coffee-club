
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
    fetchBooks();
  }, [fetchBooks]);

  const renderContent = () => {
    if (loading.isLoading || loading.isLoadingReadingList) {
      return <LoadingBookList />;
    }
    
    if (error) {
      return <BookEmptyState hasError={true} />;
    }
    
    if (books.toRead.length === 0 && books.inProgress.length === 0 && books.completed.length === 0) {
      return (
        <BookEmptyState 
          hasError={false} 
          title="Aucune lecture trouvée" 
          description="Vous n'avez pas encore de livres dans votre liste de lecture."
        />
      );
    }
    
    return (
      <>
        {books.inProgress.length > 0 && (
          <BookListSection
            title="En cours de lecture"
            description="Reprenez où vous vous êtes arrêté"
            books={books.inProgress}
            showProgress
            actionLabel="Continuer la lecture"
            onAction={navigateToBook}
          />
        )}
        
        {books.toRead.length > 0 && (
          <BookListSection
            title="À lire"
            description="Votre liste de lecture à venir"
            books={books.toRead}
            actionLabel="Commencer la lecture"
            onAction={navigateToBook}
          />
        )}
        
        {books.completed.length > 0 && (
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
