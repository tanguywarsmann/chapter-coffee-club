// Configuration des 5 stades d'évolution de Booky
// Inspiré de la palette BRAND de CertificationDemo

export interface BookyStage {
  id: number;
  name: string;
  minReadingDays: number;
  description: string;
  evolutionMessage: string;
  // Visual identity
  gradient: {
    from: string;
    to: string;
  };
  glowColor: string;
  particleColor: string;
  // Avatar customization
  hasSparkles: boolean;
  hasGlasses: boolean;
  hasBook: boolean;
  hasCrown: boolean;
  hasMultipleTails: boolean;
}

// Brand colors - warm amber/brown palette (from CertificationDemo)
export const BOOKY_BRAND = {
  primary: 'hsl(25, 40%, 50%)',
  primaryDark: 'hsl(25, 40%, 40%)',
  primaryLight: 'hsl(25, 40%, 60%)',
  secondary: 'hsl(35, 30%, 82%)',
  dark: 'hsl(25, 40%, 18%)',
  darker: 'hsl(25, 40%, 12%)',
  light: 'hsl(35, 30%, 92%)',
  cream: 'hsl(30, 35%, 97%)',
  muted: 'hsl(25, 20%, 55%)',
  gold: 'hsl(45, 80%, 55%)',
  goldLight: 'hsl(45, 80%, 70%)',
  goldDark: 'hsl(45, 70%, 40%)',
};

export const BOOKY_STAGES: BookyStage[] = [
  {
    id: 1,
    name: "Œuf Mystère",
    minReadingDays: 0,
    description: "Un mystère attend d'éclore...",
    evolutionMessage: "",
    gradient: {
      from: 'hsl(35, 30%, 85%)',
      to: 'hsl(25, 30%, 75%)',
    },
    glowColor: 'hsl(35, 40%, 60%)',
    particleColor: 'hsl(35, 30%, 70%)',
    hasSparkles: false,
    hasGlasses: false,
    hasBook: false,
    hasCrown: false,
    hasMultipleTails: false,
  },
  {
    id: 2,
    name: "Renardeau",
    minReadingDays: 1,
    description: "Ton compagnon vient de naître !",
    evolutionMessage: "Booky est né ! Continue de lire pour le voir grandir.",
    gradient: {
      from: 'hsl(25, 50%, 55%)',
      to: 'hsl(20, 45%, 45%)',
    },
    glowColor: 'hsl(25, 50%, 50%)',
    particleColor: 'hsl(25, 40%, 60%)',
    hasSparkles: false,
    hasGlasses: false,
    hasBook: false,
    hasCrown: false,
    hasMultipleTails: false,
  },
  {
    id: 3,
    name: "Jeune Renard",
    minReadingDays: 7,
    description: "Booky commence à briller !",
    evolutionMessage: "Booky évolue ! 7 jours de lecture, ça se fête !",
    gradient: {
      from: 'hsl(25, 55%, 50%)',
      to: 'hsl(20, 50%, 40%)',
    },
    glowColor: 'hsl(40, 60%, 55%)',
    particleColor: 'hsl(40, 50%, 60%)',
    hasSparkles: true,
    hasGlasses: false,
    hasBook: false,
    hasCrown: false,
    hasMultipleTails: false,
  },
  {
    id: 4,
    name: "Renard Érudit",
    minReadingDays: 21,
    description: "Un vrai passionné de lecture",
    evolutionMessage: "Booky devient un Renard Érudit ! 21 jours d'aventures !",
    gradient: {
      from: 'hsl(25, 60%, 48%)',
      to: 'hsl(18, 55%, 38%)',
    },
    glowColor: 'hsl(45, 70%, 55%)',
    particleColor: 'hsl(45, 60%, 55%)',
    hasSparkles: true,
    hasGlasses: true,
    hasBook: true,
    hasCrown: false,
    hasMultipleTails: false,
  },
  {
    id: 5,
    name: "Renard Légendaire",
    minReadingDays: 50,
    description: "Le maître de la lecture",
    evolutionMessage: "LÉGENDAIRE ! 50 jours de lecture. Booky est couronné !",
    gradient: {
      from: 'hsl(45, 80%, 55%)',
      to: 'hsl(25, 60%, 45%)',
    },
    glowColor: 'hsl(45, 85%, 60%)',
    particleColor: 'hsl(45, 80%, 65%)',
    hasSparkles: true,
    hasGlasses: true,
    hasBook: true,
    hasCrown: true,
    hasMultipleTails: true,
  },
];

/**
 * Get the stage for a given number of reading days
 */
export function getStageForReadingDays(days: number): BookyStage {
  return [...BOOKY_STAGES].reverse().find(s => days >= s.minReadingDays) || BOOKY_STAGES[0];
}

/**
 * Get the next stage from current stage ID
 */
export function getNextStage(currentStageId: number): BookyStage | null {
  return BOOKY_STAGES.find(s => s.id === currentStageId + 1) || null;
}

/**
 * Get stage by ID
 */
export function getStageById(stageId: number): BookyStage {
  return BOOKY_STAGES.find(s => s.id === stageId) || BOOKY_STAGES[0];
}

/**
 * Calculate progress towards next stage (0-100)
 */
export function getProgressToNextStage(currentDays: number): { progress: number; daysRemaining: number } | null {
  const currentStage = getStageForReadingDays(currentDays);
  const nextStage = getNextStage(currentStage.id);
  
  if (!nextStage) return null;
  
  const daysInCurrentStage = currentDays - currentStage.minReadingDays;
  const daysNeeded = nextStage.minReadingDays - currentStage.minReadingDays;
  const progress = Math.min(100, (daysInCurrentStage / daysNeeded) * 100);
  const daysRemaining = nextStage.minReadingDays - currentDays;
  
  return { progress, daysRemaining };
}
