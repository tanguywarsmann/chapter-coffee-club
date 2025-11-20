
import React from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { BookListSection } from "@/components/reading/BookListSection";
import { LoadingBookList } from "@/components/reading/LoadingBookList";
import { BookEmptyState } from "@/components/reading/BookEmptyState";
import { FetchingStatus } from "@/components/reading/FetchingStatus";
import { useReadingListPage } from "@/hooks/useReadingListPage";
import { useLogger } from "@/utils/logger";
import { useAuth } from "@/contexts/AuthContext";

export default function ReadingList() {
  const logger = useLogger('ReadingList');
  const { user } = useAuth();
  logger.info("ReadingList component mounted", { userId: user?.id });
  
  const {
    books,
    loading,
    error,
    retry,
    navigateToBook,
  } = useReadingListPage();

  // Log spécifique pour le débogage des listes de livres
  logger.debug("Reading list state", {
    toReadCount: books.toRead?.length || 0,
    inProgressCount: books.inProgress?.length || 0,
    completedCount: books.completed?.length || 0,
    isLoading: loading.isLoading,
    isFetching: loading.isFetching
  });

  const renderContent = () => {
    if (loading.isLoading) {
      logger.debug("Showing loading state");
      return <LoadingBookList />;
    }
    
    if (error) {
      logger.warn("Showing error state");
      return (
        <div className="text-center p-8 border border-dashed rounded-lg">
          <p className="text-muted-foreground mb-4">Impossible de charger votre liste de lecture.</p>
          <p className="text-sm text-destructive mb-4">{error}</p>
          <button
            className="text-coffee-dark hover:text-coffee-darker underline"
            onClick={() => retry()}
          >
            Réessayer
          </button>
        </div>
      );
    }
    
    if (!books.toRead?.length && !books.inProgress?.length && !books.completed?.length) {
      logger.info("All lists are empty, showing empty state");
      return (
        <BookEmptyState 
          hasError={false} 
          title="Aucune lecture trouvée" 
          description="Vous n'avez pas encore de livres dans votre liste de lecture."
        />
      );
    }
    
    logger.debug("Rendering book sections", {
      inProgress: books.inProgress?.length || 0,
      toRead: books.toRead?.length || 0,
      completed: books.completed?.length || 0
    });
    
    return (
      <div className="space-y-8">
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
            enablePagination={books.toRead.length > 8}
            initialPageSize={8}
            showRemoveButton={true}
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
            enablePagination={books.completed.length > 10}
            initialPageSize={10}
          />
        )}
      </div>
    );
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <AppHeader />
        
        <main className="max-w-6xl mx-auto px-4 py-8 md:py-12 space-y-8">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-coffee-darker">Ma liste de lecture</h1>
          </div>
          <FetchingStatus isFetching={loading.isFetching} />

          {renderContent()}
        </main>
      </div>
    </AuthGuard>
  );
}
