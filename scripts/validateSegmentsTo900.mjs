import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
const envPath = join(__dirname, '..', '.env');
let SUPABASE_URL, SUPABASE_KEY;

try {
  const envContent = readFileSync(envPath, 'utf-8');
  const envVars = {};

  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=:#]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      // Remove quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      envVars[key] = value;
    }
  });

  SUPABASE_URL = envVars.VITE_SUPABASE_URL;
  SUPABASE_KEY = envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.VITE_SUPABASE_ANON_KEY || envVars.VITE_SUPABASE_PUBLISHABLE_KEY;
} catch (error) {
  console.error('❌ Erreur lecture .env:', error.message);
  process.exit(1);
}

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Variables manquantes dans .env');
  console.error('VITE_SUPABASE_URL:', SUPABASE_URL ? '✓' : '✗');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_KEY ? '✓' : '✗');
  process.exit(1);
}

const USER_ID = '6d0037db-bcb5-41bf-9c1b-67f6f7d2ae57';
const BOOK_ID = '42828542-4265-4055-8beb-2780a0ca4656';
const TARGET_PAGE = 900;
const PAGES_PER_SEGMENT = 50;
const XP_PER_VALIDATION = 10;

// Helper for Supabase REST API calls
async function supabaseRequest(table, options = {}) {
  const { method = 'GET', body, query = '', select = '*', single = false } = options;

  const url = `${SUPABASE_URL}/rest/v1/${table}${query}`;
  const headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': single ? 'return=representation,count=exact' : 'return=representation'
  };

  if (single) {
    headers['Accept'] = 'application/vnd.pgrst.object+json';
  }

  const fetchOptions = { method, headers };
  if (body) {
    fetchOptions.body = JSON.stringify(body);
  }

  const response = await fetch(url, fetchOptions);
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${JSON.stringify(data)}`);
  }

  return data;
}

async function validateSegmentsToPage900() {
  try {
    console.log('🚀 Début de la validation des segments...\n');

    // ÉTAPE 1: Récupérer les infos du livre
    console.log('📖 Récupération des informations du livre...');
    const book = await supabaseRequest('books_public', {
      query: `?id=eq.${BOOK_ID}&select=id,title,total_pages`,
      single: true
    });

    if (!book) {
      throw new Error('Livre non trouvé');
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
      try {
        const existing = await supabaseRequest('reading_validations', {
          query: `?user_id=eq.${USER_ID}&book_id=eq.${BOOK_ID}&segment=eq.${segment}&select=id`,
          single: true
        });

        if (existing) {
          console.log(`   ○ Segment ${segment} déjà validé`);
          existingValidations++;
          continue;
        }
      } catch (e) {
        // Not found is ok
      }

      // Récupérer une question pour ce segment
      let questionId = null;
      try {
        const question = await supabaseRequest('reading_questions', {
          query: `?book_id=eq.${BOOK_ID}&segment=eq.${segment}&select=id&limit=1`,
          single: true
        });
        questionId = question?.id;
      } catch (e) {
        console.log(`   ⚠️  Pas de question pour segment ${segment}`);
      }

      // Créer la validation
      const hoursAgo = segmentsToValidate - segment;
      const validatedAt = new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString();

      const validation = {
        user_id: USER_ID,
        book_id: BOOK_ID,
        segment: segment,
        validated_at: validatedAt,
        correct: true,
        used_joker: false,
      };

      if (questionId) {
        validation.question_id = questionId;
      }

      try {
        await supabaseRequest('reading_validations', {
          method: 'POST',
          body: validation
        });
        console.log(`   ✓ Segment ${segment} validé`);
        newValidations++;
      } catch (error) {
        console.error(`   ❌ Erreur segment ${segment}:`, error.message);
      }
    }

    console.log(`\n✅ ${newValidations} nouvelles validations créées`);
    console.log(`   ${existingValidations} validations existantes\n`);

    // ÉTAPE 4: Mettre à jour reading_progress
    console.log('📊 Mise à jour de reading_progress...');
    const status = TARGET_PAGE >= book.total_pages ? 'completed' : 'reading';

    try {
      // First try to update
      await supabaseRequest('reading_progress', {
        method: 'PATCH',
        query: `?user_id=eq.${USER_ID}&book_id=eq.${BOOK_ID}`,
        body: {
          current_page: TARGET_PAGE,
          status: status,
          updated_at: new Date().toISOString(),
        }
      });
    } catch (e) {
      // If not exists, insert
      await supabaseRequest('reading_progress', {
        method: 'POST',
        body: {
          user_id: USER_ID,
          book_id: BOOK_ID,
          current_page: TARGET_PAGE,
          status: status,
          updated_at: new Date().toISOString(),
        }
      });
    }
    console.log(`   ✓ Page mise à jour: ${TARGET_PAGE}\n`);

    // ÉTAPE 5: Attribuer l'XP
    if (newValidations > 0) {
      console.log('⭐ Attribution de l\'XP...');
      const totalXP = newValidations * XP_PER_VALIDATION;

      // Récupérer l'XP actuel
      let currentXP = 0;
      try {
        const currentLevel = await supabaseRequest('user_levels', {
          query: `?user_id=eq.${USER_ID}&select=xp`,
          single: true
        });
        currentXP = currentLevel?.xp || 0;
      } catch (e) {
        // User level doesn't exist yet
      }

      const newXP = currentXP + totalXP;

      try {
        // Try update first
        await supabaseRequest('user_levels', {
          method: 'PATCH',
          query: `?user_id=eq.${USER_ID}`,
          body: {
            xp: newXP,
            updated_at: new Date().toISOString(),
          }
        });
      } catch (e) {
        // If not exists, insert
        await supabaseRequest('user_levels', {
          method: 'POST',
          body: {
            user_id: USER_ID,
            xp: newXP,
            updated_at: new Date().toISOString(),
          }
        });
      }

      console.log(`   ✓ ${totalXP} XP attribué (${newValidations} segments × ${XP_PER_VALIDATION} XP)`);
      console.log(`   Total XP: ${currentXP} → ${newXP}\n`);
    }

    // ÉTAPE 6: Vérification finale
    console.log('🔍 Vérification finale...');

    const validations = await supabaseRequest('reading_validations', {
      query: `?user_id=eq.${USER_ID}&book_id=eq.${BOOK_ID}&select=segment&order=segment.desc`
    });

    let progress;
    try {
      progress = await supabaseRequest('reading_progress', {
        query: `?user_id=eq.${USER_ID}&book_id=eq.${BOOK_ID}&select=current_page,status`,
        single: true
      });
    } catch (e) {}

    let level;
    try {
      level = await supabaseRequest('user_levels', {
        query: `?user_id=eq.${USER_ID}&select=xp`,
        single: true
      });
    } catch (e) {}

    console.log(`   Validations totales: ${validations?.length || 0}`);
    console.log(`   Dernier segment validé: ${validations?.[0]?.segment || 0}`);
    console.log(`   Page actuelle: ${progress?.current_page || 0}`);
    console.log(`   Statut: ${progress?.status || 'unknown'}`);
    console.log(`   XP total: ${level?.xp || 0}\n`);

    console.log('🎉 TERMINÉ! Utilisateur avancé à la page 900\n');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Execute
validateSegmentsToPage900();
