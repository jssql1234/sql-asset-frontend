import { useToast } from "@/components/ui/components/Toast";
import {
  type QueryKey,
  useQuery,
  type UseQueryResult,
} from "@tanstack/react-query";
import { useEffect, useRef } from "react";

export type QueryOptions = {
  staleTime?: number;
  gcTime?: number;
  refetchOnWindowFocus?: boolean;
  refetchIntervalInBackground?: boolean;
  refetchInterval?: number;
  retry?: number | boolean;
  retryDelay?: number | ((attemptIndex: number) => number);
  enabled?: boolean;
};

type UseDataQueryParams<TData> = {
  key: QueryKey;
  queryFn: () => Promise<TData>;
  title?: string;
  options?: QueryOptions;
  description?: string;
};

export function useDataQuery<TData, TError extends Error = Error>({
  key,
  queryFn,
  title,
  options,
  description,
}: UseDataQueryParams<TData>) {
  const query = useQuery<TData, TError>({
    queryKey: key.flat(),
    queryFn: queryFn,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
    refetchIntervalInBackground: true,
    refetchInterval: 1000 * 60 * 5,
    retry: 1,
    ...options,
  });

  useToastOnError(query, title, description);

  return query;
}

function useToastOnError<T>(
  query: UseQueryResult<T, Error>,
  title: string | undefined,
  description: string | undefined
) {
  const { addToast } = useToast();
  const hasShownError = useRef(false);

  useEffect(() => {
    if (query.isError && !hasShownError.current && title) {
      console.error("Fetch data error: ", query.error);

      addToast({
        variant: "error",
        title,
        description,
      });

      hasShownError.current = true;
    }
  }, [query.isError, query.error, addToast, title, description]);
}
