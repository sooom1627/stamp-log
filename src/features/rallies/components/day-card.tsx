import { Children, type ReactNode } from "react";

import { Text, View } from "react-native";

import { formatDayHeading } from "@/shared/utils/format-stamp-date-time";

type DayCardProps = {
  dateKey: string;
  date: Date;
  // The day's posts, newest first. Lines separate them on the card.
  children: ReactNode;
};

// One day of a timeline: the day heading above a card holding its posts.
export function DayCard({ dateKey, date, children }: DayCardProps) {
  const { title, detail } = formatDayHeading(date);

  return (
    <View testID={`day-section-${dateKey}`} className="gap-2">
      <View className="flex-row items-baseline justify-between px-1">
        <Text
          role="heading"
          className="text-foreground text-base font-semibold"
        >
          {title}
        </Text>
        {detail ? (
          <Text className="text-foreground-muted text-sm">{detail}</Text>
        ) : null}
      </View>
      <View
        testID={`day-card-${dateKey}`}
        className="bg-surface border-continuous rounded-2xl px-4"
      >
        {Children.map(children, (post, index) => (
          <View
            className={index === 0 ? "py-3" : "border-border border-t py-3"}
          >
            {post}
          </View>
        ))}
      </View>
    </View>
  );
}
