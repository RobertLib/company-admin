import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import logger from "../utils/logger";

const DEFAULT_RETRY_COUNT = 3;
const DEFAULT_STALE_TIME = 1000 * 60 * 5;
const DEFAULT_CACHE_LIFETIME = DEFAULT_STALE_TIME * 12;
const CACHE_CLEANUP_INTERVAL = DEFAULT_STALE_TIME;

type QueryStatus = "idle" | "loading" | "error" | "success";

interface QueryOptions {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
  retry?: number;
  staleTime?: number;
  staleWhileRevalidate?: boolean;
}

interface QueryResult<TData> {
  data: TData | undefined;
  error: Error | null;
  isError: boolean;
  isLoading: boolean;
  isRevalidating: boolean;
  isSuccess: boolean;
  refetch: () => Promise<unknown>;
}

interface CacheEntry<T = unknown> {
  data: T;
  timestamp: number;
}

const DEFAULT_OPTIONS: QueryOptions = {
  headers: {},
  params: {},
  retry: DEFAULT_RETRY_COUNT,
  staleTime: DEFAULT_STALE_TIME,
  staleWhileRevalidate: true,
};

const activeRequests = new Map<string, AbortController>();
const queryCache = new Map<string, CacheEntry>();
const pendingPromises = new Map<string, Promise<unknown>>();

let lastCacheCleanup = Date.now();

function cleanupCache(maxAge: number = DEFAULT_CACHE_LIFETIME) {
  for (const [url, { timestamp }] of queryCache.entries()) {
    if (Date.now() - timestamp > maxAge) {
      queryCache.delete(url);
    }
  }
}

function enforceMaxCacheSize(maxSize: number = 100) {
  if (queryCache.size <= maxSize) return;

  const entries = Array.from(queryCache.entries()).sort(
    ([, a], [, b]) => a.timestamp - b.timestamp,
  );

  const toRemove = entries.length - maxSize;
  entries.slice(0, toRemove).forEach(([url]) => queryCache.delete(url));
}

let cleanupIntervalId: number | null = null;

if (typeof window !== "undefined" && cleanupIntervalId === null) {
  cleanupIntervalId = window.setInterval(() => {
    cleanupCache();
    enforceMaxCacheSize();
    lastCacheCleanup = Date.now();
  }, CACHE_CLEANUP_INTERVAL);
}

function getSearchParams(
  params?: Record<string, string | number | boolean>,
): URLSearchParams {
  const searchParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, String(value));
    });
  }
  return searchParams;
}

function getCacheKey(
  queryUrl: string,
  params?: Record<string, string | number | boolean>,
) {
  const searchParams = getSearchParams(params);
  const queryString = searchParams.toString();
  return queryString ? `${queryUrl}?${queryString}` : queryUrl;
}

export function invalidateQuery(
  queryUrl: string,
  params?: Record<string, string | number | boolean>,
) {
  const baseUrl = `${import.meta.env.VITE_API_URL}/api/v1/${queryUrl}`;
  const cacheKey = getCacheKey(baseUrl, params);
  queryCache.delete(cacheKey);
}

