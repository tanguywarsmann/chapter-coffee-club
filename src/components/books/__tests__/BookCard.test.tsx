
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { BookCard } from '../BookCard';
import { AuthProvider } from '@/contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Book } from '@/types/book';
import { toast } from 'sonner';

// Mock des hooks et services
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    info: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock('@/hooks/useReadingList', () => ({
  useReadingList: () => ({
    addToReadingList: vi.fn().mockResolvedValue(true),
  }),
}));

vi.mock('@/contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useAuth: vi.fn(),
}));

const mockBook: Book = {
  id: 'test-book-id',
  title: 'Test Book',
  author: 'Test Author',
  slug: 'test-book',
  coverImage: '',
  description: 'Test description',
  totalChapters: 10,
  chaptersRead: 0,
  isCompleted: false,
  language: 'fr',
  categories: ['Fiction'],
  pages: 200,
  publicationYear: 2023,
  book_author: 'Test Author',
  book_slug: 'test-book',
  book_cover: null,
  total_chapters: 10,
  created_at: '2023-01-01T00:00:00.000Z',
  is_published: true,
  tags: ['Fiction'],
};

const TestWrapper = ({ children, withAuth = true }: { children: React.ReactNode; withAuth?: boolean }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  if (withAuth) {
    return (
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            {children}
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('BookCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Authentification', () => {
    it('affiche un toast d\'erreur quand l\'utilisateur n\'est pas connecté', async () => {
      const { useAuth } = await import('@/contexts/AuthContext');
      vi.mocked(useAuth).mockReturnValue({
        user: null,
        session: null,
        isLoading: false,
        isInitialized: true,
        isAdmin: false,
        error: null,
        setError: vi.fn(),
      });

      render(
        <TestWrapper>
          <BookCard book={mockBook} showAddButton={true} />
        </TestWrapper>
      );

      const addButton = screen.getByRole('button', { name: /ajouter/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          'Vous devez être connecté pour ajouter un livre à votre liste'
        );
      });
    });

    it('permet l\'ajout quand l\'utilisateur est connecté', async () => {
      const { useAuth } = await import('@/contexts/AuthContext');
      vi.mocked(useAuth).mockReturnValue({
        user: { id: 'user-123', email: 'test@example.com' } as any,
        session: {} as any,
        isLoading: false,
        isInitialized: true,
        isAdmin: false,
        error: null,
        setError: vi.fn(),
      });

      render(
        <TestWrapper>
          <BookCard book={mockBook} showAddButton={true} />
        </TestWrapper>
      );

      const addButton = screen.getByRole('button', { name: /ajouter/i });
      fireEvent.click(addButton);

      // Ne devrait pas afficher de toast d'erreur d'authentification
      expect(toast.error).not.toHaveBeenCalledWith(
        'Vous devez être connecté pour ajouter un livre à votre liste'
      );
    });
  });

  describe('Validation du livre', () => {
    it('ne rend pas le composant si le livre est null', () => {
      render(
        <TestWrapper>
          <BookCard book={null as any} />
        </TestWrapper>
      );

      expect(screen.queryByText('Test Book')).not.toBeInTheDocument();
    });

    it('ne rend pas le composant si le livre n\'a pas d\'ID valide', () => {
      const invalidBook = { ...mockBook, id: '', slug: '' };
      
      render(
        <TestWrapper>
          <BookCard book={invalidBook} />
        </TestWrapper>
      );

      expect(screen.queryByText('Test Book')).not.toBeInTheDocument();
    });
  });

  describe('Protection contre les double-clics', () => {
    it('désactive le bouton pendant l\'ajout', async () => {
      const { useAuth } = await import('@/contexts/AuthContext');
      vi.mocked(useAuth).mockReturnValue({
        user: { id: 'user-123', email: 'test@example.com' } as any,
        session: {} as any,
        isLoading: false,
        isInitialized: true,
        isAdmin: false,
        error: null,
        setError: vi.fn(),
      });

      // Mock d'un addToReadingList qui prend du temps
      const { useReadingList } = await import('@/hooks/useReadingList');
      const mockAddToReadingList = vi.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(true), 100))
      );
      vi.mocked(useReadingList).mockReturnValue({
        addToReadingList: mockAddToReadingList,
      } as any);

      render(
        <TestWrapper>
          <BookCard book={mockBook} showAddButton={true} />
        </TestWrapper>
      );

      const addButton = screen.getByRole('button', { name: /ajouter/i });
      
      // Premier clic
      fireEvent.click(addButton);
      
      // Deuxième clic immédiat
      fireEvent.click(addButton);

      // Attendre que l'opération se termine
      await waitFor(() => {
        expect(mockAddToReadingList).toHaveBeenCalledTimes(1);
      });
    });
  });
});
