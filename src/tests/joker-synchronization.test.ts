import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { getUsedJokersCount, getJokersInfo } from '@/utils/jokerUtils';
import { useJokerAtomically } from '@/services/jokerService';
import { useJokersInfo, invalidateAllJokersCache } from '@/hooks/useJokersInfo';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(),
          })),
        })),
      })),
    })),
    rpc: vi.fn(),
  },
}));

// Mock SWR
vi.mock('swr', () => ({
  default: vi.fn(),
  mutate: vi.fn(),
}));

describe('Joker Synchronization Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUsedJokersCount', () => {
    it('should return correct count of used jokers', async () => {
      const mockSupabase = await import('@/integrations/supabase/client');
      const mockData = [{ id: '1' }, { id: '2' }]; // 2 jokers utilisés
      
      vi.mocked(mockSupabase.supabase.from).mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => Promise.resolve({ data: mockData, error: null })),
          })),
        })),
      } as any);

      const count = await getUsedJokersCount('progress-123');
      expect(count).toBe(2);
    });

    it('should return 0 on error', async () => {
      const mockSupabase = await import('@/integrations/supabase/client');
      
      vi.mocked(mockSupabase.supabase.from).mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => Promise.resolve({ data: null, error: new Error('DB Error') })),
          })),
        })),
      } as any);

      const count = await getUsedJokersCount('progress-123');
      expect(count).toBe(0);
    });
  });

  describe('getJokersInfo', () => {
    it('should calculate correct jokers info', async () => {
      const mockSupabase = await import('@/integrations/supabase/client');
      const mockData = [{ id: '1' }]; // 1 joker utilisé
      
      vi.mocked(mockSupabase.supabase.from).mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => Promise.resolve({ data: mockData, error: null })),
          })),
        })),
      } as any);

      const info = await getJokersInfo(25, 'progress-123'); // 25 segments = 3 jokers autorisés
      
      expect(info.jokersAllowed).toBe(3); // Math.floor(25/10) + 1 = 3
      expect(info.jokersUsed).toBe(1);
    });
  });

  describe('Joker Usage Validation', () => {
    it('should prevent joker usage when none remaining', async () => {
      const mockSupabase = await import('@/integrations/supabase/client');
      
      // Mock RPC to return no jokers remaining
      vi.mocked(mockSupabase.supabase.rpc).mockResolvedValue({
        data: [{ jokers_remaining: 0, success: false, message: 'Plus aucun joker disponible' }],
        error: null,
        count: null,
        status: 200,
        statusText: 'OK'
      });

      const result = await useJokerAtomically('book-123', 'user-456', 5);
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('Plus aucun joker disponible');
      expect(result.jokersRemaining).toBe(0);
    });

    it('should successfully use joker when available', async () => {
      const mockSupabase = await import('@/integrations/supabase/client');
      
      // Mock RPC to return successful joker usage
      vi.mocked(mockSupabase.supabase.rpc).mockResolvedValue({
        data: [{ jokers_remaining: 2, success: true, message: 'Joker utilisé avec succès' }],
        error: null,
        count: null,
        status: 200,
        statusText: 'OK'
      });

      const result = await useJokerAtomically('book-123', 'user-456', 5);
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('succès');
      expect(result.jokersRemaining).toBe(2);
    });
  });

  describe('Cache Invalidation', () => {
    it('should invalidate cache after joker usage', async () => {
      const mockMutate = await import('swr');
      
      await invalidateAllJokersCache('book-123');
      
      expect(mockMutate.mutate).toHaveBeenCalledWith(
        expect.any(Function),
        undefined,
        { revalidate: true }
      );
    });
  });
});

/**
 * Guide de test manuel :
 * 
 * 1. Ouvrir l'app et naviguer vers un livre
 * 2. Répondre incorrectement à un quiz pour déclencher le joker
 * 3. Utiliser le joker et vérifier que :
 *    - Le compteur dans la barre de progression se met à jour immédiatement
 *    - L'historique de validation montre le nouveau joker utilisé
 *    - Le prochain quiz n'affiche plus de joker si le quota est atteint
 * 
 * 4. Test de la double utilisation :
 *    - Essayer de cliquer rapidement deux fois sur "Utiliser un Joker"
 *    - Vérifier qu'un seul joker est consommé
 *    - Vérifier que l'interface affiche l'état correct
 */