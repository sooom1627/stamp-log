import { useState } from "react";

import { Pressable, Text, View } from "react-native";

import { useRouter } from "expo-router";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useSaveRally } from "@/features/rallies/hooks/use-rallies";
import { AtoMark } from "@/shared/components/ato-mark";
import { ChevronLeft, ChevronRight, Lock } from "@/shared/components/icons";
import { SwipePages } from "@/shared/components/swipe-pages";

import {
  FirstRallyPicker,
  firstRallyTemplates,
} from "../components/first-rally-picker";
import { introArt } from "../components/intro-art";
import { markOnboarded } from "../db/onboarding-state";

const introPages = [
  {
    key: "look-back",
    title: "Look back.\nIt's all there.",
    body: "Stamp what you collect, when it happens. Your days add up on their own.",
  },
  {
    key: "collect",
    title: "Collect anything —\npeople, places, moments",
    body: "A rally is anything you want to count: cafés, hikes, friends, books.",
  },
  {
    key: "one-tap",
    title: "One tap.\nThat's it.",
    body: "Tap ＋ on a rally to save the date and time. Add a memo or photos later, if you want.",
  },
  {
    key: "no-streaks",
    title: "No streaks\nto keep.",
    body: "Skip a day, a week, a month. Nothing breaks, and what you stamped stays.",
  },
] as const;

const introPageKeys = introPages.map((page) => page.key);
type IntroPageKey = (typeof introPageKeys)[number];

// The step after the intro pages.
const pickStep = introPages.length;

// First launch only (S-047): four intro pages, then the first rally. Sizes
// follow the design canvas (390 × 844).
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
          onSkip={() => setStep(pickStep)}
        />
      )}
    </View>
  );
}

type IntroPagesProps = {
  step: number;
  onChangeStep: (step: number) => void;
  onSkip: () => void;
};

// Swipe between the pages, or use Next and Back. Next on the last page goes on
// to the first rally.
function IntroPages({ step, onChangeStep, onSkip }: IntroPagesProps) {
  return (
    <View className="flex-1 pb-1.5">
      <View className="items-end px-4">
        <Pressable
          role="button"
          onPress={onSkip}
          className="min-h-11 justify-center px-3.5 active:opacity-70"
        >
          <Text className="text-foreground-muted text-[15px] font-semibold">
            Skip
          </Text>
        </Pressable>
      </View>
      <SwipePages
        testID="intro-pages"
        values={introPageKeys}
        value={introPageKeys[step]}
        onChange={(key) => onChangeStep(introPageKeys.indexOf(key))}
        renderPage={(key) => <IntroPage pageKey={key} />}
      />
      <View className="flex-row items-center justify-between px-6 pt-4">
        <View
          role="img"
          aria-label={`Page ${step + 1} of ${introPages.length}`}
          className="flex-row items-center gap-1.5"
        >
          {introPages.map((page, index) => (
            <View
              key={page.key}
              className={
                index === step
                  ? "bg-foreground h-1.5 w-[22px] rounded-full"
                  : "bg-foreground-muted size-1.5 rounded-full opacity-40"
              }
            />
          ))}
        </View>
        <View className="flex-row gap-2">
          {step > 0 ? (
            <Pressable
              role="button"
              aria-label="Back"
              onPress={() => onChangeStep(step - 1)}
              className="bg-surface size-[52px] items-center justify-center rounded-full active:opacity-70"
            >
              <ChevronLeft colorClassName="accent-foreground" size={20} />
            </Pressable>
          ) : null}
          <Pressable
            role="button"
            aria-label="Next"
            onPress={() => onChangeStep(step + 1)}
            className="bg-primary active:bg-main-hover h-13 flex-row items-center gap-2 rounded-full pr-[22px] pl-[26px]"
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

function IntroPage({ pageKey }: { pageKey: IntroPageKey }) {
  const index = introPageKeys.indexOf(pageKey);
  const { title, body } = introPages[index];
  const Art = introArt[index];

  return (
    <View className="flex-1">
      <View className="mt-1 max-h-100 flex-1 px-4">
        <Art />
      </View>
      <View className="mt-8 gap-3 px-6">
        {index === 0 ? (
          <View className="flex-row items-center gap-2.5">
            <AtoMark size={32} />
            <Text className="text-foreground text-[15px] font-bold">Ato</Text>
          </View>
        ) : null}
        <Text
          role="heading"
          className="text-foreground text-[32px] leading-9 font-bold"
        >
          {title}
        </Text>
        <Text className="text-foreground-muted text-base leading-[23px]">
          {body}
        </Text>
        {index === 0 ? (
          <View className="flex-row items-center gap-1.5">
            <Lock colorClassName="accent-foreground-muted" size={14} />
            <Text className="text-foreground-muted text-[13px]">
              No account. Everything stays on your phone.
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}
