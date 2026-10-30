import { Fragment, type ComponentType } from "react";

import { Pressable, Text, View } from "react-native";

import Constants from "expo-constants";
import { useRouter } from "expo-router";

import { useTranslation } from "react-i18next";

import { useExportData } from "@/features/settings/hooks/use-export-data";
import { useImportFromFile } from "@/features/settings/hooks/use-import-data";
import { useLanguagePreference } from "@/features/settings/hooks/use-language-preference";
import { FormSheetLayout } from "@/shared/components/form-sheet";
import {
  ArrowUpRight,
  ChevronRight,
  CircleHelp,
  Download,
  FileText,
  Info,
  Languages,
  Shield,
  Upload,
} from "@/shared/components/icons";

type IconProps = { size?: number; colorClassName?: string };

type SettingsRow = {
  label: string;
  detail?: string;
  // The current choice, shown on the right before the ›.
  value?: string;
  icon: ComponentType<IconProps>;
  // Opens a web page (↗) rather than going further into the app (›).
  isExternal?: boolean;
  role: "button" | "link";
  // Rows without one do nothing yet: the pages get theirs once their URLs
  // exist, and Licenses in its own Story.
  onPress?: () => void;
  // Busy rows cannot be pressed again until their action ends.
  isBusy?: boolean;
};

function SettingsRowItem({ row }: { row: SettingsRow }) {
  const { label, detail, value, isExternal, role, onPress, isBusy } = row;
  const RowIcon = row.icon;

  return (
    <Pressable
      role={role}
      onPress={onPress}
      disabled={isBusy}
      aria-busy={isBusy}
      className="active:bg-surface-muted-active min-h-13 flex-row items-center gap-3 px-4 py-2.5"
    >
      <View className="border-continuous bg-accent-soft size-8 items-center justify-center rounded-lg">
        <RowIcon size={18} colorClassName="accent-accent-strong" />
      </View>
      <View className="flex-1 gap-0.5">
        <Text className="text-foreground text-base">{label}</Text>
        {detail ? (
          <Text className="text-foreground-secondary text-sm">{detail}</Text>
        ) : null}
      </View>
      {value ? (
        <Text className="text-foreground-secondary text-base">{value}</Text>
      ) : null}
      {isExternal ? (
        <ArrowUpRight size={16} colorClassName="accent-foreground-muted" />
      ) : null}
      {!isExternal && !detail ? (
        <ChevronRight size={16} colorClassName="accent-foreground-muted" />
      ) : null}
    </Pressable>
  );
}

function SettingsGroup({
  title,
  rows,
}: {
  title: string;
  rows: SettingsRow[];
}) {
  return (
    <View className="gap-2">
      <Text className="text-foreground-muted px-4 text-sm font-semibold uppercase">
        {title}
      </Text>
      <View className="border-continuous bg-surface-muted overflow-hidden rounded-2xl">
        {rows.map((row, index) => (
          <Fragment key={row.label}>
            {/* The sheet color shows through as the divider, so it stays
                visible in dark mode where border equals surface-muted. */}
            {index > 0 ? <View className="bg-background ml-15 h-px" /> : null}
            <SettingsRowItem row={row} />
          </Fragment>
        ))}
      </View>
    </View>
  );
}

export function SettingsScreen() {
  const version = Constants.expoConfig?.version;
  const { back, push } = useRouter();
  const { t } = useTranslation();
  const { mutate: exportData, isPending: isExporting } = useExportData();
  // The sheet closes so the tabs show the imported data.
  const { importFromFile, isImporting } = useImportFromFile({
    onImported: () => back(),
  });
  const { data: languagePreference } = useLanguagePreference();
  const languageNames = {
    system: t("language.device"),
    en: "English",
    ja: "日本語",
  };
  const generalRows: SettingsRow[] = [
    {
      label: t("settings.language"),
      value: languagePreference ? languageNames[languagePreference] : undefined,
      icon: Languages,
      role: "button",
      onPress: () => push("/language"),
    },
  ];
  const dataRows: SettingsRow[] = [
    {
      label: t("settings.exportData"),
      detail: t("settings.exportDetail"),
      icon: Upload,
      role: "button",
      onPress: () => exportData(),
      isBusy: isExporting,
    },
    {
      label: t("settings.importData"),
      detail: t("settings.importDetail"),
      icon: Download,
      role: "button",
      onPress: () => void importFromFile(),
      isBusy: isImporting,
    },
  ];
  const aboutRows: SettingsRow[] = [
    {
      label: t("settings.aboutAto"),
      icon: Info,
      role: "button",
      onPress: () => push("/about-ato"),
    },
    {
      label: t("settings.help"),
      icon: CircleHelp,
      isExternal: true,
      role: "link",
    },
    {
      label: t("settings.privacy"),
      icon: Shield,
      isExternal: true,
      role: "link",
    },
    { label: t("settings.licenses"), icon: FileText, role: "button" },
  ];

  return (
    <FormSheetLayout
      testID="settings-sheet"
      title={t("settings.title")}
      className="gap-7"
    >
      <SettingsGroup title={t("settings.general")} rows={generalRows} />
      <View className="gap-2">
        <SettingsGroup title={t("settings.data")} rows={dataRows} />
        <Text className="text-foreground-muted px-4 text-sm">
          {t("settings.photosNotIncluded")}
        </Text>
      </View>
      <SettingsGroup title={t("settings.about")} rows={aboutRows} />
      <Text className="text-foreground-muted text-center text-sm">
        {version ? `Ato ${version}` : "Ato"}
      </Text>
    </FormSheetLayout>
  );
}
