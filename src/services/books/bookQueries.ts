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
    const { data, error } = await supabase
      .from('books_public')
      .select('*')
      .order('title');

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
    
    // D'abord recherche par slug (plus fiable pour les URLs)
    console.log(`[DEBUG] Recherche par slug: ${cleanId}`);
    const { data: slugData, error: slugError } = await supabase
      .from('books_public')
      .select('*')
      .eq('slug', cleanId)
      .maybeSingle();
    
    if (slugError && slugError.code !== 'PGRST116') {
      console.error(`[ERROR] Erreur lors de la recherche par slug:`, slugError);
    }
    
    if (slugData) {
      console.log(`[DEBUG] Livre trouvé par slug: ${slugData.title} (${slugData.id})`);
      const book = mapBookFromRecord(slugData as BookRecord);
      
      // Mettre en cache avec les deux clés possibles
      bookCache.set(cleanId, { data: book, timestamp: Date.now() });
      bookCache.set(book.id, { data: book, timestamp: Date.now() });
      
      return book;
    }
    
    // Si pas trouvé par slug, essayer par ID
    const isUuid = isValidUuid(cleanId);
    if (isUuid) {
      console.log(`[DEBUG] Recherche par UUID: ${cleanId}`);
      const { data: idData, error: idError } = await supabase
        .from('books_public')
        .select('*')
        .eq('id', cleanId)
        .maybeSingle();
      
      if (idError && idError.code !== 'PGRST116') {
        console.error(`[ERROR] Erreur lors de la recherche par ID:`, idError);
      }
      
      if (idData) {
        console.log(`[DEBUG] Livre trouvé par ID: ${idData.title} (${idData.id})`);
        const book = mapBookFromRecord(idData as BookRecord);
        
        // Mettre en cache
        bookCache.set(cleanId, { data: book, timestamp: Date.now() });
        if (book.slug) {
          bookCache.set(book.slug, { data: book, timestamp: Date.now() });
        }
        
        return book;
      }
    } else {
      // Si ce n'est pas un UUID, essayer comme slug sans filtre published
      console.log(`[DEBUG] Recherche par slug sans filtre published: ${cleanId}`);
      const { data: anySlugData, error: anySlugError } = await supabase
        .from('books_public')
        .select('*')
        .eq('slug', cleanId)
        .maybeSingle();
      
      if (anySlugError && anySlugError.code !== 'PGRST116') {
        console.error(`[ERROR] Erreur lors de la recherche par slug sans filtre:`, anySlugError);
      }
      
      if (anySlugData) {
        console.log(`[DEBUG] Livre trouvé par slug sans filtre: ${anySlugData.title} (${anySlugData.id})`);
        const book = mapBookFromRecord(anySlugData as BookRecord);
        
        // Mettre en cache
        bookCache.set(cleanId, { data: book, timestamp: Date.now() });
        
        return book;
      }
    }
    
    console.log(`[DEBUG] Aucun livre trouvé pour: ${cleanId}`);
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
        .from('books_public')
        .select('*')
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
 * Récupère les catégories disponibles
 */
export const getAvailableCategories = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('books_public')
      .select('tags');

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
