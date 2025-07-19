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

function randomRecentDate(): Date {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 7); // 0-6 jours
  const hoursAgo = Math.floor(Math.random() * 14) + 9; // 9h-22h
  const minutesAgo = Math.floor(Math.random() * 60);
  
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hoursAgo, minutesAgo, 0, 0);
  return date;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function distributeBooks(books: Book[], profiles: Profile[]): Map<string, Book[]> {
  const distribution = new Map<string, Book[]>();
  const bookUsageCount = new Map<string, number>();
  
  // Initialiser le compteur d'usage des livres
  books.forEach(book => bookUsageCount.set(book.id, 0));
  
  // Catégoriser les livres par longueur
  const shortBooks = books.filter(b => b.total_pages <= 150);
  const mediumBooks = books.filter(b => b.total_pages > 150 && b.total_pages <= 400);
  const longBooks = books.filter(b => b.total_pages > 400);
  
  // Assigner des livres à chaque profil
  profiles.forEach((profile, index) => {
    const profileBooks: Book[] = [];
    const booksCount = randomInt(1, 3); // 1 à 3 livres par profil
    
    // Stratégie de répartition : certains profils préfèrent les livres courts/longs
    const preference = index % 3; // 0: varié, 1: courts, 2: longs
    
    for (let i = 0; i < booksCount; i++) {
      let candidateBooks: Book[] = [];
      
      if (preference === 1 && shortBooks.length > 0) {
        candidateBooks = shortBooks;
      } else if (preference === 2 && longBooks.length > 0) {
        candidateBooks = longBooks;
      } else {
        candidateBooks = books;
      }
      
      // Filtrer les livres disponibles (max 3 usages)
      const availableBooks = candidateBooks.filter(book => 
        (bookUsageCount.get(book.id) || 0) < 3 && 
        !profileBooks.some(pb => pb.id === book.id)
      );
      
      if (availableBooks.length > 0) {
        const selectedBook = availableBooks[Math.floor(Math.random() * availableBooks.length)];
        profileBooks.push(selectedBook);
        bookUsageCount.set(selectedBook.id, (bookUsageCount.get(selectedBook.id) || 0) + 1);
      }
    }
    
    distribution.set(profile.id, profileBooks);
  });
  
  return distribution;
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

  // Distribuer intelligemment les livres
  console.log('📊 Répartition intelligente des livres...');
  const bookDistribution = distributeBooks(books as Book[], profiles as Profile[]);
  
  // Créer un pool de validations récentes pour étaler les timestamps
  const allValidationTimes: Date[] = [];
  
  // Générer les données pour chaque profil
  for (const profile of profiles as Profile[]) {
    console.log(`\n👤 Génération pour ${profile.username}...`);
    
    const assignedBooks = bookDistribution.get(profile.id) || [];
    
    if (assignedBooks.length === 0) {
      console.log(`  ⚠️ Aucun livre assigné à ${profile.username}`);
      continue;
    }
    
    for (const book of assignedBooks) {
      const readingId = uuidv4();
      
      // Timestamps réalistes : lecture terminée dans les 7 derniers jours
      const updatedAt = randomRecentDate();
      const readingDuration = randomInt(3, 21); // 3 à 21 jours de lecture
      const startedAt = new Date(updatedAt);
      startedAt.setDate(startedAt.getDate() - readingDuration);
      
      // Streaks aléatoires
      const streakCurrent = randomInt(1, 7);
      const streakBest = Math.max(streakCurrent, randomInt(1, 15));
      
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
      
      // Générer les validations avec timestamps étalés
      const validationsCount = Math.min(
        randomInt(2, Math.min(6, book.expected_segments || 4)), 
        book.expected_segments || 4
      );
      
      for (let segment = 1; segment <= validationsCount; segment++) {
        // Générer une date de validation récente et crédible
        const validatedAt = randomRecentDate();
        allValidationTimes.push(validatedAt);
        
        const validation: ReadingValidation = {
          id: uuidv4(),
          user_id: profile.id,
          book_id: book.id,
          segment: segment,
          question_id: null,
          answer: null,
          correct: true,
          validated_at: validatedAt.toISOString(),
          used_joker: Math.random() < 0.05, // 5% de chance d'utiliser un joker
          progress_id: readingId
        };
        
        readingValidationsData.push(validation);
      }
      
      console.log(`  📖 ${book.title} (${book.total_pages}p) - ${validationsCount} validations`);
    }
    
    console.log(`  ✅ ${assignedBooks.length} lectures générées pour ${profile.username}`);
  }
  
  // Mélanger les validations pour éviter les patterns temporels
  const shuffledValidations = shuffleArray(readingValidationsData);
  
  console.log('\n📈 Statistiques de répartition:');
  const bookCounts = new Map<string, number>();
  readingProgressData.forEach(rp => {
    const count = bookCounts.get(rp.book_id) || 0;
    bookCounts.set(rp.book_id, count + 1);
  });
  
  const maxUsage = Math.max(...Array.from(bookCounts.values()));
  console.log(`📚 Livre le plus lu: ${maxUsage} fois (limite: 3)`);
  console.log(`👥 Profils avec lectures: ${bookDistribution.size}/${profiles.length}`);
  console.log(`⏰ Validations étalées sur 7 jours avec horaires 9h-22h`);

  // Injecter directement dans Supabase
  console.log('\n💾 Injection des données dans Supabase...');
  
  // Injecter les lectures de progression
  console.log(`📖 Injection de ${readingProgressData.length} lectures...`);
  const { error: progressError } = await supabase
    .from('reading_progress')
    .insert(readingProgressData);
  
  if (progressError) {
    console.error('❌ Erreur lors de l\'injection des lectures:', progressError);
    return;
  }
  
  console.log('✅ Lectures injectées avec succès');
  
  // Injecter les validations (mélangées pour diversifier les timestamps)
  console.log(`✅ Injection de ${shuffledValidations.length} validations...`);
  const { error: validationsError } = await supabase
    .from('reading_validations')
    .insert(shuffledValidations);
  
  if (validationsError) {
    console.error('❌ Erreur lors de l\'injection des validations:', validationsError);
    return;
  }
  
  console.log('✅ Validations injectées avec succès');
  
  console.log('\n📊 Résumé:');
  console.log(`📖 ${readingProgressData.length} lectures complètes injectées`);
  console.log(`✅ ${readingValidationsData.length} validations injectées`);
  console.log('🎯 Injection terminée ✔️');
  console.log('\n🔍 Vous pouvez maintenant vérifier la page /discover dans l\'application');
}

// Exécuter le script
generateReadingData().catch((error) => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});