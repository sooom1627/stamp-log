import { Text, View } from "react-native";

import { formatDayHeading } from "@/shared/utils/format-stamp-date-time";

type DaySectionHeadingProps = {
  dateKey: string;
  date: Date;
};

// The sticky heading of a day in a timeline. The canvas background hides the
// posts scrolling under it.
export function DaySectionHeading({ dateKey, date }: DaySectionHeadingProps) {
  const { title, detail } = formatDayHeading(date);

  return (
    <View
      testID={`day-section-${dateKey}`}
      className="bg-canvas flex-row items-baseline justify-between pt-4 pb-3"
    >
      <Text role="heading" className="text-foreground text-base font-semibold">
        {title}
      </Text>
      {detail ? (
        <Text className="text-foreground-muted text-sm">{detail}</Text>
      ) : null}
    </View>
  );
}
