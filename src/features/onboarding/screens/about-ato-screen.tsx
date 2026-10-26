import { useState } from "react";

import { View } from "react-native";

import { useRouter } from "expo-router";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import { IntroPages } from "../components/intro-pages";

// The intro pages again, opened from Settings. Only shows: no first rally,
// and the onboarding state stays as it is.
export function AboutAtoScreen() {
  const [step, setStep] = useState(0);
  const { back } = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View
      className="bg-canvas flex-1"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <IntroPages
        step={step}
        onChangeStep={setStep}
        leaveLabel="Close"
        onLeave={back}
        finishLabel="Done"
        onFinish={back}
      />
    </View>
  );
}
