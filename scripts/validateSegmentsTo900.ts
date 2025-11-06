import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '✗');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const USER_ID = '6d0037db-bcb5-41bf-9c1b-67f6f7d2ae57';
const BOOK_ID = '42828542-4265-4055-8beb-2780a0ca4656';
const TARGET_PAGE = 900;
const PAGES_PER_SEGMENT = 50;
const XP_PER_VALIDATION = 10;

async function validateSegmentsToPage900() {
  try {
    console.log('🚀 Début de la validation des segments...\n');

    // ÉTAPE 1: Récupérer les infos du livre
    console.log('📖 Récupération des informations du livre...');
    const { data: book, error: bookError } = await supabase
      .from('books_public')
      .select('id, title, total_pages')
      .eq('id', BOOK_ID)
      .single();

    if (bookError || !book) {
      throw new Error(`Livre non trouvé: ${bookError?.message || 'Unknown error'}`);
    }

    console.log(`   Livre: ${book.title}`);
    console.log(`   Total pages: ${book.total_pages}`);
    console.log(`   Page cible: ${TARGET_PAGE}\n`);

    // ÉTAPE 2: Calculer le nombre de segments à valider
    const segmentsToValidate = Math.ceil(TARGET_PAGE / PAGES_PER_SEGMENT);
    console.log(`   Segments à valider: ${segmentsToValidate}\n`);

    // ÉTAPE 3: Valider chaque segment
    console.log('⚙️  Validation des segments...');
    let newValidations = 0;
    let existingValidations = 0;

    for (let segment = 1; segment <= segmentsToValidate; segment++) {
      // Vérifier si déjà validé
      const { data: existing } = await supabase
        .from('reading_validations')
        .select('id')
        .eq('user_id', USER_ID)
        .eq('book_id', BOOK_ID)
        .eq('segment', segment)
        .maybeSingle();

      if (existing) {
        console.log(`   ○ Segment ${segment} déjà validé`);
        existingValidations++;
        continue;
      }

      // Récupérer une question pour ce segment
      const { data: question } = await supabase
        .from('reading_questions')
        .select('id')
        .eq('book_id', BOOK_ID)
        .eq('segment', segment)
        .limit(1)
        .maybeSingle();

      // Créer la validation
      const hoursAgo = segmentsToValidate - segment;
      const validatedAt = new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString();

      const validation: any = {
        user_id: USER_ID,
        book_id: BOOK_ID,
        segment: segment,
        validated_at: validatedAt,
        correct: true,
        used_joker: false,
      };

      if (question) {
        validation.question_id = question.id;
      } else {
        console.log(`   ⚠️  Pas de question pour segment ${segment}`);
      }

      const { error: insertError } = await supabase
        .from('reading_validations')
        .insert(validation);

      if (insertError) {
        console.error(`   ❌ Erreur segment ${segment}:`, insertError.message);
      } else {
        console.log(`   ✓ Segment ${segment} validé`);
        newValidations++;
      }
    }

    console.log(`\n✅ ${newValidations} nouvelles validations créées`);
    console.log(`   ${existingValidations} validations existantes\n`);

    // ÉTAPE 4: Mettre à jour reading_progress
    console.log('📊 Mise à jour de reading_progress...');
    const status = TARGET_PAGE >= book.total_pages ? 'completed' : 'reading';

    const { error: progressError } = await supabase
      .from('reading_progress')
      .upsert({
        user_id: USER_ID,
        book_id: BOOK_ID,
        current_page: TARGET_PAGE,
        status: status,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,book_id'
      });

    if (progressError) {
      console.error('❌ Erreur mise à jour progress:', progressError.message);
    } else {
      console.log(`   ✓ Page mise à jour: ${TARGET_PAGE}\n`);
    }

    // ÉTAPE 5: Attribuer l'XP
    if (newValidations > 0) {
      console.log('⭐ Attribution de l\'XP...');
      const totalXP = newValidations * XP_PER_VALIDATION;

      // Récupérer l'XP actuel
      const { data: currentLevel } = await supabase
        .from('user_levels')
        .select('xp')
        .eq('user_id', USER_ID)
        .maybeSingle();

      const currentXP = currentLevel?.xp || 0;
      const newXP = currentXP + totalXP;

      const { error: xpError } = await supabase
        .from('user_levels')
        .upsert({
          user_id: USER_ID,
          xp: newXP,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });

      if (xpError) {
        console.error('❌ Erreur attribution XP:', xpError.message);
      } else {
        console.log(`   ✓ ${totalXP} XP attribué (${newValidations} segments × ${XP_PER_VALIDATION} XP)`);
        console.log(`   Total XP: ${currentXP} → ${newXP}\n`);
      }
    }

    // ÉTAPE 6: Vérification finale
    console.log('🔍 Vérification finale...');

    const { data: validations } = await supabase
      .from('reading_validations')
      .select('segment')
      .eq('user_id', USER_ID)
      .eq('book_id', BOOK_ID)
      .order('segment', { ascending: false });

    const { data: progress } = await supabase
      .from('reading_progress')
      .select('current_page, status')
      .eq('user_id', USER_ID)
      .eq('book_id', BOOK_ID)
      .maybeSingle();

    const { data: level } = await supabase
      .from('user_levels')
      .select('xp')
      .eq('user_id', USER_ID)
      .maybeSingle();

    console.log(`   Validations totales: ${validations?.length || 0}`);
    console.log(`   Dernier segment validé: ${validations?.[0]?.segment || 0}`);
    console.log(`   Page actuelle: ${progress?.current_page || 0}`);
    console.log(`   Statut: ${progress?.status || 'unknown'}`);
    console.log(`   XP total: ${level?.xp || 0}\n`);

    console.log('🎉 TERMINÉ! Utilisateur avancé à la page 900\n');

  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

// Execute
validateSegmentsToPage900();
