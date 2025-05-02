
import { supabase } from "@/integrations/supabase/client";

interface BookWithMissingSegments {
  id: string;
  title: string;
  missingSegments: number[];
  expectedSegments: number;
  availableQuestions: number;
}

export const generateCsvExport = async () => {
  try {
    // Récupérer tous les livres
    const { data: booksData, error: booksError } = await supabase
      .from('books')
      .select('id, title, slug, total_pages');
    
    if (booksError) throw booksError;
    
    // Récupérer toutes les questions
    const { data: questionsData, error: questionsError } = await supabase
      .from('reading_questions')
      .select('book_slug, segment');
    
    if (questionsError) throw questionsError;
    
    // Transformer les données pour l'export
    const booksWithMissingSegments: BookWithMissingSegments[] = [];
    
    booksData.forEach(book => {
      const totalPages = book.total_pages || 0;
      const expectedSegments = Math.ceil(totalPages / 30);
      
      // Récupérer les segments qui ont des questions pour ce livre
      const bookQuestions = questionsData.filter(q => q.book_slug === book.slug);
      const segments = bookQuestions.map(q => q.segment);
      const uniqueSegments = [...new Set(segments)];
      
      // Calculer les segments manquants
      const missingSegments = [];
      for (let i = 0; i < expectedSegments; i++) {
        if (!uniqueSegments.includes(i)) {
          missingSegments.push(i);
        }
      }
      
      // N'inclure que les livres avec des segments manquants
      if (missingSegments.length > 0) {
        booksWithMissingSegments.push({
          id: book.id,
          title: book.title,
          missingSegments: missingSegments,
          expectedSegments: expectedSegments,
          availableQuestions: uniqueSegments.length
        });
      }
    });
    
    // Si aucun livre n'a de segments manquants, retourner un message
    if (booksWithMissingSegments.length === 0) {
      throw new Error("Aucun livre avec des segments manquants n'a été trouvé.");
    }
    
    // Créer les lignes CSV
    // En-tête
    let csvContent = "book_id,titre,segment_manquant,questions_existantes,segments_attendus\n";
    
    // Données
    booksWithMissingSegments.forEach(book => {
      book.missingSegments.forEach(segment => {
        csvContent += `"${book.id}","${book.title.replace(/"/g, '""')}",${segment},${book.availableQuestions},${book.expectedSegments}\n`;
      });
    });
    
    // Créer un blob et déclencher le téléchargement
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    // Préparer le nom de fichier avec la date
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    
    link.setAttribute('href', url);
    link.setAttribute('download', `segments-manquants-${dateStr}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return true;
  } catch (error) {
    console.error("Erreur lors de la génération du CSV:", error);
    throw error;
  }
};
