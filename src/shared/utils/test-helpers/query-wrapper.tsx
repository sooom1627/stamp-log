import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";

import { createTestQueryClient } from "@/shared/query/create-query-client";

// Clients made by createWrapper in the current test file.
const queryClients: QueryClient[] = [];

// A renderHook wrapper with a fresh QueryClient. Call clearQueryClients in
// afterEach so no cache or timer outlives the test.
export function createWrapper() {
  const queryClient = createTestQueryClient();
  queryClients.push(queryClient);

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

export function clearQueryClients() {
  for (const queryClient of queryClients) {
    queryClient.clear();
  }
  queryClients.length = 0;
}
