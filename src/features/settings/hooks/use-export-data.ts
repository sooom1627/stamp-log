import { File, Paths } from "expo-file-system";
import { shareAsync } from "expo-sharing";

import { useMutation } from "@tanstack/react-query";

import { readBackup } from "@/features/settings/db/backup-db";
import { localDateKey } from "@/shared/utils/local-date-key";

// Writes every rally and stamp to a JSON file and opens the share sheet, from
// which it can be saved to Files or sent by AirDrop. The share sheet resolves
// the same way whether the file was saved or the sheet was closed.
async function exportData() {
  const backup = await readBackup();
  const file = new File(
    Paths.cache,
    `stamp-log-${localDateKey(new Date())}.json`,
  );
  await file.write(JSON.stringify(backup, null, 2));
  await shareAsync(file.uri, {
    mimeType: "application/json",
    UTI: "public.json",
  });
}

export function useExportData() {
  return useMutation({ mutationFn: exportData });
}
