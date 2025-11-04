import { useMemo, useState } from "react";

export interface CoverageSearchResult<T> {
  query: string;
  setQuery: (value: string) => void;
  filteredItems: T[];
  hasQuery: boolean;
}

export function useCoverageSearch<T>(
  items: readonly T[],
  matcher: (item: T, normalizedQuery: string) => boolean,
): CoverageSearchResult<T> {
  const [query, setQuery] = useState("");

  const normalizedQuery = query.trim().toLowerCase();
  const hasQuery = normalizedQuery.length > 0;

  const filteredItems = useMemo(() => {
    if (!hasQuery) {
      return [...items];
    }

    return items.filter((item) => matcher(item, normalizedQuery));
  }, [items, matcher, normalizedQuery, hasQuery]);

  return {
    query,
    setQuery,
    filteredItems,
    hasQuery,
  };
}
