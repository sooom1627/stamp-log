import { useState } from "react";

import { View } from "react-native";

import { useRouter } from "expo-router";

import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useSaveRally } from "@/shared/hooks/use-rallies";

import {
  FirstRallyPicker,
  firstRallyTemplates,
} from "../components/first-rally-picker";
import { IntroPages, introPages } from "../components/intro-pages";
import { markOnboarded } from "../db/onboarding-state";

// The step after the intro pages.
const pickStep = introPages.length;

// First launch only (S-047): four intro pages, then the first rally.
export function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { mutate: saveRally, isPending: isSaving } = useSaveRally();
  const { replace } = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  function finish() {
    markOnboarded();
    replace("/");
  }

  function startWithTemplate() {
    // On failure the shared toast shows and onboarding stays open.
    const { emoji, name } = firstRallyTemplates[selectedIndex];
    saveRally({ emoji, name: t(name) }, { onSuccess: finish });
  }

  return (
    <View
      className="bg-canvas flex-1"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      {step === pickStep ? (
        <View className="flex-1 pt-6 pb-1">
          <FirstRallyPicker
            selectedIndex={selectedIndex}
            onSelect={setSelectedIndex}
            onStart={startWithTemplate}
            onMakeOwn={finish}
            isStarting={isSaving}
          />
        </View>
      ) : (
        <IntroPages
          step={step}
          onChangeStep={setStep}
          leaveLabel={t("onboarding.skip")}
          onLeave={() => setStep(pickStep)}
          finishLabel={t("onboarding.next")}
          onFinish={() => setStep(pickStep)}
        />
      )}
    </View>
  );
}
