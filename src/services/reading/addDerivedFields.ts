
import { getValidatedSegmentCount } from "./validatedSegmentCount";
import { PAGES_PER_SEGMENT, WORDS_PER_SEGMENT } from "@/utils/constants";
import { BookWithProgress } from "@/types/reading";

/**
 * Compute derived fields for a progress+book row
 * @param b Book data
 * @param p Progress data (optional)
 * @param precomputedValidatedCount Pre-computed validated count (optional, avoids N+1)
 */
export async function addDerivedFields(
  b: any,
  p?: any,
  precomputedValidatedCount?: number
): Promise<BookWithProgress> {
  const { total_pages, current_page, expected_segments, total_chapters } = b;

  // FIX N+1: Use precomputed count if provided, otherwise fetch (for backwards compatibility)
  const validatedSegments = precomputedValidatedCount !== undefined
    ? precomputedValidatedCount
    : await getValidatedSegmentCount(p?.user_id || b.user_id, b.book_id || b.id);
  const isWordMode = current_page > total_pages * 2;
  const segmentsFromCurrentPage = isWordMode
    ? Math.floor(current_page / WORDS_PER_SEGMENT)
    : Math.floor(current_page / PAGES_PER_SEGMENT);

  const expectedSegments = b.expected_segments ?? total_chapters ?? 1;
  const totalSegments = expectedSegments;
  const clampedSegments = Math.min(validatedSegments, totalSegments);
  const isCompleted = p?.status === "completed" || clampedSegments >= totalSegments;

  return {
    ...b,
    ...p,
    coverImage: b.cover_url, // Image pour la page d'accueil
    expectedSegments,
    totalSegments,
    chaptersRead: clampedSegments,
    progressPercent: Math.round((clampedSegments / (totalSegments || 1)) * 100),
    nextSegmentPage: isWordMode
      ? (clampedSegments + 1) * WORDS_PER_SEGMENT
      : (clampedSegments + 1) * PAGES_PER_SEGMENT,
    currentSegment: clampedSegments,
    isCompleted,
    book_id: b.book_id || b.id,
    book_title: b.title,
    book_author: b.author,
    book_cover: b.cover_url,
  };
}
