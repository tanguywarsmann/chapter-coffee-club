
import React, { useEffect } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { BookListSection } from "@/components/reading/BookListSection";
import { LoadingBookList } from "@/components/reading/LoadingBookList";
import { BookEmptyState } from "@/components/reading/BookEmptyState";
import { ReadingListHeader } from "@/components/reading/ReadingListHeader";
import { FetchingStatus } from "@/components/reading/FetchingStatus";
import { useReadingListPage } from "@/hooks/useReadingListPage";
import { useLogger } from "@/utils/logger";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function ReadingList() {
  const logger = useLogger('ReadingList');
  const { user, session } = useAuth();
  const navigate = useNavigate();
  
  // Rediriger si pas authentifié
  useEffect(() => {
    if (!user || !session) {
      console.log('[ReadingList] User not authenticated, redirecting to auth');
      navigate('/auth');
      return;
    }
    logger.info("ReadingList component mounted for user:", user.id);
  }, [user, session, navigate, logger]);
  
  const {
    books,
    loading,
    error,
    sortBy,
    setSortBy,
    navigateToBook,
    fetchBooks
  } = useReadingListPage();

  // Log spécifique pour le débogage des listes de livres
  logger.debug("Reading list state", {
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
      logger.debug("Showing loading state", {
        isLoading: loading.isLoading, 
        isLoadingReadingList: loading.isLoadingReadingList,
        isDataReady: loading.isDataReady
      });
      return <LoadingBookList />;
    }
    
    if (error) {
      logger.warn("Showing error state");
      return <BookEmptyState hasError={true} />;
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
        
        <main className="mx-auto w-full px-4 max-w-none px-4 sm:px-6 lg:px-8 py-6 space-y-8">
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
