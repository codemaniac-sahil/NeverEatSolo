import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options?: {
  on401?: UnauthorizedBehavior;
  params?: Record<string, string>;
}) => QueryFunction<T> =
  (options = { on401: "throw" }) =>
  async ({ queryKey }) => {
    const { on401: unauthorizedBehavior = "throw", params } = options;
    
    // Build URL with query parameters if provided
    let url = queryKey[0] as string;
    if (params && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        searchParams.append(key, value);
      });
      url = `${url}?${searchParams.toString()}`;
    }
    
    const res = await fetch(url, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: true,
      // Use more reasonable staleTime values
      staleTime: 5 * 60 * 1000, // 5 minutes for most data
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

// Helper function to get category-specific query options
export const getQueryOptions = (category: 'location' | 'user' | 'static' | 'dynamic') => {
  switch (category) {
    case 'location':
      return {
        staleTime: 2 * 60 * 1000, // 2 minutes for location-based data
        refetchOnWindowFocus: true
      };
    case 'user':
      return {
        staleTime: 10 * 60 * 1000, // 10 minutes for user profile data
        refetchOnWindowFocus: true
      };
    case 'static':
      return {
        staleTime: 24 * 60 * 60 * 1000, // 1 day for static data like cuisines
        refetchOnWindowFocus: false
      };
    case 'dynamic':
      return {
        staleTime: 30 * 1000, // 30 seconds for very dynamic data
        refetchOnWindowFocus: true,
        refetchInterval: 60 * 1000 // Poll every minute
      };
    default:
      return {
        staleTime: 5 * 60 * 1000, // 5 minutes default
        refetchOnWindowFocus: true
      };
  }
};
