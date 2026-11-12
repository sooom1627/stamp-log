import { Pressable, Text, View } from "react-native";

import { Link, type Href } from "expo-router";

import { useTranslation } from "react-i18next";

import { ShareIcon } from "./icons";

type ShareRowProps = {
  /** The stamp count, e.g. `38 stamps`. */
  count: string;
  /** What follows the count, e.g. `since Mar 2` or `6 rallies`. */
  detail: string;
  /** The share sheet `Share` opens. */
  href: Href;
};

// The line under the calendar days on rally detail and Logs: what will be
// shared on the left, Share on the right (DESIGN.md Components 共有の行).
export function ShareRow({ count, detail, href }: ShareRowProps) {
  const { t } = useTranslation();

  return (
    <View
      testID="share-row"
      className="border-border flex-row items-center gap-2 border-t pt-3"
    >
      <Text className="text-foreground-muted text-footnote flex-1">
        <Text className="text-foreground font-semibold">{count}</Text>
        {` · ${detail}`}
      </Text>
      <Link href={href} asChild>
        <Pressable
          role="button"
          aria-label={t("share.title")}
          className="min-h-11 flex-row items-center gap-1"
        >
          <ShareIcon colorClassName="accent-foreground" size={16} />
          <Text className="text-foreground text-footnote font-semibold">
            {t("share.share")}
          </Text>
        </Pressable>
      </Link>
    </View>
  );
}
