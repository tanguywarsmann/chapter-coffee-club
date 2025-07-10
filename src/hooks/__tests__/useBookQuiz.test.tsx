import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useBookQuiz } from '../useBookQuiz';
import { toast } from 'sonner';

// Mock des dépendances
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock('@/services/questionService', () => ({
  getQuestionForBookSegment: vi.fn(),
  isSegmentAlreadyValidated: vi.fn(() => Promise.resolve(false)),
}));

vi.mock('@/services/reading/validationService', () => ({
  validateReading: vi.fn(),
}));

vi.mock('@/services/validation/lockService', () => ({
  checkValidationLock: vi.fn(() => Promise.resolve({ isLocked: false, remainingTime: null })),
}));

vi.mock('@/services/jokerService', () => ({
  useJokerAtomically: vi.fn(),
  getRemainingJokers: vi.fn(() => Promise.resolve(1)),
}));

vi.mock('@/hooks/useJokersInfo', () => ({
  invalidateAllJokersCache: vi.fn(),
}));

const mockBook = {
  id: 'test-book-id',
  title: 'Test Book',
  author: 'Test Author',
  slug: 'test-book',
  expected_segments: 10,
  total_chapters: 10,
};

const mockUserId = 'test-user-id';

describe('useBookQuiz', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with correct default values', () => {
    const { result } = renderHook(() => useBookQuiz(mockBook, mockUserId));

    expect(result.current.showQuiz).toBe(false);
    expect(result.current.isValidating).toBe(false);
    expect(result.current.isUsingJoker).toBe(false);
    expect(result.current.showSuccessMessage).toBe(false);
  });

  it('should reset isValidating to false after successful validation', async () => {
    const { validateReading } = await import('@/services/reading/validationService');
    vi.mocked(validateReading).mockResolvedValue({ 
      message: 'Success',
      current_page: 30,
      next_segment_question: null
    });

    const { result } = renderHook(() => useBookQuiz(mockBook, mockUserId));

    await act(async () => {
      await result.current.handleQuizComplete(true, false);
    });

    expect(result.current.isValidating).toBe(false);
  });

  it('should reset isValidating to false even when validateReading throws error', async () => {
    const { validateReading } = await import('@/services/reading/validationService');
    vi.mocked(validateReading).mockRejectedValue(new Error('Test error'));

    const { result } = renderHook(() => useBookQuiz(mockBook, mockUserId));

    await act(async () => {
      try {
        await result.current.handleQuizComplete(true, false);
      } catch (error) {
        // Expected error
      }
    });

    // Vérifier que isValidating est reset même en cas d'erreur
    expect(result.current.isValidating).toBe(false);
  });

  it('should reset isUsingJoker to false even when joker validation throws error', async () => {
    const { useJokerAtomically } = await import('@/services/jokerService');
    vi.mocked(useJokerAtomically).mockRejectedValue(new Error('Joker error'));

    const { result } = renderHook(() => useBookQuiz(mockBook, mockUserId));

    await act(async () => {
      try {
        await result.current.handleQuizComplete(false, true);
      } catch (error) {
        // Expected error
      }
    });

    // Vérifier que isUsingJoker est reset même en cas d'erreur
    expect(result.current.isValidating).toBe(false);
    expect(result.current.isUsingJoker).toBe(false);
  });

  it('should handle missing user or book information gracefully', async () => {
    const { result } = renderHook(() => useBookQuiz(null, null));

    await act(async () => {
      await result.current.handleQuizComplete(true, false);
    });

    expect(toast.error).toHaveBeenCalledWith('Information utilisateur ou livre manquante');
    expect(result.current.isValidating).toBe(false);
  });

  it('should reset quiz state when resetQuizState is called', () => {
    const { result } = renderHook(() => useBookQuiz(mockBook, mockUserId));

    // Simuler un état actif
    act(() => {
      result.current.setShowQuiz(true);
      result.current.setShowSuccessMessage(true);
    });

    // Reset l'état
    act(() => {
      result.current.resetQuizState();
    });

    expect(result.current.showQuiz).toBe(false);
    expect(result.current.showSuccessMessage).toBe(false);
    expect(result.current.isValidating).toBe(false);
    expect(result.current.isUsingJoker).toBe(false);
  });

  it('should handle prepareAndShowQuestion errors gracefully', async () => {
    const { getQuestionForBookSegment } = await import('@/services/questionService');
    vi.mocked(getQuestionForBookSegment).mockRejectedValue(new Error('Question error'));

    const { result } = renderHook(() => useBookQuiz(mockBook, mockUserId));

    await act(async () => {
      try {
        await result.current.prepareAndShowQuestion(1);
      } catch (error) {
        // Expected error
      }
    });

    // Vérifier que isValidating est reset même en cas d'erreur dans prepareAndShowQuestion
    expect(result.current.isValidating).toBe(false);
  });
});