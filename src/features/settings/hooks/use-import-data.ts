import { Alert } from "react-native";

import { getDocumentAsync } from "expo-document-picker";
import { File } from "expo-file-system";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import { toast } from "sonner-native";

import {
  readBackup,
  replaceWithBackup,
} from "@/features/settings/db/backup-db";
import { backupSchema, type Backup } from "@/features/settings/schemas/backup";
import { formatStampCount } from "@/shared/utils/format-stamp-count";

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

function formatCounts(t: TFunction, { rallies, stamps }: Backup) {
  return t("settings.counts", {
    rallies: formatRallyCount(rallies.length),
    stamps: formatStampCount(stamps.length),
  });
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
  const { t } = useTranslation();

  async function importFromFile() {
    let backup: Backup | null;
    try {
      backup = await pickBackup();
    } catch {
      Alert.alert(t("settings.cannotReadTitle"), t("settings.cannotReadBody"));
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
      toast.error(t("common.errorTryAgain"));
      return;
    }
    if (current.rallies.length === 0 && current.stamps.length === 0) {
      replace();
      return;
    }
    Alert.alert(
      t("settings.replaceTitle"),
      t("settings.replaceBody", {
        current: formatCounts(t, current),
        file: formatCounts(t, fileBackup),
      }),
      [
        { text: t("common.cancel"), style: "cancel" },
        { text: t("settings.replace"), style: "destructive", onPress: replace },
      ],
    );
  }

  return { importFromFile, isImporting };
}
