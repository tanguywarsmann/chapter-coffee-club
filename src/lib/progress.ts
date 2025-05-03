
/**
 * Calcule la progression de lecture en pourcentage, plafonnée à 100%
 * @param validatedCount Nombre de chapitres/segments validés
 * @param expectedCount Nombre total de chapitres/segments attendus
 * @returns Pourcentage de progression (0-100)
 */
export function calculateReadingProgress(validatedCount: number, expectedCount: number): number {
  if (!expectedCount || expectedCount === 0) return 0;
  
  // Si la lecture n'est pas complète (validatedCount < expectedCount), 
  // on plafonne à 99% pour indiquer qu'il reste du contenu à lire
  if (validatedCount < expectedCount) {
    const progress = (validatedCount / expectedCount) * 100;
    return Math.min(Math.floor(progress), 99);
  } 
  
  // Si tout est validé (validatedCount >= expectedCount), on affiche 100%
  return 100;
}
