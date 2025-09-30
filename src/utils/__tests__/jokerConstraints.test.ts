import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock environment variables
const mockEnv = {
  VITE_JOKER_MIN_SEGMENTS_ENABLED: 'false',
  VITE_JOKER_MIN_SEGMENTS: '3'
};

vi.stubGlobal('import.meta', {
  env: mockEnv
});

// Import after mocking
import { canUseJokers, calculateJokersAllowed, getJokerDisabledMessage } from '../jokerConstraints';

describe('jokerConstraints', () => {
  beforeEach(() => {
    // Reset mocks
    mockEnv.VITE_JOKER_MIN_SEGMENTS_ENABLED = 'false';
    mockEnv.VITE_JOKER_MIN_SEGMENTS = '3';
  });

  describe('canUseJokers', () => {
    it('should return true when flag is disabled', () => {
      mockEnv.VITE_JOKER_MIN_SEGMENTS_ENABLED = 'false';
      expect(canUseJokers(2)).toBe(true);
      expect(canUseJokers(3)).toBe(true);
      expect(canUseJokers(10)).toBe(true);
    });

    it('should enforce minimum when flag is enabled', () => {
      mockEnv.VITE_JOKER_MIN_SEGMENTS_ENABLED = 'true';
      expect(canUseJokers(2)).toBe(false);
      expect(canUseJokers(3)).toBe(true);
      expect(canUseJokers(10)).toBe(true);
    });

    it('should handle invalid input', () => {
      expect(canUseJokers(NaN)).toBe(false);
      expect(canUseJokers(Infinity)).toBe(false);
    });
  });

  describe('calculateJokersAllowed', () => {
    it('should use legacy calculation when flag disabled', () => {
      mockEnv.VITE_JOKER_MIN_SEGMENTS_ENABLED = 'false';
      expect(calculateJokersAllowed(2)).toBe(1); // Math.floor(2/10) + 1 = 1
      expect(calculateJokersAllowed(10)).toBe(2); // Math.floor(10/10) + 1 = 2
      expect(calculateJokersAllowed(15)).toBe(2); // Math.floor(15/10) + 1 = 2
    });

    it('should return 0 for books below minimum when flag enabled', () => {
      mockEnv.VITE_JOKER_MIN_SEGMENTS_ENABLED = 'true';
      expect(calculateJokersAllowed(2)).toBe(0);
      expect(calculateJokersAllowed(3)).toBe(1);
      expect(calculateJokersAllowed(10)).toBe(2);
    });

    it('should handle undefined/null input', () => {
      expect(calculateJokersAllowed()).toBe(1); // default 0 -> Math.floor(0/10) + 1 = 1
    });
  });

  describe('getJokerDisabledMessage', () => {
    it('should return empty string when flag disabled', () => {
      mockEnv.VITE_JOKER_MIN_SEGMENTS_ENABLED = 'false';
      expect(getJokerDisabledMessage(2)).toBe('');
    });

    it('should return message when flag enabled and below minimum', () => {
      mockEnv.VITE_JOKER_MIN_SEGMENTS_ENABLED = 'true';
      expect(getJokerDisabledMessage(2)).toBe('Les jokers sont disponibles à partir de 3 segments.');
      expect(getJokerDisabledMessage(3)).toBe('');
    });
  });
});