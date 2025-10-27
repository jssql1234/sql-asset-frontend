import { useToast } from "@/components/ui/components/Toast";
import { type QueryKey, useQuery, type UseQueryResult } from "@tanstack/react-query";
import { useEffect } from "react";
import { logError } from "@/utils/logger";

export interface QueryOptions {
  staleTime?: number;
  gcTime?: number;
  refetchOnWindowFocus?: boolean;
  refetchIntervalInBackground?: boolean;
  refetchInterval?: number;
  retry?: number | boolean;
  retryDelay?: number | ((attemptIndex: number) => number);
  enabled?: boolean;
}

interface UseDataQueryParams<TData> {
  key: QueryKey;
  queryFn: () => Promise<TData>;
  title?: string;
  options?: QueryOptions;
  description?: string;
}

export function useDataQuery<TData>({
  key,
  queryFn,
  title,
  options,
  description,
}: UseDataQueryParams<TData>) {
  const query = useQuery<TData>({
    queryKey: key,
    queryFn: queryFn,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
    refetchIntervalInBackground: true,
    refetchInterval: 1000 * 60 * 5,
    retry: 1,
    ...options,
  });

  useToastOnError(query, title, description, key);

  return query;
}

const LAST_TOAST_SHOWN = new Map<string, number>();
const TOAST_RATE_LIMIT_MS = 10_000;

function useToastOnError<T>(
  query: UseQueryResult<T>,
  title: string | undefined,
  description: string | undefined,
  key: QueryKey
) {
  const { addToast } = useToast();

  useEffect(() => {
    if (!query.isError || !title) return;

    logError(query.error, undefined, {
      scope: "react-query",
      route: window.location.pathname,
      component: "useDataQuery",
      queryKey: key,
    });

    const k = `${title}|${JSON.stringify(key)}`;
    const now = Date.now();
    const last = LAST_TOAST_SHOWN.get(k) ?? 0;
    if (now - last >= TOAST_RATE_LIMIT_MS) {
      addToast({ variant: "error", title, description });
      LAST_TOAST_SHOWN.set(k, now);
    }
  }, [query.isError, query.error, addToast, title, description, key]);
}
