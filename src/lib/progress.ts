
/**
 * Calcule la progression de lecture en pourcentage, plafonnée à 100%
 * @param validatedCount Nombre de chapitres/segments validés
 * @param expectedCount Nombre total de chapitres/segments attendus
 * @returns Pourcentage de progression (0-100)
 */
export function calculateReadingProgress(validatedCount: number, expectedCount: number): number {
  if (!expectedCount || expectedCount === 0) return 0;
  const progress = (validatedCount / expectedCount) * 100;
  return Math.min(Math.round(progress), 100);
}
