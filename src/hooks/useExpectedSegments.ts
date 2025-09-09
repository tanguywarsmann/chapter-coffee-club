import { useMemo } from "react";

export function useExpectedSegments(book?: any): number {
  return useMemo(() => Number(
    book?.expectedSegments ??
    book?.expected_segments ??
    book?.totalSegments ??
    book?.total_chapters ??
    0
  ), [book]);
}