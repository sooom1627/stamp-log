import { Text, View } from "react-native";

import { formatStampCount } from "@/shared/utils/format-stamp-count";

import { type Rally } from "../schemas/rallies";

const spokenDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});
const monthFormatter = new Intl.DateTimeFormat("en-US", { month: "short" });

function spokenLabel(rallies: Rally[], today: Date) {
  const date = `Today, ${spokenDateFormatter.format(today)}`;
  if (rallies.length === 0) return `${date}, no stamps yet`;
  const names = rallies.map((rally) => rally.name).join(", ");
  return `${date}, ${formatStampCount(rallies.length)}: ${names}`;
}

// A fixed tilt per date (-4° to 4°) so a day keeps its angle across renders.
function tiltFor(date: Date) {
  return `${((date.getDate() * 7) % 9) - 4}deg`;
}

function DateStamp({ today, isInked }: { today: Date; isInked: boolean }) {
  return (
    <View
      className={
        isInked
          ? "border-accent bg-background size-20 items-center justify-center rounded-full border-[1.5px]"
          : "size-20 items-center justify-center"
      }
      style={isInked ? { transform: [{ rotate: tiltFor(today) }] } : undefined}
    >
      {isInked ? null : (
        <View className="border-foreground-muted absolute inset-0 rounded-full border-[1.5px] border-dashed opacity-40" />
      )}
      <Text
        className={
          isInked
            ? "text-accent-strong text-[10px] font-bold tracking-widest"
            : "text-foreground-muted text-[10px] font-bold tracking-widest"
        }
      >
        {monthFormatter.format(today).toUpperCase()}
      </Text>
      <Text
        className={
          isInked
            ? "text-accent-strong text-3xl leading-8 font-bold"
            : "text-foreground-muted text-3xl leading-8 font-bold"
        }
      >
        {today.getDate()}
      </Text>
    </View>
  );
}

type TodayCardProps = {
  rallies: Rally[];
  today: Date;
};

// Today's date stamp with the rallies stamped today, first stamped first.
export function TodayCard({ rallies, today }: TodayCardProps) {
  const isInked = rallies.length > 0;

  return (
    <View
      accessible
      aria-label={spokenLabel(rallies, today)}
      className="bg-accent-subtle border-continuous mb-4 flex-row items-center gap-4 rounded-3xl px-5 py-4"
      testID="today-card"
    >
      <DateStamp today={today} isInked={isInked} />
      {isInked ? (
        <View className="flex-1 gap-2">
          <Text className="text-foreground text-base font-semibold">
            {`${formatStampCount(rallies.length)} today`}
          </Text>
          <View className="flex-row flex-wrap gap-1.5">
            {rallies.map((rally) => (
              <View
                key={rally.id}
                className="bg-background flex-row items-center gap-1 rounded-full py-1 pr-2.5 pl-1.5"
                testID="today-rally"
              >
                <Text className="text-sm">{rally.emoji}</Text>
                <Text
                  className="text-foreground-secondary text-sm"
                  numberOfLines={1}
                >
                  {rally.name}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ) : (
        <View className="flex-1 gap-1">
          <Text className="text-foreground text-base font-semibold">
            No stamps yet today
          </Text>
          <Text className="text-foreground-secondary text-sm">
            What you stamp today shows up here.
          </Text>
        </View>
      )}
    </View>
  );
}
