/**
 * Joker Audit Utilities - Helpers pour l'audit des jokers
 * AUDIT MODE: Fonctions temporaires pour collecter des données
 */

import { supabase } from "@/integrations/supabase/client";
import { debugLog, JOKER_DEBUG_ENABLED } from "./jokerConstraints";

export interface JokerAuditData {
  bookId: string;
  expectedSegments: number;
  currentJokersAllowed: number;
  currentJokersUsed: number;
  currentJokersRemaining: number;
  wouldBeBlockedByNewRule: boolean;
  timestamp: string;
  context: string;
}

// Collecteur temporaire de données d'audit
const auditDataCollector: JokerAuditData[] = [];

/**
 * Collecte des données pour l'audit (temporaire, non intrusif)
 */
export function collectJokerAuditData(data: Omit<JokerAuditData, 'timestamp'>) {
  if (!JOKER_DEBUG_ENABLED) return;
  
  const auditEntry: JokerAuditData = {
    ...data,
    timestamp: new Date().toISOString()
  };
  
  auditDataCollector.push(auditEntry);
  
  // Garder seulement les 100 dernières entrées pour éviter l'accumulation
  if (auditDataCollector.length > 100) {
    auditDataCollector.shift();
  }
  
  debugLog(`Audit data collected for ${data.context}`, auditEntry);
}

/**
 * Récupère les données d'audit collectées
 */
export function getCollectedAuditData(): JokerAuditData[] {
  return [...auditDataCollector];
}

/**
 * Export des données d'audit au format CSV (pour analyse)
 */
export function exportAuditDataAsCSV(): string {
  const headers = [
    'Timestamp',
    'Context', 
    'BookId',
    'ExpectedSegments',
    'CurrentJokersAllowed',
    'CurrentJokersUsed', 
    'CurrentJokersRemaining',
    'WouldBeBlocked'
  ];
  
  const rows = auditDataCollector.map(data => [
    data.timestamp,
    data.context,
    data.bookId,
    data.expectedSegments,
    data.currentJokersAllowed,
    data.currentJokersUsed,
    data.currentJokersRemaining,
    data.wouldBeBlockedByNewRule
  ]);
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
  
  return csvContent;
}

/**
 * Analyse des livres affectés par la nouvelle règle
 */
export async function analyzeAffectedBooks(): Promise<{
  totalBooks: number;
  booksUnder3Segments: number;
  booksAffected: Array<{
    id: string;
    title: string;
    expectedSegments: number;
    currentJokersAllowed: number;
  }>;
}> {
  try {
    const { data: books, error } = await supabase
      .from('books_public')
      .select('id, title, expected_segments')
      .not('expected_segments', 'is', null);
      
    if (error) {
      console.error('Error analyzing books:', error);
      return { totalBooks: 0, booksUnder3Segments: 0, booksAffected: [] };
    }
    
    const booksUnder3 = books.filter(book => 
      book.expected_segments !== null && book.expected_segments < 3
    );
    
    const booksAffected = booksUnder3.map(book => ({
      id: book.id,
      title: book.title,
      expectedSegments: book.expected_segments || 0,
      currentJokersAllowed: Math.floor((book.expected_segments || 0) / 10) + 1
    }));
    
    const analysis = {
      totalBooks: books.length,
      booksUnder3Segments: booksUnder3.length,
      booksAffected
    };
    
    debugLog('Books analysis completed', analysis);
    
    return analysis;
  } catch (error) {
    console.error('Exception in analyzeAffectedBooks:', error);
    return { totalBooks: 0, booksUnder3Segments: 0, booksAffected: [] };
  }
}

/**
 * Test des 3 scénarios d'audit: 2, 3, et 10 segments
 */
