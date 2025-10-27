/**
 * Script pour avancer manuellement un utilisateur dans un livre
 * Usage: npm run tsx scripts/updateUserProgress.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Charger les variables d'environnement
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateUserProgress(
  userId: string,
  bookId: string,
  targetPage: number
) {
  console.log('\n📚 Mise à jour de la progression...');
  console.log(`User ID: ${userId}`);
  console.log(`Book ID: ${bookId}`);
  console.log(`Target page: ${targetPage}`);

  try {
    // 1. Vérifier que le livre existe et obtenir le total de pages
    const { data: book, error: bookError } = await supabase
      .from('books_public')
      .select('id, slug, title, total_pages')
      .eq('id', bookId)
      .single();

    if (bookError || !book) {
      console.error('❌ Livre non trouvé:', bookError?.message);
      return;
    }

    console.log(`\n📖 Livre trouvé: "${book.title}"`);
    console.log(`   Total pages: ${book.total_pages}`);

    if (targetPage > book.total_pages) {
      console.warn(`⚠️  Page cible (${targetPage}) > total pages (${book.total_pages})`);
    }

    // 2. Vérifier si une progression existe déjà
    const { data: existingProgress } = await supabase
      .from('reading_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('book_id', bookId)
      .maybeSingle();

    if (existingProgress) {
      console.log(`\n✓ Progression existante trouvée`);
      console.log(`  Page actuelle: ${existingProgress.current_page}`);

      // Mettre à jour la progression existante
      const { data: updated, error: updateError } = await supabase
        .from('reading_progress')
        .update({
          current_page: targetPage,
          status: targetPage >= book.total_pages ? 'completed' : 'reading',
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('book_id', bookId)
        .select()
        .single();

      if (updateError) {
        console.error('❌ Erreur lors de la mise à jour:', updateError.message);
        return;
      }

      console.log(`\n✅ Progression mise à jour avec succès!`);
      console.log(`   Nouvelle page: ${updated.current_page}`);
      console.log(`   Statut: ${updated.status}`);

    } else {
      console.log(`\n⚠️  Aucune progression existante`);
      console.log(`   Création d'une nouvelle progression...`);

      // Créer une nouvelle progression
      const { data: created, error: createError } = await supabase
        .from('reading_progress')
        .insert({
          user_id: userId,
          book_id: bookId,
          current_page: targetPage,
          status: targetPage >= book.total_pages ? 'completed' : 'reading',
          started_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (createError) {
        console.error('❌ Erreur lors de la création:', createError.message);
        return;
      }

      console.log(`\n✅ Progression créée avec succès!`);
      console.log(`   Page: ${created.current_page}`);
      console.log(`   Statut: ${created.status}`);
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

// Paramètres
const USER_ID = '6d0037db-bcb5-41bf-9c1b-67f6f7d2ae57';
const BOOK_ID = '42828542-4265-4055-8beb-2780a0ca4656';
const TARGET_PAGE = 900;

updateUserProgress(USER_ID, BOOK_ID, TARGET_PAGE)
  .then(() => {
    console.log('\n✅ Script terminé\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erreur fatale:', error);
    process.exit(1);
  });
