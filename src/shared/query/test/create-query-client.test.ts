import { type QueryClient } from "@tanstack/react-query";

import { createQueryClient } from "../create-query-client";

const queryClients: QueryClient[] = [];

afterEach(() => {
  for (const queryClient of queryClients) {
    queryClient.clear();
  }
  queryClients.length = 0;
});

describe("ST-001 createQueryClient", () => {
  test("sets query retry to false", () => {
    const client = createQueryClient();
    queryClients.push(client);

    expect(client.getDefaultOptions().queries?.retry).toBe(false);
  });

  test("calls onMutationError when mutation fails", async () => {
    const onMutationError = jest.fn();
    const client = createQueryClient({ onMutationError });
    queryClients.push(client);

    const mutation = client.getMutationCache().build(client, {
      mutationFn: async () => {
        throw new Error("disk full");
      },
    });

    await expect(mutation.execute({})).rejects.toThrow("disk full");
    expect(onMutationError).toHaveBeenCalledWith(expect.any(Error));
  });
});
