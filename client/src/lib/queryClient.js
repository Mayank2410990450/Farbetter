import { QueryClient } from "@tanstack/react-query";

async function throwIfResNotOk(res) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(method, url, data) {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

export const getQueryFn =
  ({ on401: unauthorizedBehavior }) =>
    async ({ queryKey }) => {
      const res = await fetch(queryKey.join("/"), {
        credentials: "include",
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      await throwIfResNotOk(res);
      return await res.json();
    };

/**
 * React Query Client with Optimized Caching
 * 
 * Cache Strategy:
 * - staleTime: How long data is considered fresh (won't refetch)
 * - gcTime: How long inactive data stays in cache
 * - refetchOnWindowFocus: Refetch when user returns to tab
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      // Data stays fresh for 5 minutes - no refetch during this time
      staleTime: 5 * 60 * 1000, // 5 minutes
      // Keep inactive data in cache for 30 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
      // Only refetch on window focus if data is stale
      refetchOnWindowFocus: true,
      // Don't refetch on mount if data exists
      refetchOnMount: false,
      // Retry failed requests once
      retry: 1,
      retryDelay: 1000,
    },
    mutations: {
      retry: false,
    },
  },
});
