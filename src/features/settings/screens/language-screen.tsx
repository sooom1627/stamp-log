import { Fragment } from "react";

import { Pressable, Text, View } from "react-native";

import { useRouter } from "expo-router";

import { useTranslation } from "react-i18next";

import {
  useChangeLanguage,
  useLanguagePreference,
} from "@/features/settings/hooks/use-language-preference";
import { FormSheetLayout } from "@/shared/components/form-sheet";
import { Check } from "@/shared/components/icons";
import { type LanguagePreference } from "@/shared/i18n/language-preference";

export function LanguageScreen() {
  const { back } = useRouter();
  const { t } = useTranslation();
  const { data: preference } = useLanguagePreference();
  const { mutate: changeLanguage } = useChangeLanguage();
  // English and 日本語 keep their own names in either language.
  const options: { preference: LanguagePreference; label: string }[] = [
    { preference: "system", label: t("language.device") },
    { preference: "en", label: "English" },
    { preference: "ja", label: "日本語" },
  ];

  return (
    <FormSheetLayout testID="language-sheet" title={t("language.title")}>
      <View className="gap-2">
        <View className="border-continuous bg-surface-muted overflow-hidden rounded-2xl">
          {options.map((option, index) => {
            const isSelected = option.preference === preference;
            return (
              <Fragment key={option.preference}>
                {/* The sheet color shows through as the divider, as in Settings. */}
                {index > 0 ? (
                  <View className="bg-background ml-4 h-px" />
                ) : null}
                <Pressable
                  role="button"
                  aria-selected={isSelected}
                  onPress={() =>
                    changeLanguage(option.preference, {
                      onSuccess: () => back(),
                    })
                  }
                  className="active:bg-surface-muted-active min-h-13 flex-row items-center px-4 py-2.5"
                >
                  <Text className="text-foreground flex-1 text-base">
                    {option.label}
                  </Text>
                  {isSelected ? (
                    <Check size={18} colorClassName="accent-accent-strong" />
                  ) : null}
                </Pressable>
              </Fragment>
            );
          })}
        </View>
        <Text className="text-foreground-muted px-4 text-sm">
          {t("language.deviceNote")}
        </Text>
      </View>
    </FormSheetLayout>
  );
}
