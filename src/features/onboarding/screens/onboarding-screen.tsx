import { useState } from "react";

import { Pressable, Text, View } from "react-native";

import { useRouter } from "expo-router";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useSaveRally } from "@/features/rallies/hooks/use-rallies";
import { AtoMark } from "@/shared/components/ato-mark";
import { ChevronLeft, ChevronRight, Lock } from "@/shared/components/icons";

import {
  FirstRallyPicker,
  firstRallyTemplates,
} from "../components/first-rally-picker";
import { introArt } from "../components/intro-art";
import { markOnboarded } from "../db/onboarding-state";

const introPages = [
  {
    title: "Look back. It's all there.",
    body: "Stamp what you collect, when it happens. Your days add up on their own.",
  },
  {
    title: "Collect anything — people, places, moments",
    body: "A rally is anything you want to count: cafés, hikes, friends, books.",
  },
  {
    title: "One tap. That's it.",
    body: "Tap ＋ on a rally to save the date and time. Add a memo or photos later, if you want.",
  },
  {
    title: "No streaks to keep.",
    body: "Skip a day, a week, a month. Nothing breaks, and what you stamped stays.",
  },
] as const;

// The step after the intro pages.
const pickStep = introPages.length;

// First launch only (S-047): four intro pages, then the first rally.
export function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { mutate: saveRally, isPending: isSaving } = useSaveRally();
  const { replace } = useRouter();
  const insets = useSafeAreaInsets();

  function finish() {
    markOnboarded();
    replace("/");
  }

  function startWithTemplate() {
    // On failure the shared toast shows and onboarding stays open.
    saveRally(firstRallyTemplates[selectedIndex], { onSuccess: finish });
  }

  return (
    <View
      className="bg-canvas flex-1 px-6"
      style={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 16 }}
    >
      {step === pickStep ? (
        <View className="flex-1 pt-12">
          <FirstRallyPicker
            selectedIndex={selectedIndex}
            onSelect={setSelectedIndex}
            onStart={startWithTemplate}
            onMakeOwn={finish}
            isStarting={isSaving}
          />
        </View>
      ) : (
        <IntroPage
          step={step}
          onBack={() => setStep(step - 1)}
          onNext={() => setStep(step + 1)}
          onSkip={() => setStep(pickStep)}
        />
      )}
    </View>
  );
}

type IntroPageProps = {
  step: number;
  onBack: () => void;
  onNext: () => void;
  onSkip: () => void;
};

function IntroPage({ step, onBack, onNext, onSkip }: IntroPageProps) {
  const { title, body } = introPages[step];
  const Art = introArt[step];

  return (
    <View className="flex-1">
      <View className="items-end">
        <Pressable
          role="button"
          onPress={onSkip}
          className="min-h-11 justify-center px-2 active:opacity-70"
        >
          <Text className="text-foreground-secondary text-base font-medium">
            Skip
          </Text>
        </Pressable>
      </View>
      <View className="flex-1 items-center justify-center">
        <Art />
      </View>
      <View className="gap-3 pb-8">
        {step === 0 ? (
          <View className="flex-row items-center gap-2">
            <AtoMark size={32} />
            <Text className="text-foreground text-lg font-bold">Ato</Text>
          </View>
        ) : null}
        <Text
          role="heading"
          className="text-foreground text-3xl leading-9 font-bold"
        >
          {title}
        </Text>
        <Text className="text-foreground-secondary text-base">{body}</Text>
        {step === 0 ? (
          <View className="flex-row items-center gap-1.5">
            <Lock colorClassName="accent-foreground-muted" size={14} />
            <Text className="text-foreground-muted text-sm">
              No account. Everything stays on your phone.
            </Text>
          </View>
        ) : null}
      </View>
      <View className="flex-row items-center justify-between">
        <View
          role="img"
          aria-label={`Page ${step + 1} of ${introPages.length}`}
          className="flex-row gap-1.5"
        >
          {introPages.map((page, index) => (
            <View
              key={page.title}
              className={
                index === step
                  ? "bg-foreground h-1.5 w-5 rounded-full"
                  : "bg-surface-muted-active size-1.5 rounded-full"
              }
            />
          ))}
        </View>
        <View className="flex-row gap-2">
          {step > 0 ? (
            <Pressable
              role="button"
              aria-label="Back"
              onPress={onBack}
              className="bg-surface size-12 items-center justify-center rounded-full active:opacity-70"
            >
              <ChevronLeft colorClassName="accent-foreground" size={20} />
            </Pressable>
          ) : null}
          <Pressable
            role="button"
            aria-label="Next"
            onPress={onNext}
            className="bg-primary active:bg-main-hover h-12 flex-row items-center gap-1 rounded-full pr-4 pl-5"
          >
            <Text className="text-primary-foreground text-base font-semibold">
              Next
            </Text>
            <ChevronRight
              colorClassName="accent-primary-foreground"
              size={18}
            />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
