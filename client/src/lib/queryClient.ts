import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { dataClient } from "./dataClient";

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
  // Block write operations for main resources in guest mode
  const isWriteOperation = method !== 'GET';
  const isMainResource = url.includes('/api/users') || url.includes('/api/events') || url.includes('/api/wines');
  
  if (isWriteOperation && isMainResource) {
    throw new Error('Funzione non disponibile in questa modalità');
  }
  
  // All main resources now use Supabase, remaining calls should be blocked
  const fullUrl = url;
  const res = await fetch(fullUrl, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey.join("/") as string;
    
    // Route Supabase calls for main resources
    if (url === '/api/users') {
      const response = await dataClient.getUsers();
      if (!response.ok) {
        throw new Error(response.error || 'Failed to fetch users');
      }
      return response.data;
    }
    
    if (url === '/api/events') {
      const response = await dataClient.getEvents();
      if (!response.ok) {
        throw new Error(response.error || 'Failed to fetch events');
      }
      return response.data;
    }
    
    if (url === '/api/wines') {
      const response = await dataClient.getWines();
      if (!response.ok) {
        throw new Error(response.error || 'Failed to fetch wines');
      }
      return response.data;
    }
    
    // No fallback needed - all remaining endpoints should be blocked
    throw new Error('Endpoint non disponibile in modalità frontend-only');
    
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
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
