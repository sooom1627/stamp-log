import { useMutation, useQueryClient } from "@tanstack/react-query";

import { replaceWithBackup } from "../db/backup-db";

// Every screen's data comes from the replaced tables, so every query reloads.
export function useImportData() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: replaceWithBackup,
    onSuccess: () => queryClient.invalidateQueries(),
  });
}