export default function useQuery<TData>(
  queryUrl: string,
  options: Partial<QueryOptions> = {},
): QueryResult<TData> {
  const [data, setData] = useState<TData>();
  const [status, setStatus] = useState<QueryStatus>("idle");
  const [error, setError] = useState<Error | null>(null);
  const [isRevalidating, setIsRevalidating] = useState(false);

  const baseUrl = `${import.meta.env.VITE_API_URL}/api/v1/${queryUrl}`;
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  const cacheKey = getCacheKey(baseUrl, mergedOptions.params);

  const retryCount = useRef(0);

  const { headers, params, retry } = useMemo(
    () => ({
      headers: mergedOptions.headers || {},
      params: mergedOptions.params,
      retry: mergedOptions.retry ?? DEFAULT_RETRY_COUNT,
    }),
    [mergedOptions.headers, mergedOptions.params, mergedOptions.retry],
  );

  const fetchWithRetry = useCallback(
    async (
      abortController: AbortController,
      isRevalidation = false,
    ): Promise<void> => {
      try {
        if (!isRevalidation) {
          setStatus("loading");
        }

        const url = new URL(baseUrl);
        const searchParams = getSearchParams(params);
        url.search = searchParams.toString();

        const response = await fetch(url.toString(), {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...headers,
          },
          signal: abortController.signal,
        });

        if (!response.ok) {
          const errorText = await response.text().catch(() => "");
          throw new Error(
            `Failed to fetch: ${response.status} ${response.statusText}. Details: ${errorText}`,
          );
        }

        const result = await response.json().catch((error) => {
          throw new Error(`Invalid JSON response: ${error.message}`);
        });
        setData(result);

        queryCache.set(cacheKey, {
          data: result as TData,
          timestamp: Date.now(),
        });

        if (Date.now() - lastCacheCleanup > CACHE_CLEANUP_INTERVAL) {
          cleanupCache();
          enforceMaxCacheSize();
          lastCacheCleanup = Date.now();
        }

        setStatus("success");

        if (isRevalidation) {
          setIsRevalidating(false);
        }

        retryCount.current = 0;
      } catch (error) {
        if ((error as Error).name === "AbortError") return;

        if (retryCount.current < retry) {
          retryCount.current++;
          const delay = Math.pow(2, retryCount.current - 1) * 1000;
          setTimeout(
            () => fetchWithRetry(abortController, isRevalidation),
            delay,
          );
          return;
        }

        setError(error instanceof Error ? error : new Error(String(error)));
        setStatus("error");

        if (isRevalidation) {
          setIsRevalidating(false);
        }
      }
    },
    [baseUrl, cacheKey, headers, params, retry],
  );

  const fetchData = useCallback(
    async (isRevalidation = false) => {
      if (pendingPromises.has(cacheKey)) {
        return pendingPromises.get(cacheKey);
      }

      if (activeRequests.has(cacheKey)) {
        activeRequests.get(cacheKey)?.abort();
      }

      const abortController = new AbortController();
      activeRequests.set(cacheKey, abortController);

      const promise = fetchWithRetry(abortController, isRevalidation).finally(
        () => {
          pendingPromises.delete(cacheKey);
        },
      );

      pendingPromises.set(cacheKey, promise);
      activeRequests.delete(cacheKey);

      return promise;
    },
    [cacheKey, fetchWithRetry],
  );

  useEffect(() => {
    retryCount.current = 0;

    const staleWhileRevalidate = mergedOptions.staleWhileRevalidate ?? true;
    const cached = queryCache.get(cacheKey);
    const isFresh =
      cached &&
      Date.now() - cached.timestamp <
        (mergedOptions.staleTime ?? DEFAULT_STALE_TIME);
    const isStale = cached && !isFresh;

    if (cached) {
      try {
        setData(cached.data as TData);
        setStatus("success");

        if (isStale && staleWhileRevalidate) {
          setIsRevalidating(true);
          fetchData(true);
        }
      } catch (error) {
        logger.error("Error parsing cached data", error);
        logger.warn("Cache data might be invalid, fetching new data");
        fetchData();
      }
    } else {
      activeRequests.get(cacheKey)?.abort();
      fetchData();
    }

    return () => {
      if (activeRequests.has(cacheKey)) {
        activeRequests.get(cacheKey)?.abort();
        activeRequests.delete(cacheKey);
      }
    };
  }, [
    cacheKey,
    fetchData,
    mergedOptions.staleTime,
    mergedOptions.staleWhileRevalidate,
  ]);

  return {
    data,
    error,
    isError: status === "error",
    isLoading: ["loading", "idle"].includes(status),
    isRevalidating,
    isSuccess: status === "success",
    refetch: () => fetchData(),
  };
}
