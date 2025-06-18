
import { describe, it, expect } from 'vitest';
import { assertValidBook, isValidBook } from '../bookValidation';
import { InvalidBookError } from '../readingListErrors';
import { Book } from '@/types/book';

const validBook: Book = {
  id: 'valid-book-id',
  title: 'Valid Book',
  author: 'Valid Author',
  slug: 'valid-book',
  coverImage: '',
  description: 'Valid description',
  totalChapters: 10,
  chaptersRead: 0,
  isCompleted: false,
  language: 'fr',
  categories: ['Fiction'],
  pages: 200,
  publicationYear: 2023,
  book_title: 'Valid Book',
  book_author: 'Valid Author',
  book_slug: 'valid-book',
  book_cover: null,
  total_chapters: 10,
  created_at: '2023-01-01T00:00:00.000Z',
  is_published: true,
  tags: ['Fiction'],
};

describe('bookValidation', () => {
  describe('assertValidBook', () => {
    it('accepte un livre valide avec ID', () => {
      expect(() => assertValidBook(validBook)).not.toThrow();
    });

    it('accepte un livre valide avec slug uniquement', () => {
      const bookWithSlug = { ...validBook, id: '', slug: 'valid-slug' };
      expect(() => assertValidBook(bookWithSlug)).not.toThrow();
    });

    it('rejette un livre null', () => {
      expect(() => assertValidBook(null)).toThrow(InvalidBookError);
      expect(() => assertValidBook(null)).toThrow('Le livre ne peut pas être null ou undefined');
    });

    it('rejette un livre undefined', () => {
      expect(() => assertValidBook(undefined)).toThrow(InvalidBookError);
    });

    it('rejette un livre sans ID ni slug', () => {
      const invalidBook = { ...validBook, id: '', slug: '' };
      expect(() => assertValidBook(invalidBook)).toThrow(InvalidBookError);
    });

    it('rejette un livre sans titre', () => {
      const invalidBook = { ...validBook, title: '' };
      expect(() => assertValidBook(invalidBook)).toThrow(InvalidBookError);
    });

    it('rejette un livre avec ID vide', () => {
      const invalidBook = { ...validBook, id: '   ', slug: '' };
      expect(() => assertValidBook(invalidBook)).toThrow(InvalidBookError);
    });
  });

  describe('isValidBook', () => {
    it('retourne true pour un livre valide', () => {
      expect(isValidBook(validBook)).toBe(true);
    });

    it('retourne false pour un livre invalide', () => {
      expect(isValidBook(null)).toBe(false);
      expect(isValidBook({ ...validBook, id: '', slug: '' })).toBe(false);
    });
  });
});
