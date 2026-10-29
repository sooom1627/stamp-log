import { Pressable, Text, View } from "react-native";

import { useTranslation } from "react-i18next";

import { AtoMark } from "@/shared/components/ato-mark";
import { ChevronLeft, ChevronRight, Lock } from "@/shared/components/icons";
import { SwipePages } from "@/shared/components/swipe-pages";

import { introArt } from "./intro-art";

// The four intro pages (S-047): shown on first launch, and again from
// Settings. Sizes follow the design canvas (390 × 844).
export const introPages = [
  {
    key: "look-back",
    title: "onboarding.lookBackTitle",
    body: "onboarding.lookBackBody",
  },
  {
    key: "collect",
    title: "onboarding.collectTitle",
    body: "onboarding.collectBody",
  },
  {
    key: "one-tap",
    title: "onboarding.oneTapTitle",
    body: "onboarding.oneTapBody",
  },
  {
    key: "no-streaks",
    title: "onboarding.noStreaksTitle",
    body: "onboarding.noStreaksBody",
  },
] as const;

const introPageKeys = introPages.map((page) => page.key);
type IntroPageKey = (typeof introPageKeys)[number];

type IntroPagesProps = {
  step: number;
  onChangeStep: (step: number) => void;
  // The top-right button: Skip on first launch, Close from Settings.
  leaveLabel: string;
  onLeave: () => void;
  // The main button on the last page, and what it does.
  finishLabel: string;
  onFinish: () => void;
};

// Swipe between the pages, or use Next and Back. Next on the last page
// finishes: on to the first rally, or back to Settings.
export function IntroPages({
  step,
  onChangeStep,
  leaveLabel,
  onLeave,
  finishLabel,
  onFinish,
}: IntroPagesProps) {
  const { t } = useTranslation();
  const isLastPage = step === introPages.length - 1;
  const nextLabel = isLastPage ? finishLabel : t("onboarding.next");

  return (
    <View className="flex-1 pb-1.5">
      <View className="items-end px-4">
        <Pressable
          role="button"
          onPress={onLeave}
          className="min-h-11 justify-center px-3.5 active:opacity-70"
        >
          <Text className="text-foreground-muted text-[15px] font-semibold">
            {leaveLabel}
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
          aria-label={t("onboarding.page", {
            n: step + 1,
            total: introPages.length,
          })}
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
              aria-label={t("onboarding.back")}
              onPress={() => onChangeStep(step - 1)}
              className="bg-surface size-[52px] items-center justify-center rounded-full active:opacity-70"
            >
              <ChevronLeft colorClassName="accent-foreground" size={20} />
            </Pressable>
          ) : null}
          <Pressable
            role="button"
            aria-label={nextLabel}
            onPress={isLastPage ? onFinish : () => onChangeStep(step + 1)}
            className="bg-primary active:bg-main-hover h-13 flex-row items-center gap-2 rounded-full pr-[22px] pl-[26px]"
          >
            <Text className="text-primary-foreground text-base font-semibold">
              {nextLabel}
            </Text>
            {!isLastPage ? (
              <ChevronRight
                colorClassName="accent-primary-foreground"
                size={18}
              />
            ) : null}
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function IntroPage({ pageKey }: { pageKey: IntroPageKey }) {
  const index = introPageKeys.indexOf(pageKey);
  const { title, body } = introPages[index];
  const { t } = useTranslation();
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
          {t(title)}
        </Text>
        <Text className="text-foreground-muted text-base leading-[23px]">
          {t(body)}
        </Text>
        {index === 0 ? (
          <View className="flex-row items-center gap-1.5">
            <Lock colorClassName="accent-foreground-muted" size={14} />
            <Text className="text-foreground-muted text-[13px]">
              {t("onboarding.noAccount")}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}
