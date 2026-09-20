import { Text, useColorScheme, View } from "react-native";

import { ListChecks, MapPinPen, UsersRound } from "lucide-react-native";

import { type Rally, type RallyType } from "../schemas/rallies";
import { type Stamp } from "../schemas/stamps";

type CollectionSummaryProps = {
  rallies: Rally[];
  stamps: Stamp[];
};

const segmentClassName = "bg-main rounded-full dark:bg-slate-100";

const typeDetails = [
  {
    type: "person",
    label: "人",
    Icon: UsersRound,
  },
  {
    type: "place",
    label: "場所",
    Icon: MapPinPen,
  },
  {
    type: "action",
    label: "行動",
    Icon: ListChecks,
  },
] as const;

function getTypeCounts(rallies: Rally[], stamps: Stamp[]) {
  const rallyTypes = new Map(rallies.map((rally) => [rally.id, rally.type]));
  const counts: Record<RallyType, number> = {
    person: 0,
    place: 0,
    action: 0,
  };

  for (const stamp of stamps) {
    const type = rallyTypes.get(stamp.rallyId);
    if (type) counts[type] += 1;
  }

  return counts;
}

export function CollectionSummary({ rallies, stamps }: CollectionSummaryProps) {
  const isDark = useColorScheme() === "dark";
  const iconColor = isDark ? "#f1f5f9" : "#1e293b";
  const now = new Date();
  const typeCounts = getTypeCounts(rallies, stamps);
  const categorizedStampCount =
    typeCounts.person + typeCounts.place + typeCounts.action;
  const monthCount = stamps.filter((stamp) => {
    const stampedAt = new Date(stamp.stampedAt);
    return (
      stampedAt.getFullYear() === now.getFullYear() &&
      stampedAt.getMonth() === now.getMonth()
    );
  }).length;
  const accessibilityLabel = `累計${stamps.length}個、今月${monthCount}個、人${typeCounts.person}個、場所${typeCounts.place}個、行動${typeCounts.action}個`;

  return (
    <View
      accessible
      accessibilityLabel={accessibilityLabel}
      className="bg-surface-muted dark:bg-main-hover mb-4 gap-3.5 rounded-2xl p-4"
      style={{ borderCurve: "continuous" }}
    >
      <View className="flex-row items-center justify-between gap-4">
        <View className="flex-row items-baseline gap-1.5">
          <Text
            className="text-main text-3xl font-semibold dark:text-slate-100"
            style={{ fontVariant: ["tabular-nums"] }}
          >
            {stamps.length}
          </Text>
          <Text className="text-text-muted text-[10px] font-semibold tracking-wider dark:text-slate-400">
            STAMPS
          </Text>
        </View>
        <View className="bg-surface dark:bg-main-dark rounded-full px-2.5 py-1">
          <Text
            className="text-text-muted text-xs font-medium dark:text-slate-300"
            style={{ fontVariant: ["tabular-nums"] }}
          >
            This month + {monthCount}
          </Text>
        </View>
      </View>

      <View
        className="bg-border h-1.5 flex-row gap-1 overflow-hidden rounded-full dark:bg-slate-700"
        testID={
          categorizedStampCount === 0 ? "collection-empty-track" : undefined
        }
      >
        {typeDetails.map((detail) => {
          const count = typeCounts[detail.type];
          return count > 0 ? (
            <View
              key={detail.type}
              className={segmentClassName}
              style={{ flexBasis: 0, flexGrow: count }}
              testID="collection-segment"
            />
          ) : null;
        })}
      </View>

      <View className="flex-row items-center justify-end gap-4">
        {typeDetails.map((detail) => {
          const { Icon } = detail;

          return (
            <View key={detail.type} className="flex-row items-center gap-1.5">
              <Icon color={iconColor} size={15} strokeWidth={2} />
              <Text
                className="text-main text-sm font-medium dark:text-slate-100"
                style={{ fontVariant: ["tabular-nums"] }}
              >
                {typeCounts[detail.type]}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
