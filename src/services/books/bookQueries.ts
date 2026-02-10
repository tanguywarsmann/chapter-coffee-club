import { supabase } from "@/integrations/supabase/client";
import { Book } from "@/types/book";
import { mapBookFromRecord } from "./bookMapper";
import { BookPublicRecord } from "./types";

// Cache local pour les livres fréquemment consultés
const bookCache = new Map<string, { data: Book, timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Récupère tous les livres publiés avec cache amélioré
 */
export const getAllBooks = async (includeUnpublished = false): Promise<Book[]> => {
  try {
    let query = supabase
      .from('books')
      .select('*')
      .order('title');

    if (!includeUnpublished) {
      query = query.eq('is_published', true);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching books:', error);
      return [];
    }

    return data ? data.map(mapBookFromRecord) : [];
  } catch (error) {
    console.error('Exception fetching books:', error);
    return [];
  }
};

/**
 * Vérifie si une chaîne est un UUID valide
 */
const isValidUuid = (id: string): boolean => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
};

/**
 * Récupère un livre par son ID ou son slug avec gestion d'erreur améliorée
 */
export const getBookById = async (id: string): Promise<Book | null> => {
  if (!id || typeof id !== 'string') {
    console.error('[ERROR] getBookById: ID invalide:', id);
    return null;
  }
  
  const cleanId = id.trim();
  if (!cleanId) {
    console.error('[ERROR] getBookById: ID vide après nettoyage');
    return null;
  }
  
  // Vérifier le cache local
  const cached = bookCache.get(cleanId);
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    return cached.data;
  }
  
  try {
    // D'abord recherche par slug (plus fiable pour les URLs)
    const { data: slugData, error: slugError } = await supabase
      .from('books')
      .select('*')
      .eq('is_published', true)
      .eq('slug', cleanId)
      .maybeSingle();
    
    if (slugError && slugError.code !== 'PGRST116') {
      console.error(`[ERROR] Erreur lors de la recherche par slug:`, slugError);
    }
    
    if (slugData) {
      const book = mapBookFromRecord(slugData as BookPublicRecord);
      
      // Mettre en cache avec les deux clés possibles
      bookCache.set(cleanId, { data: book, timestamp: Date.now() });
      bookCache.set(book.id, { data: book, timestamp: Date.now() });
      
      return book;
    }
    
    // Si pas trouvé par slug, essayer par ID
    const isUuid = isValidUuid(cleanId);
    if (isUuid) {
      const { data: idData, error: idError } = await supabase
        .from('books')
        .select('*')
        .eq('is_published', true)
        .eq('id', cleanId)
        .maybeSingle();
      
      if (idError && idError.code !== 'PGRST116') {
        console.error(`[ERROR] Erreur lors de la recherche par ID:`, idError);
      }
      
      if (idData) {
        const book = mapBookFromRecord(idData as BookPublicRecord);
        
        // Mettre en cache
        bookCache.set(cleanId, { data: book, timestamp: Date.now() });
        if (book.slug) {
          bookCache.set(book.slug, { data: book, timestamp: Date.now() });
        }
        
        return book;
      }
    }
    
    return null;

  } catch (error) {
    console.error(`[ERROR] Exception lors de la recherche du livre:`, error);
    return null;
  }
};

/**
 * Récupère les livres par catégorie
 */
export const getBooksByCategory = async (category: string, includeUnpublished = false): Promise<Book[]> => {
  if (!category) {
    console.error('Catégorie invalide');
    return [];
  }
  
  try {
    let query = supabase
      .from('books')
      .select('*')
      .eq('is_published', true)
      .contains('tags', `{${category}}`);
  
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

/**
 * Récupère les livres par catégorie spécifique (Religion, Essai, Littérature)
 */
export const getBooksBySpecificCategory = async (category: 'religion' | 'essai' | 'litterature'): Promise<Book[]> => {
  try {
    let query = supabase
      .from('books')
      .select('*')
      .eq('is_published', true)
      .order('title');

    if (category === 'religion') {
      query = query.contains('tags', ['Religion']);
    } else if (category === 'essai') {
      query = query.contains('tags', ['Essai']);
    } else {
      // Littérature = tout ce qui n'est ni Religion ni Essai
      query = query.not('tags', 'cs', ['Religion']).not('tags', 'cs', ['Essai']);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching books by specific category:', error);
      return [];
    }

    return data ? data.map(mapBookFromRecord) : [];
  } catch (error) {
    console.error(`Exception fetching books for specific category ${category}:`, error);
    return [];
  }
};

/**
 * Récupère les catégories disponibles
 */
export const getAvailableCategories = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('books')
      .select('tags')
      .eq('is_published', true);

    if (error) {
      console.error('Error fetching book categories:', error);
      return [];
    }

    const allTags = new Set<string>();
    data?.forEach(book => {
      if (book.tags && Array.isArray(book.tags)) {
        book.tags.forEach((tag: string) => allTags.add(tag));
      }
    });
    
    return [...allTags];
  } catch (error) {
    console.error('Exception fetching categories:', error);
    return [];
  }
};

/**
 * Efface le cache
 */
export const clearBookCache = (bookId?: string): void => {
  if (bookId) {
    bookCache.delete(bookId);
  } else {
    bookCache.clear();
  }
};
