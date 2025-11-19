import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type ExploreCategory = "litterature" | "religion" | "essai" | "bio";

export interface ExploreFilters {
  category: ExploreCategory;
  query?: string;
  page: number;
  pageSize?: number;
}

export const EXPLORE_PAGE_SIZE = 24;

const fetchExploreBooks = async ({ category, query, page, pageSize = EXPLORE_PAGE_SIZE }: ExploreFilters) => {
  const safePage = Number.isFinite(page) ? Math.max(1, page) : 1;
  const trimmedQuery = (query ?? "").trim();
  const from = (safePage - 1) * pageSize;
  const to = from + pageSize - 1;

  let builder = supabase
    .from("books_explore")
    .select("*")
    .eq("category", category)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (trimmedQuery.length >= 2) {
    builder = builder.or(`title.ilike.%${trimmedQuery}%,author.ilike.%${trimmedQuery}%`);
  }

  const { data, error } = await builder;

  if (error) {
    throw error;
  }

  return data ?? [];
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
