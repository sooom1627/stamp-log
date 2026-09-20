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
  test("query の retry は false", () => {
    const client = createQueryClient();
    queryClients.push(client);

    expect(client.getDefaultOptions().queries?.retry).toBe(false);
  });

  test("mutation が失敗すると onMutationError が呼ばれる", async () => {
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
