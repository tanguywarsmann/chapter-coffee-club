import { useRef, useCallback } from 'react';
import { validateReadingSegmentBeta } from '@/services/reading/validationServiceBeta';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UseAtomicValidationProps {
  onSuccess?: (result: any) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook for atomic validation that prevents double submissions
 * and provides immediate success feedback
 */
export function useAtomicValidation({ onSuccess, onError }: UseAtomicValidationProps = {}) {
  const inFlightRef = useRef(false);

  const validateSegment = useCallback(async (args: {
    bookSlug: string;
    questionId: string; 
    answer: string;
    userId: string;
    usedJoker?: boolean;
  }) => {
    // Prevent double submission
    if (inFlightRef.current) {
      console.warn('[useAtomicValidation] Validation already in progress, ignoring');
      return null;
    }

    inFlightRef.current = true;

    try {
      // Get book UUID from slug
      const { data: bookData, error: bookError } = await supabase
        .from('books')
        .select('id')
        .eq('slug', args.bookSlug)
        .maybeSingle();
      
      if (bookError || !bookData) {
        throw new Error('Livre introuvable');
      }

      // Atomic validation
      const result = await validateReadingSegmentBeta({
        bookId: bookData.id,
        questionId: args.questionId,
        answer: args.answer,
        userId: args.userId,
        usedJoker: args.usedJoker || false,
        correct: true
      });

      // ✅ Immediate success
      onSuccess?.(result);
      return result;

    } catch (error) {
      const err = error instanceof Error ? error : new Error('Validation failed');
      onError?.(err);
      throw err;
    } finally {
      inFlightRef.current = false;
    }
  }, [onSuccess, onError]);

  return {
    validateSegment,
    isValidating: inFlightRef.current
  };
}