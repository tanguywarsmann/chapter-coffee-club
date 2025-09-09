/**
 * Joker Constraints - Configuration et logique des contraintes joker
 * FEATURE FLAG MODE: Contrainte "≥ 3 segments" avec déploiement en phases
 */

// Configuration par défaut (peut être overridée par variables d'environnement)
export const JOKER_MIN_SEGMENTS_DEFAULT = 3;

// Feature flag pour activer la nouvelle contrainte (UI gating)
export const JOKER_MIN_SEGMENTS_ENABLED = 
  import.meta.env.VITE_JOKER_MIN_SEGMENTS_ENABLED === 'true';

// Valeur minimum de segments (configurable via env)
export const JOKER_MIN_SEGMENTS = Number(import.meta.env.VITE_JOKER_MIN_SEGMENTS ?? JOKER_MIN_SEGMENTS_DEFAULT);

// Debug mode pour logs non intrusifs
export const JOKER_DEBUG_ENABLED = 
  import.meta.env.VITE_DEBUG_JOKER === '1' || import.meta.env.VITE_DEBUG_JOKER === 'true';

/**
 * Fonction de log debug non intrusive
 */
export function debugLog(message: string, data?: any) {
  if (JOKER_DEBUG_ENABLED) {
    console.debug(`[JOKER DEBUG] ${message}`, data || '');
  }
}

/**
 * NOUVELLE LOGIQUE: Vérifie si les jokers peuvent être utilisés
 * Prend en compte le feature flag pour l'activation progressive
 */
export function canUseJokers(expectedSegments: number = 0): boolean {
  if (!Number.isFinite(expectedSegments)) return false;
  if (!JOKER_MIN_SEGMENTS_ENABLED) return true; // soft-launch UI gating
  
  const canUse = expectedSegments >= JOKER_MIN_SEGMENTS;
  
  debugLog(`canUseJokers check: ${expectedSegments} segments >= ${JOKER_MIN_SEGMENTS}`, {
    expectedSegments,
    minRequired: JOKER_MIN_SEGMENTS,
    canUse,
    enabled: JOKER_MIN_SEGMENTS_ENABLED
  });
  
  return canUse;
}

/**
 * NOUVELLE LOGIQUE: Calcul des jokers autorisés avec contrainte minimum
 * Remplace la logique existante avec support du feature flag
 */
export function calculateJokersAllowed(expectedSegments: number = 0): number {
  // Si la contrainte est activée et non respectée → 0
  if (JOKER_MIN_SEGMENTS_ENABLED && expectedSegments < JOKER_MIN_SEGMENTS) {
    debugLog(`Jokers blocked by constraint: ${expectedSegments} < ${JOKER_MIN_SEGMENTS}`);
    return 0;
  }
  
  // Logique existante (inchangée)
  const allowed = Math.floor((expectedSegments || 0) / 10) + 1;
  
  debugLog(`calculateJokersAllowed result`, {
    expectedSegments,
    calculated: allowed,
    constraintEnabled: JOKER_MIN_SEGMENTS_ENABLED,
    constraintActive: JOKER_MIN_SEGMENTS_ENABLED && expectedSegments < JOKER_MIN_SEGMENTS
  });
  
  return allowed;
}

/**
 * Helper pour obtenir le message d'erreur approprié
 */
export function getJokerDisabledMessage(expectedSegments: number = 0): string {
  if (JOKER_MIN_SEGMENTS_ENABLED && expectedSegments < JOKER_MIN_SEGMENTS) {
    return `Les jokers sont disponibles à partir de ${JOKER_MIN_SEGMENTS} segments.`;
  }
  return '';
}

/**
 * LOGIQUE EXISTANTE: Maintien pour compatibilité  
 * Cette fonction reproduit exactement la logique actuelle
 */
export function calculateJokersAllowedLegacy(expectedSegments: number): number {
  const allowed = Math.floor(expectedSegments / 10) + 1;
  
  debugLog(`calculateJokersAllowedLegacy (current logic)`, {
    expectedSegments,
    allowed,
    formula: 'Math.floor(expectedSegments / 10) + 1'
  });
  
  return allowed;
}


/**
 * Audit helper: Log de l'état actuel d'un livre concernant les jokers
 */
export function auditJokerState(bookId: string, expectedSegments: number, context: string) {
  if (!JOKER_DEBUG_ENABLED) return;
  
  const currentAllowed = calculateJokersAllowedLegacy(expectedSegments);
  const newAllowed = calculateJokersAllowed(expectedSegments);
  const wouldBeBlocked = JOKER_MIN_SEGMENTS_ENABLED && !canUseJokers(expectedSegments);
  
  console.debug(`[JOKER AUDIT] ${context}`, {
    bookId,
    expectedSegments,
    currentLogic: {
      jokersAllowed: currentAllowed,
      formula: 'Math.floor(segments / 10) + 1'
    },
    newLogic: {
      jokersAllowed: newAllowed,
      wouldBeBlocked,
      reason: wouldBeBlocked ? `< ${JOKER_MIN_SEGMENTS} segments` : 'allowed'
    },
    flags: {
      debugEnabled: JOKER_DEBUG_ENABLED,
      constraintEnabled: JOKER_MIN_SEGMENTS_ENABLED,
      minSegments: JOKER_MIN_SEGMENTS
    }
  });
}