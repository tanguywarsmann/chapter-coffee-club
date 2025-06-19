import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BookCard } from '../BookCard';
import { Book } from '@/types/book';
import { toast } from 'sonner';

// Mock dependencies
vi.mock('sonner');
vi.mock('@/hooks/useReadingList', () => ({
  useReadingList: () => ({
    addToReadingList: vi.fn().mockResolvedValue(true),
  }),
}));

vi.mock('@/services/reading/readingListService', () => ({
  addBookToReadingList: vi.fn().mockResolvedValue(true),
}));

const mockBook: Book = {
  id: '1',
  title: 'Test Book',
  author: 'Test Author',
  description: 'Test description',
  coverImage: 'test-cover.jpg',
  totalChapters: 10,
  chaptersRead: 0,
  isCompleted: false,
  language: 'fr',
  categories: ['Fiction'],
  pages: 200,
  publicationYear: 2023,
  slug: 'test-book',
};

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const renderWithQueryClient = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('BookCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders book information correctly', () => {
    renderWithQueryClient(<BookCard book={mockBook} />);
    
    expect(screen.getByText('Test Book')).toBeInTheDocument();
    expect(screen.getByText('Test Author')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('shows add to reading list button when not in list', async () => {
    renderWithQueryClient(<BookCard book={mockBook} />);
    
    const addButton = screen.getByText('Ajouter à ma liste');
    expect(addButton).toBeInTheDocument();
  });

  it('calls addToReadingList when the add button is clicked', async () => {
    const addToReadingListMock = vi.fn().mockResolvedValue(true);
    vi.mock('@/hooks/useReadingList', () => ({
      useReadingList: () => ({
        addToReadingList: addToReadingListMock,
      }),
    }));

    renderWithQueryClient(<BookCard book={mockBook} />);
    
    const addButton = screen.getByText('Ajouter à ma liste');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(addToReadingListMock).toHaveBeenCalledWith(mockBook);
    });
  });

  it('displays a success toast when book is added successfully', async () => {
    renderWithQueryClient(<BookCard book={mockBook} />);
    
    const addButton = screen.getByText('Ajouter à ma liste');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        `"${mockBook.title}" ajouté à votre liste de lecture`
      );
    });
  });

  it('displays an error toast when adding book fails', async () => {
    vi.mock('@/hooks/useReadingList', () => ({
      useReadingList: () => ({
        addToReadingList: vi.fn().mockResolvedValue(false),
      }),
    }));

    renderWithQueryClient(<BookCard book={mockBook} />);
    
    const addButton = screen.getByText('Ajouter à ma liste');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        `Impossible d'ajouter "${mockBook.title}" à votre liste`
      );
    });
  });
});
