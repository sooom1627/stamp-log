import { Text, View } from "react-native";

import { type Rally } from "@/shared/schemas/rallies";
import { formatMediumDate } from "@/shared/utils/format-medium-date";
import { formatStampCount } from "@/shared/utils/format-stamp-count";

import { CardDisc, CardNumber, TopCard } from "./top-card";

const MAX_EMOJIS = 6;

type WithAtoCardProps = {
  days: number;
  firstStampedAt: Date | null;
  stampCount: number;
  // Every rally made, in home's tile order, archived ones after.
  rallies: Rally[];
  width: number;
  position: string;
};

function formatRallyCount(count: number) {
  return `${count} ${count === 1 ? "rally" : "rallies"}`;
}

// The second of home's top cards: the days since the first stamp and what
// has been collected so far. Not about today, so it keeps off the accent.
export function WithAtoCard({
  days,
  firstStampedAt,
  stampCount,
  rallies,
  width,
  position,
}: WithAtoCardProps) {
  const since = firstStampedAt
    ? `since ${formatMediumDate(firstStampedAt)}`
    : undefined;
  const dayText = `${days} ${days === 1 ? "day" : "days"}`;
  const spoken = [
    "With Ato",
    since ? `${dayText} ${since}` : dayText,
    formatStampCount(stampCount),
    formatRallyCount(rallies.length),
    position,
  ].join(", ");

  return (
    <TopCard
      label="With Ato"
      detail={since}
      tone="sand"
      spokenLabel={spoken}
      width={width}
      testID="with-ato-card"
    >
      <View className="flex-1 flex-row items-center gap-3">
        <View className="flex-1 gap-2">
          <CardNumber value={String(days)} unit={days === 1 ? "day" : "days"} />
          <View className="flex-row gap-3.5">
            <Text className="text-foreground-secondary text-[13px]">
              {formatStampCount(stampCount)}
            </Text>
            <Text className="text-foreground-secondary text-[13px]">
              {formatRallyCount(rallies.length)}
            </Text>
          </View>
        </View>
        <CardDisc>
          <View
            className="w-16 flex-row flex-wrap justify-center gap-0.5"
            testID="with-ato-emojis"
          >
            {rallies.slice(0, MAX_EMOJIS).map((rally) => (
              <Text key={rally.id} className="w-5 text-center text-base">
                {rally.emoji}
              </Text>
            ))}
          </View>
        </CardDisc>
      </View>
    </TopCard>
  );
}