export function testAuditScenarios() {
  if (!JOKER_DEBUG_ENABLED) {
    console.log('Debug mode disabled. Enable with VITE_DEBUG_JOKER=1');
    return;
  }
  
  const scenarios = [
    { name: 'Livre A', segments: 2, expected: 'Should be blocked by new rule' },
    { name: 'Livre B', segments: 3, expected: 'Should work normally' },
    { name: 'Livre C', segments: 10, expected: 'Should work normally' }
  ];
  
  scenarios.forEach(scenario => {
    const currentAllowed = Math.floor(scenario.segments / 10) + 1;
    const wouldBeBlocked = scenario.segments < 3;
    
    console.group(`[JOKER AUDIT SCENARIO] ${scenario.name} (${scenario.segments} segments)`);
    console.log('Current behavior:', {
      jokersAllowed: currentAllowed,
      calculation: `Math.floor(${scenario.segments} / 10) + 1 = ${currentAllowed}`
    });
    console.log('New rule impact:', {
      wouldBeBlocked,
      newJokersAllowed: wouldBeBlocked ? 0 : currentAllowed,
      reason: wouldBeBlocked ? 'Less than 3 segments' : 'Meets minimum requirement'
    });
    console.log('Expected:', scenario.expected);
    console.groupEnd();
  });
}

/**
 * Validation de l'intégrité des données expected_segments
 */
export async function validateExpectedSegmentsIntegrity(): Promise<{
  totalBooks: number;
  nullSegments: number;
  zeroSegments: number;
  negativeSegments: number;
  validSegments: number;
  issues: Array<{ id: string; title: string; issue: string; value: any }>;
}> {
  try {
    const { data: books, error } = await supabase
      .from('books_public')
      .select('id, title, expected_segments');
      
    if (error) {
      console.error('Error validating segments integrity:', error);
      return { 
        totalBooks: 0, nullSegments: 0, zeroSegments: 0, 
        negativeSegments: 0, validSegments: 0, issues: [] 
      };
    }
    
    const issues: Array<{ id: string; title: string; issue: string; value: any }> = [];
    let nullSegments = 0;
    let zeroSegments = 0;
    let negativeSegments = 0;
    let validSegments = 0;
    
    books.forEach(book => {
      if (book.expected_segments === null || book.expected_segments === undefined) {
        nullSegments++;
        issues.push({
          id: book.id,
          title: book.title,
          issue: 'NULL expected_segments',
          value: book.expected_segments
        });
      } else if (book.expected_segments === 0) {
        zeroSegments++;
        issues.push({
          id: book.id,
          title: book.title,
          issue: 'Zero expected_segments',
          value: book.expected_segments
        });
      } else if (book.expected_segments < 0) {
        negativeSegments++;
        issues.push({
          id: book.id,
          title: book.title,
          issue: 'Negative expected_segments',
          value: book.expected_segments
        });
      } else {
        validSegments++;
      }
    });
    
    const result = {
      totalBooks: books.length,
      nullSegments,
      zeroSegments,
      negativeSegments,
      validSegments,
      issues
    };
    
    debugLog('Expected segments integrity validation completed', result);
    
    return result;
  } catch (error) {
    console.error('Exception in validateExpectedSegmentsIntegrity:', error);
    return { 
      totalBooks: 0, nullSegments: 0, zeroSegments: 0, 
      negativeSegments: 0, validSegments: 0, issues: [] 
    };
  }
}

/**
 * Helper pour exposer les fonctions d'audit dans la console (dev mode)
 */
export function exposeAuditHelpers() {
  if (typeof window !== 'undefined' && JOKER_DEBUG_ENABLED) {
    (window as any).jokerAudit = {
      testScenarios: testAuditScenarios,
      analyzeBooks: analyzeAffectedBooks,
      validateIntegrity: validateExpectedSegmentsIntegrity,
      exportCSV: exportAuditDataAsCSV,
      getCollectedData: getCollectedAuditData
    };
    
    console.log(
      '%c[JOKER AUDIT] Helpers exposed on window.jokerAudit',
      'color: #orange; font-weight: bold;'
    );
    console.log('Available functions:');
    console.log('- window.jokerAudit.testScenarios()');
    console.log('- window.jokerAudit.analyzeBooks()');
    console.log('- window.jokerAudit.validateIntegrity()');
    console.log('- window.jokerAudit.exportCSV()');
  }
}