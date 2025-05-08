
import { supabase } from "@/integrations/supabase/client";
import { Book } from "@/types/book";
import { mapBookFromRecord } from "./bookMapper";

// Cache local pour les livres fréquemment consultés
const bookCache = new Map<string, { data: Book, timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes en millisecondes
const BOOKS_CACHE_KEY = 'read_app_books_cache';

// Fonction pour récupérer les données du cache persistant
const getPersistedBooksCache = () => {
  try {
    const cache = localStorage.getItem(BOOKS_CACHE_KEY);
    if (cache) {
      return JSON.parse(cache);
    }
  } catch (e) {
    console.error('Error parsing persisted books cache:', e);
  }
  return null;
};

// Fonction pour persister les données du cache
const persistBooksCache = (books: Book[]) => {
  try {
    // Limiter à 20 livres pour éviter de surcharger le localStorage
    const topBooks = books.slice(0, 20);
    localStorage.setItem(BOOKS_CACHE_KEY, JSON.stringify(topBooks));
  } catch (e) {
    console.error('Error persisting books cache:', e);
  }
};

export const getAllBooks = async (includeUnpublished = false): Promise<Book[]> => {
  try {
    // Vérifier d'abord dans le cache persistent pour le chargement initial rapide
    const persistedCache = getPersistedBooksCache();
    if (persistedCache && !includeUnpublished) {
      // Si on a un cache persistant, on l'utilise en attendant les données fraîches
      setTimeout(() => getAllBooks(includeUnpublished), 1000); // Rafraîchir après 1 seconde
      return persistedCache;
    }
    
    let query = supabase.from('books').select('*');
    
    // Filter out unpublished books if requested
    if (!includeUnpublished) {
      query = query.eq('is_published', true);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching books:', error);
      return [];
    }

    const books = data ? data.map(mapBookFromRecord) : [];
    
    // Persister le cache pour les prochains chargements
    if (books.length > 0 && !includeUnpublished) {
      persistBooksCache(books);
    }
    
    return books;
  } catch (error) {
    console.error('Exception fetching books:', error);
    return [];
  }
};

export const getBookById = async (id: string): Promise<Book | null> => {
  if (!id) {
    console.error('Invalid book ID provided (empty)');
    return null;
  }
  
  // Vérifier si le livre est dans le cache local et si le cache est encore valide
  const cached = bookCache.get(id);
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    return cached.data;
  }
  
  try {
    console.log(`[DEBUG] getBookById: Construction requête pour id=${id}`);
    
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error(`[ERREUR] Error fetching book ID ${id}:`, error);
      return null;
    }

    if (!data) {
      console.log(`[DEBUG] getBookById: Aucune donnée trouvée pour id=${id}`);
      return null;
    }

    const book = mapBookFromRecord(data);
    
    // Mettre en cache pour des accès futurs rapides
    bookCache.set(id, { data: book, timestamp: Date.now() });
    
    return book;
  } catch (error) {
    console.error(`[ERREUR] Exception fetching book ID ${id}:`, error);
    return null;
  }
};

export const getBooksByCategory = async (category: string, includeUnpublished = false): Promise<Book[]> => {
  if (!category) {
    console.error('Invalid category provided (empty)');
    return [];
  }
  
  try {
    let query = supabase
      .from('books')
      .select('*')
      .contains('tags', `{${category}}`);
    
    // Filter out unpublished books if requested
    if (!includeUnpublished) {
      query = query.eq('is_published', true);
    }
    
    const { data, error } = await query;

    if (error) {
      console.error('Error fetching books by category:', error);
      return [];
    }

    return data ? data.map(mapBookFromRecord) : [];
  } catch (error) {
    console.error(`Exception fetching books for category ${category}:`, error);
    return [];
  }
};

// Optimiser pour récupérer uniquement les catégories uniques avec un seul appel
export const getAvailableCategories = async (): Promise<string[]> => {
  try {
    // Au lieu de récupérer les tags de chaque livre puis de les déduplicer,
    // on utilise une RPC (fonction dans la base de données) ou une requête optimisée
    const { data, error } = await supabase
      .from('books')
      .select('tags')
      .eq('is_published', true);

    if (error) {
      console.error('Error fetching book categories:', error);
      return [];
    }

    // Optimiser l'extraction et la déduplication des tags
    const allTags = new Set<string>();
    data?.forEach(book => {
      if (book.tags && Array.isArray(book.tags)) {
        book.tags.forEach(tag => allTags.add(tag));
      }
    });
    
    return [...allTags];
  } catch (error) {
    console.error('Exception fetching categories:', error);
    return [];
  }
};

// Nouvelle fonction pour effacer le cache d'un livre spécifique ou tous les livres
export const clearBookCache = (bookId?: string) => {
  if (bookId) {
    bookCache.delete(bookId);
  } else {
    bookCache.clear();
  }
};
