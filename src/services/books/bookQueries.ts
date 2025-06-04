
import { supabase } from "@/integrations/supabase/client";
import { Book } from "@/types/book";
import { mapBookFromRecord } from "./bookMapper";
import { Database } from "@/integrations/supabase/types";

type BookRecord = Database['public']['Tables']['books']['Row'];

// Cache local pour les livres fréquemment consultés
const bookCache = new Map<string, { data: Book, timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Récupère tous les livres avec cache amélioré
 */
export const getAllBooks = async (includeUnpublished = false): Promise<Book[]> => {
  try {
    let query = supabase.from('books').select('*').order('title');
    
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
    console.log(`[DEBUG] Cache hit pour livre: ${cleanId}`);
    return cached.data;
  }
  
  try {
    console.log(`[DEBUG] Recherche livre avec identifiant: "${cleanId}"`);
    
    // Déterminer le type d'identifiant et construire la requête appropriée
    const isUuid = isValidUuid(cleanId);
    
    let query = supabase.from('books').select('*');
    
    if (isUuid) {
      console.log(`[DEBUG] Recherche par UUID: ${cleanId}`);
      query = query.eq('id', cleanId);
    } else {
      console.log(`[DEBUG] Recherche par slug: ${cleanId}`);
      query = query.eq('slug', cleanId);
    }
    
    const { data, error } = await query.maybeSingle();

    if (error) {
      console.error(`[ERROR] Erreur Supabase lors de la recherche:`, error);
      return null;
    }

    if (!data) {
      console.log(`[DEBUG] Aucun livre trouvé pour: ${cleanId}`);
      
      // Essayer l'autre méthode si la première a échoué
      if (isUuid) {
        console.log(`[DEBUG] Tentative de recherche par slug pour: ${cleanId}`);
        const { data: slugData, error: slugError } = await supabase
          .from('books')
          .select('*')
          .eq('slug', cleanId)
          .maybeSingle();
          
        if (!slugError && slugData) {
          const book = mapBookFromRecord(slugData as BookRecord);
          bookCache.set(cleanId, { data: book, timestamp: Date.now() });
          return book;
        }
      } else {
        console.log(`[DEBUG] Tentative de recherche par ID pour: ${cleanId}`);
        const { data: idData, error: idError } = await supabase
          .from('books')
          .select('*')
          .eq('id', cleanId)
          .maybeSingle();
          
        if (!idError && idData) {
          const book = mapBookFromRecord(idData as BookRecord);
          bookCache.set(cleanId, { data: book, timestamp: Date.now() });
          return book;
        }
      }
      
      return null;
    }

    const book = mapBookFromRecord(data as BookRecord);
    console.log(`[DEBUG] Livre trouvé: ${book.title} (${book.id})`);
    
    // Mettre en cache avec les deux clés possibles
    bookCache.set(cleanId, { data: book, timestamp: Date.now() });
    if (book.id !== cleanId) {
      bookCache.set(book.id, { data: book, timestamp: Date.now() });
    }
    if (book.slug && book.slug !== cleanId) {
      bookCache.set(book.slug, { data: book, timestamp: Date.now() });
    }
    
    return book;
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
      .contains('tags', `{${category}}`);
    
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
        book.tags.forEach(tag => allTags.add(tag));
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
