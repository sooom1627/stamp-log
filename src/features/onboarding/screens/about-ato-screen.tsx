import { useState } from "react";

import { View } from "react-native";

import { useRouter } from "expo-router";

import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { IntroPages } from "../components/intro-pages";

// The intro pages again, opened from Settings. Only shows: no first rally,
// and the onboarding state stays as it is.
export function AboutAtoScreen() {
  const [step, setStep] = useState(0);
  const { back } = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <View
      className="bg-canvas flex-1"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <IntroPages
        step={step}
        onChangeStep={setStep}
        leaveLabel={t("common.close")}
        onLeave={() => back()}
        finishLabel={t("common.done")}
        onFinish={() => back()}
      />
    </View>
  );
}
