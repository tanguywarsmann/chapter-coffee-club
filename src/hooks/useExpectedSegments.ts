import { useMemo } from "react";

export function resolveExpectedSegments(book?: any): number {
  return Number(
    book?.expectedSegments ??
    book?.expected_segments ??
    book?.totalSegments ??
    book?.total_chapters ??
    0
  );
}

export function useExpectedSegments(book?: any): number {
  return useMemo(() => resolveExpectedSegments(book), [book]);
}
