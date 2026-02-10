import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { mapBookFromRecord } from "@/services/books/bookMapper";
import { Book } from "@/types/book";

export type ExploreCategory = "litterature" | "religion" | "essai" | "bio";

export interface ExploreFilters {
  category: ExploreCategory;
  query?: string;
  page: number;
  pageSize?: number;
}

export const EXPLORE_PAGE_SIZE = 24;

const CATEGORY_TAG_MAP: Record<string, string[]> = {
  religion: ["Religion"],
  essai: ["Essai"],
  bio: ["Biographie"],
};

const EXCLUDED_TAGS = ["Religion", "Essai", "Biographie"];

const fetchExploreBooks = async ({ category, query, page, pageSize = EXPLORE_PAGE_SIZE }: ExploreFilters): Promise<Book[]> => {
  const safePage = Number.isFinite(page) ? Math.max(1, page) : 1;
  const trimmedQuery = (query ?? "").trim();
  const from = (safePage - 1) * pageSize;
  const to = from + pageSize - 1;

  let builder = supabase
    .from("books")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  // Apply tag-based category filter for non-litterature categories
  const tagFilter = CATEGORY_TAG_MAP[category];
  if (tagFilter) {
    builder = builder.contains("tags", tagFilter);
  }

  if (trimmedQuery.length >= 2) {
    builder = builder.or(`title.ilike.%${trimmedQuery}%,author.ilike.%${trimmedQuery}%`);
  }

  // For litterature, fetch more to compensate for client-side filtering
  if (!tagFilter) {
    builder = builder.range(from, from + pageSize * 2 - 1);
  } else {
    builder = builder.range(from, to);
  }

  const { data, error } = await builder;

  if (error) {
    throw error;
  }

  let rows = data ?? [];

  // For litterature: filter out books with Religion/Essai/Biographie tags (client-side)
  // Books with NULL tags are included in litterature
  if (!tagFilter) {
    rows = rows.filter(row => {
      const tags = row.tags;
      if (!tags || !Array.isArray(tags)) return true; // NULL tags = litterature
      return !tags.some((t: string) => EXCLUDED_TAGS.includes(t));
    });
    // Trim to pageSize after client-side filter
    rows = rows.slice(0, pageSize);
  }

  return rows.map(mapBookFromRecord);
};

export function useExploreBooks(filters: ExploreFilters) {
  const normalizedFilters: ExploreFilters = {
    ...filters,
    page: Number.isFinite(filters.page) ? Math.max(1, filters.page) : 1,
    query: (filters.query ?? "").trim(),
  };

  return useQuery({
    queryKey: ["explore-books", normalizedFilters.category, normalizedFilters.page, normalizedFilters.query],
    queryFn: () => fetchExploreBooks(normalizedFilters),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
    retry: 2,
    refetchOnWindowFocus: true,
  });
}
