import { Alert } from "react-native";

import { getDocumentAsync } from "expo-document-picker";
import { File } from "expo-file-system";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner-native";

import { formatStampCount } from "@/shared/utils/format-stamp-count";

import { readBackup, replaceWithBackup } from "../db/backup-db";
import { backupSchema, type Backup } from "../schemas/backup";

// Every screen's data comes from the replaced tables, so every query reloads.
export function useImportData() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: replaceWithBackup,
    onSuccess: () => queryClient.invalidateQueries(),
  });
}

function formatRallyCount(count: number) {
  return `${count} ${count === 1 ? "rally" : "rallies"}`;
}

function formatCounts({ rallies, stamps }: Backup) {
  return `${formatRallyCount(rallies.length)} and ${formatStampCount(stamps.length)}`;
}

// The picked file's backup; null when nothing was picked. A file this app
// cannot read throws.
async function pickBackup() {
  const result = await getDocumentAsync({ type: "application/json" });
  if (result.canceled) return null;
  const content = new File(result.assets[0].uri).textSync();
  return backupSchema.parse(JSON.parse(content));
}

// Import data (S-041): pick a file, then replace this device's data with it.
// A device with data asks first, with both counts.
export function useImportFromFile({ onImported }: { onImported: () => void }) {
  const { mutate: importData, isPending: isImporting } = useImportData();

  async function importFromFile() {
    let backup: Backup | null;
    try {
      backup = await pickBackup();
    } catch {
      Alert.alert(
        "Can't read this file",
        "Choose a file exported from Stamplog.",
      );
      return;
    }
    if (!backup) return;

    const fileBackup = backup;
    const replace = () => importData(fileBackup, { onSuccess: onImported });
    let current: Backup;
    try {
      current = await readBackup();
    } catch {
      // Like a failed save (the root layout's mutation error toast).
      toast.error("Something went wrong. Please try again.");
      return;
    }
    if (current.rallies.length === 0 && current.stamps.length === 0) {
      replace();
      return;
    }
    Alert.alert(
      "Replace all data?",
      `This replaces this device's ${formatCounts(current)} with the file's ${formatCounts(fileBackup)}. Photos on this device are removed.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Replace", style: "destructive", onPress: replace },
      ],
    );
  }

  return { importFromFile, isImporting };
}
