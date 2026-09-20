import { Text, useColorScheme, View } from "react-native";

import { SymbolView } from "expo-symbols";

import { type Rally, type RallyType } from "../schemas/rallies";
import { type Stamp } from "../schemas/stamps";

type CollectionSummaryProps = {
  rallies: Rally[];
  stamps: Stamp[];
};

const typeDetails = [
  {
    type: "person",
    label: "人",
    segmentClassName: "bg-accent rounded-full",
    symbol: { ios: "person.2.fill", android: "group", web: "group" },
    tintColor: "#f97316",
  },
  {
    type: "place",
    label: "場所",
    segmentClassName: "bg-main rounded-full dark:bg-slate-100",
    symbol: {
      ios: "mappin.and.ellipse",
      android: "location_on",
      web: "location_on",
    },
    tintColor: "#1e293b",
  },
  {
    type: "action",
    label: "行動",
    segmentClassName: "bg-text-muted rounded-full dark:bg-slate-400",
    symbol: {
      ios: "figure.walk",
      android: "directions_run",
      web: "directions_run",
    },
    tintColor: "#64748b",
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
            今月 +{monthCount}
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
              className={detail.segmentClassName}
              style={{ flexBasis: 0, flexGrow: count }}
              testID="collection-segment"
            />
          ) : null;
        })}
      </View>

      <View className="flex-row items-center justify-between">
        {typeDetails.map((detail) => (
          <View key={detail.type} className="flex-row items-center gap-1.5">
            <SymbolView
              name={detail.symbol}
              size={15}
              tintColor={
                isDark && detail.type === "place" ? "#f1f5f9" : detail.tintColor
              }
            />
            <Text
              className="text-main-hover text-sm font-medium dark:text-slate-200"
              style={{ fontVariant: ["tabular-nums"] }}
            >
              {typeCounts[detail.type]}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
