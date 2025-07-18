/**
 * Génère des lectures complètes et validations pour les 30 comptes factices
 * npx ts-node -r dotenv/config scripts/generateReadingProgress.ts
 */
import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes: NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(
  supabaseUrl,
  supabaseServiceKey,
  { 
    auth: { 
      autoRefreshToken: false, 
      persistSession: false 
    } 
  }
);

// Profils ciblés (les 30 comptes factices)
const targetUsernames = [
  'mdussommier', 'emarotte', 'selaidi', 'jlbouritte', 'nvanschou',
  'lgriselin', 'ibhsalah', 'okervern', 'fmontavon', 'aboutetlebon',
  'croussange', 'yabouzeid', 'glegleuher', 'aprevostgrall', 'mdesrousseaux',
  'velguea', 'izaidi', 'aportelance', 'sdubuisson', 'mchenot',
  'ksoret', 'lbenkacem', 'rostermann', 'tchevrot', 'tnguyenba',
  'sbelloc', 'jmontassier', 'ybensoussan', 'mreversat', 'fcaradec'
];

interface Profile {
  id: string;
  username: string;
  created_at: string;
}

interface Book {
  id: string;
  title: string;
  author: string;
  total_pages: number;
  expected_segments: number;
}

interface ReadingProgress {
  id: string;
  user_id: string;
  book_id: string;
  current_page: number;
  total_pages: number;
  status: string;
  started_at: string;
  updated_at: string;
  streak_current: number;
  streak_best: number;
}

interface ReadingValidation {
  id: string;
  user_id: string;
  book_id: string;
  segment: number;
  question_id: string | null;
  answer: string | null;
  correct: boolean;
  validated_at: string;
  used_joker: boolean;
  progress_id: string;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

async function generateReadingData() {
  console.log('🚀 Début de la génération des données de lecture...');

  // Récupérer les profils cibles
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, username, created_at')
    .in('username', targetUsernames);

  if (profilesError) {
    console.error('❌ Erreur lors de la récupération des profils:', profilesError);
    return;
  }

  if (!profiles || profiles.length === 0) {
    console.error('❌ Aucun profil trouvé');
    return;
  }

  console.log(`📋 ${profiles.length} profils trouvés`);

  // Récupérer les livres disponibles
  const { data: books, error: booksError } = await supabase
    .from('books')
    .select('id, title, author, total_pages, expected_segments')
    .eq('is_published', true)
    .not('expected_segments', 'is', null);

  if (booksError) {
    console.error('❌ Erreur lors de la récupération des livres:', booksError);
    return;
  }

  if (!books || books.length === 0) {
    console.error('❌ Aucun livre trouvé');
    return;
  }

  console.log(`📚 ${books.length} livres disponibles`);

  const readingProgressData: ReadingProgress[] = [];
  const readingValidationsData: ReadingValidation[] = [];

  // Générer les données pour chaque profil
  for (const profile of profiles as Profile[]) {
    console.log(`\n👤 Génération pour ${profile.username}...`);
    
    const profileCreatedAt = new Date(profile.created_at);
    const booksCount = randomInt(1, 4); // 1 à 4 livres par utilisateur
    const shuffledBooks = shuffleArray(books as Book[]).slice(0, booksCount);
    
    for (let i = 0; i < booksCount; i++) {
      const book = shuffledBooks[i];
      const readingId = uuidv4();
      
      // Dates cohérentes
      const minStartDate = profileCreatedAt;
      const maxStartDate = addDays(profileCreatedAt, 30); // Jusqu'à 30 jours après création
      const startedAt = randomDate(minStartDate, maxStartDate);
      const readingDuration = randomInt(3, 15); // 3 à 15 jours de lecture
      const updatedAt = addDays(startedAt, readingDuration);
      
      // Streaks aléatoires
      const streakCurrent = randomInt(1, 7);
      const streakBest = Math.max(streakCurrent, randomInt(1, 10));
      
      // Créer la lecture complète
      const readingProgress: ReadingProgress = {
        id: readingId,
        user_id: profile.id,
        book_id: book.id,
        current_page: book.total_pages,
        total_pages: book.total_pages,
        status: 'completed',
        started_at: startedAt.toISOString(),
        updated_at: updatedAt.toISOString(),
        streak_current: streakCurrent,
        streak_best: streakBest
      };
      
      readingProgressData.push(readingProgress);
      
      // Générer les validations (1 à 4 segments)
      const validationsCount = Math.min(randomInt(1, 4), book.expected_segments || 4);
      
      for (let segment = 1; segment <= validationsCount; segment++) {
        const validatedAt = randomDate(startedAt, updatedAt);
        
        const validation: ReadingValidation = {
          id: uuidv4(),
          user_id: profile.id,
          book_id: book.id,
          segment: segment,
          question_id: null, // Pas de mapping spécifique
          answer: null,
          correct: true,
          validated_at: validatedAt.toISOString(),
          used_joker: false,
          progress_id: readingId
        };
        
        readingValidationsData.push(validation);
      }
      
      console.log(`  📖 ${book.title} - ${validationsCount} validations`);
    }
    
    console.log(`  ✅ ${booksCount} lectures générées pour ${profile.username}`);
  }

  // Convertir en CSV
  console.log('\n📝 Génération des fichiers CSV...');
  
  // CSV Reading Progress
  const progressHeaders = [
    'id', 'user_id', 'book_id', 'current_page', 'total_pages', 
    'status', 'started_at', 'updated_at', 'streak_current', 'streak_best'
  ];
  
  const progressCsv = [
    progressHeaders.join(','),
    ...readingProgressData.map(row => [
      row.id,
      row.user_id,
      row.book_id,
      row.current_page,
      row.total_pages,
      row.status,
      row.started_at,
      row.updated_at,
      row.streak_current,
      row.streak_best
    ].join(','))
  ].join('\n');
  
  // CSV Reading Validations
  const validationsHeaders = [
    'id', 'user_id', 'book_id', 'segment', 'question_id', 'answer',
    'correct', 'validated_at', 'used_joker', 'progress_id'
  ];
  
  const validationsCsv = [
    validationsHeaders.join(','),
    ...readingValidationsData.map(row => [
      row.id,
      row.user_id,
      row.book_id,
      row.segment,
      row.question_id || '',
      row.answer || '',
      row.correct,
      row.validated_at,
      row.used_joker,
      row.progress_id
    ].join(','))
  ].join('\n');
  
  // Écrire les fichiers
  writeFileSync('reading_progress_rows.csv', progressCsv);
  writeFileSync('reading_validations_rows.csv', validationsCsv);
  
  console.log('\n📊 Résumé:');
  console.log(`📖 ${readingProgressData.length} lectures complètes générées`);
  console.log(`✅ ${readingValidationsData.length} validations générées`);
  console.log(`📄 Fichiers créés:`);
  console.log(`   - reading_progress_rows.csv`);
  console.log(`   - reading_validations_rows.csv`);
  console.log('🎯 Terminé ✔️');
}

// Exécuter le script
generateReadingData().catch((error) => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});