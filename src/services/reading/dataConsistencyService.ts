
import { supabase } from '@/integrations/supabase/client';
import { getValidatedSegmentCount } from './validatedSegmentCount';

/**
 * Service pour maintenir la cohérence des données de lecture
 */

export const fixInconsistentReadingStatus = async (userId: string) => {
  if (!userId) return { success: false, message: 'User ID manquant' };

  try {
    console.log(`[DataConsistency] Début de la correction pour l'utilisateur ${userId}`);

    // Récupérer tous les progrès de lecture de l'utilisateur
    const { data: progressList, error: fetchError } = await supabase
      .from('reading_progress')
      .select(`
        *,
        books (
          id,
          expected_segments,
          total_chapters
        )
      `)
      .eq('user_id', userId);

    if (fetchError) {
      console.error('[DataConsistency] Erreur lors de la récupération:', fetchError);
      return { success: false, message: 'Erreur lors de la récupération des données' };
    }

    if (!progressList || progressList.length === 0) {
      return { success: true, message: 'Aucun progrès trouvé à corriger' };
    }

    let corrected = 0;
    let errors = 0;

    // Traiter chaque livre
    for (const progress of progressList) {
      try {
        const bookId = progress.book_id;
        const expectedSegments = progress.books?.expected_segments || progress.books?.total_chapters || 1;
        
        // Récupérer le nombre réel de segments validés
        const validatedSegments = await getValidatedSegmentCount(userId, bookId);
        
        // Calculer le statut correct
        let correctStatus: 'to_read' | 'in_progress' | 'completed';
        if (validatedSegments >= expectedSegments) {
          correctStatus = 'completed';
        } else if (validatedSegments > 0) {
          correctStatus = 'in_progress';
        } else {
          correctStatus = 'to_read';
        }

        // Calculer la page courante correcte (approximative basée sur les segments)
        const correctCurrentPage = Math.floor((validatedSegments / expectedSegments) * progress.total_pages);

        // Mettre à jour si nécessaire
        if (progress.status !== correctStatus || Math.abs(progress.current_page - correctCurrentPage) > 10) {
          console.log(`[DataConsistency] Correction ${bookId}: ${progress.status} -> ${correctStatus}, page ${progress.current_page} -> ${correctCurrentPage}`);
          
          // Préparer les données de mise à jour
          const updateData: any = {
            status: correctStatus,
            current_page: correctCurrentPage,
            updated_at: new Date().toISOString()
          };
          
          // Si on passe à 'completed' et que completed_at n'est pas déjà défini, le mettre à jour
          if (correctStatus === 'completed' && !progress.completed_at) {
            updateData.completed_at = new Date().toISOString();
          }
          
          const { error: updateError } = await supabase
            .from('reading_progress')
            .update(updateData)
            .eq('id', progress.id);

          if (updateError) {
            console.error(`[DataConsistency] Erreur mise à jour ${bookId}:`, updateError);
            errors++;
          } else {
            corrected++;
          }
        }
      } catch (error) {
        console.error(`[DataConsistency] Erreur traitement livre ${progress.book_id}:`, error);
        errors++;
      }
    }

    console.log(`[DataConsistency] Terminé: ${corrected} corrections, ${errors} erreurs`);
    return { 
      success: true, 
      message: `${corrected} livres corrigés, ${errors} erreurs`,
      corrected,
      errors
    };

  } catch (error) {
    console.error('[DataConsistency] Erreur générale:', error);
    return { success: false, message: 'Erreur lors de la correction des données' };
  }
};

/**
 * Audit des incohérences pour un utilisateur
 */
export const auditUserReadingData = async (userId: string) => {
  if (!userId) return { inconsistencies: [], totalBooks: 0 };

  try {
    const { data: progressList, error } = await supabase
      .from('reading_progress')
      .select(`
        *,
        books (
          id,
          title,
          expected_segments,
          total_chapters
        )
      `)
      .eq('user_id', userId);

    if (error || !progressList) {
      console.error('[DataAudit] Erreur:', error);
      return { inconsistencies: [], totalBooks: 0 };
    }

    const inconsistencies = [];

    for (const progress of progressList) {
      const bookId = progress.book_id;
      const bookTitle = progress.books?.title || 'Titre inconnu';
      const expectedSegments = progress.books?.expected_segments || progress.books?.total_chapters || 1;
      
      const validatedSegments = await getValidatedSegmentCount(userId, bookId);
      
      let correctStatus: string;
      if (validatedSegments >= expectedSegments) {
        correctStatus = 'completed';
      } else if (validatedSegments > 0) {
        correctStatus = 'in_progress';
      } else {
        correctStatus = 'to_read';
      }

      if (progress.status !== correctStatus) {
        inconsistencies.push({
          bookId,
          bookTitle,
          currentStatus: progress.status,
          correctStatus,
          validatedSegments,
          expectedSegments
        });
      }
    }

    return { inconsistencies, totalBooks: progressList.length };
  } catch (error) {
    console.error('[DataAudit] Erreur générale:', error);
    return { inconsistencies: [], totalBooks: 0 };
  }
};
