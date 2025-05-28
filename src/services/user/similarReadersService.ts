
// Service désactivé temporairement pour éviter les erreurs de build et de publication
export function findSimilarReaders() {
  return [];
}

export function invalidateSimilarReadersCache(userId?: string) {
  // Pas de cache à invalider tant que la fonction est inactive
  console.debug('[SIMILAR_READERS] Cache invalidation skipped - service disabled');
}

export function getSimilarReaders() {
  return Promise.resolve([]);
}

export function calculateSimilarity() {
  return 0;
}
