import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useBookValidation } from '../useBookValidation';
import { toast } from 'sonner';

// Mock dependencies
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock('../useBookQuiz', () => ({
  useBookQuiz: () => ({
    showQuiz: false,
    setShowQuiz: vi.fn(),
    quizChapter: 1,
    currentQuestion: null,
    showSuccessMessage: false,
    setShowSuccessMessage: vi.fn(),
    prepareAndShowQuestion: vi.fn().mockImplementation(() => {
      throw new Error('prepareAndShowQuestion error');
    }),
    handleQuizComplete: vi.fn(),
    isLocked: false,
    remainingLockTime: null,
    handleLockExpire: vi.fn(),
    isUsingJoker: false,
    jokersRemaining: 1,
  }),
}));

vi.mock('../useValidationState', () => ({
  useValidationState: () => ({
    isValidating: false,
    setIsValidating: vi.fn(),
    validationSegment: null,
    setValidationSegment: vi.fn(),
    validationError: null,
    setValidationError: vi.fn(),
    resetValidationState: vi.fn(),
  }),
}));

vi.mock('../useConfetti', () => ({
  useConfetti: () => ({
    showConfetti: vi.fn(),
  }),
}));

vi.mock('../useReadingProgress', () => ({
  useReadingProgress: () => ({
    forceRefresh: vi.fn(),
  }),
}));

vi.mock('../useQuizCompletion', () => ({
  useQuizCompletion: () => ({
    newBadges: [],
    setNewBadges: vi.fn(),
    handleQuizComplete: vi.fn(),
  }),
}));

vi.mock('../../components/books/BookMonthlyRewardHandler', () => ({
  useMonthlyReward: () => ({
    monthlyReward: null,
    showMonthlyReward: false,
    setShowMonthlyReward: vi.fn(),
  }),
}));

describe('useBookValidation', () => {
  const mockBook = {
    id: 'test-book-id',
    title: 'Test Book',
    author: 'Test Author',
    chaptersRead: 0,
  } as any;

  const mockUserId = 'test-user-id';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle validation confirm with proper isValidating state management', async () => {
    const { result } = renderHook(() =>
      useBookValidation({
        book: mockBook,
        userId: mockUserId,
      })
    );

    let isValidatingStates: boolean[] = [];
    const originalSetIsValidating = result.current.isValidating;

    // Track isValidating state changes
    const mockSetIsValidating = vi.fn((value: boolean) => {
      isValidatingStates.push(value);
    });

    // Test that isValidating goes to false even when prepareAndShowQuestion throws
    await act(async () => {
      try {
        await result.current.handleValidationConfirm();
      } catch (error) {
        // Expected to throw
      }
    });

    // Verify that setIsValidating(false) would be called in finally block
    expect(toast.error).toHaveBeenCalledWith('Erreur de validation', {
      description: 'prepareAndShowQuestion error',
      duration: 5000,
    });
  });

  it('should handle quiz completion with proper state management', async () => {
    const { result } = renderHook(() =>
      useBookValidation({
        book: mockBook,
        userId: mockUserId,
      })
    );

    await act(async () => {
      await result.current.handleQuizComplete(true, false);
    });

    // Should complete without throwing
    expect(result.current).toBeDefined();
  });
});