import { MutationCache, QueryClient } from "@tanstack/react-query";

export function createQueryClient(handlers?: {
  onMutationError?: (error: Error) => void;
}) {
  return new QueryClient({
    defaultOptions: { queries: { staleTime: Infinity, retry: false } },
    mutationCache: handlers?.onMutationError
      ? new MutationCache({
          onError: (error) => handlers.onMutationError?.(error as Error),
        })
      : undefined,
  });
}

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: Infinity },
      mutations: { retry: false, gcTime: 0 },
    },
  });
}
