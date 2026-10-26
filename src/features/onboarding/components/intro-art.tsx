import { Text, View } from "react-native";

import { ArtPanel } from "./art-panel";
import { TryStampArt } from "./try-stamp-art";

// Pictures for the four intro pages (S-047), drawn after the design canvas.
// Views, not images, so they follow the theme; they only show, never save.

const shortMonthFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
});

// A month of dots with a few stamps, and today waiting for one.
const stampedCells = new Map([
  [7, { emoji: "🏃", rotation: "-8deg" }],
  [16, { emoji: "☕", rotation: "6deg" }],
  [20, { emoji: "📚", rotation: "-4deg" }],
  [25, { emoji: "🔬", rotation: "8deg" }],
  [31, { emoji: "⛰️", rotation: "-6deg" }],
]);
const todayCell = 34;
const gridRows = [0, 1, 2, 3, 4, 5];

function StampedMonthArt() {
  const today = new Date();

  return (
    <ArtPanel className="px-[22px] py-7">
      {/* Rows and cells share the space evenly, like the canvas's 6 × 6 grid. */}
      {gridRows.map((row) => (
        <View key={row} className="flex-1 flex-row">
          {gridRows.map((column) => {
            const cell = row * gridRows.length + column;
            const stamp = stampedCells.get(cell);
            return (
              <View key={cell} className="flex-1 items-center justify-center">
                {stamp ? (
                  <View
                    className="bg-accent-soft size-[42px] items-center justify-center rounded-full"
                    style={{ transform: [{ rotate: stamp.rotation }] }}
                  >
                    <Text className="text-[21px]">{stamp.emoji}</Text>
                  </View>
                ) : cell === todayCell ? (
                  <View className="border-accent size-[42px] items-center justify-center rounded-full border-2 border-dashed">
                    <Text className="text-accent-strong text-[8px] leading-[9px] font-bold tracking-wider">
                      {shortMonthFormatter.format(today).toUpperCase()}
                    </Text>
                    <Text className="text-accent-strong text-sm leading-4 font-bold">
                      {today.getDate()}
                    </Text>
                  </View>
                ) : (
                  <View className="bg-foreground-muted size-1.5 rounded-full opacity-40" />
                )}
              </View>
            );
          })}
        </View>
      ))}
    </ArtPanel>
  );
}

// Example rallies in offset rows, a few of them lit.
const chipRows = [
  {
    offset: -40,
    chips: [
      ["🔬", "Researchers I met"],
      ["☕", "Cafés", true],
      ["🗼", "Towers"],
    ],
  },
  {
    offset: 10,
    chips: [
      ["🏃", "Morning run"],
      ["📚", "Books I read"],
      ["🍜", "Ramen"],
    ],
  },
  {
    offset: -70,
    chips: [
      ["🤝", "Old friends"],
      ["⛰️", "Hikes", true],
      ["🎬", "Movies"],
    ],
  },
  {
    offset: -18,
    chips: [
      ["🌊", "Beaches"],
      ["🎨", "Museums"],
      ["✈️", "Trips"],
    ],
  },
] as const;

function ExampleRalliesArt() {
  return (
    <ArtPanel className="justify-center gap-3.5">
      {chipRows.map((row) => (
        <View
          key={row.offset}
          className="flex-row gap-2.5"
          style={{ marginLeft: row.offset }}
        >
          {row.chips.map(([emoji, name, isLit]) => (
            <View
              key={name}
              className={`h-[46px] flex-row items-center gap-2 rounded-full pr-4 pl-1.5 ${
                isLit ? "bg-accent-subtle" : "bg-surface-muted"
              }`}
            >
              <View className="bg-accent-soft size-[34px] items-center justify-center rounded-full">
                <Text className="text-lg">{emoji}</Text>
              </View>
              <Text className="text-foreground text-[15px] font-semibold">
                {name}
              </Text>
            </View>
          ))}
        </View>
      ))}
    </ArtPanel>
  );
}

// One rally's stamps by date. The gaps between them are only space: no
// streak, no count of missed days.
const hikes = [
  { date: "Aug 3", memo: "First climb of the summer." },
  { date: "Aug 17", memo: "Rain. Turned back halfway.", gapBefore: 10 },
  { date: "Sep 28", memo: "Clear view from the top.", gapBefore: 44 },
  { date: "Oct 25", memo: "A short walk. Still counts.", gapBefore: 22 },
];

function StampTrail({
  isFirst,
  isLast,
}: {
  isFirst: boolean;
  isLast: boolean;
}) {
  return (
    <View className="w-[34px] items-center">
      <View className={`h-2 w-0.5 ${isFirst ? "" : "bg-border"}`} />
      <View className="bg-accent-soft size-[34px] items-center justify-center rounded-full">
        <Text className="text-lg">⛰️</Text>
      </View>
      <View className={`w-0.5 flex-1 ${isLast ? "" : "bg-border"}`} />
    </View>
  );
}

function QuietTrailArt() {
  return (
    <ArtPanel className="gap-4 px-5 py-[22px]">
      <View className="flex-row items-center gap-3">
        <View className="bg-accent-soft border-continuous size-12 items-center justify-center rounded-[14px]">
          <Text className="text-[26px]">⛰️</Text>
        </View>
        <View>
          <Text className="text-foreground text-[17px] font-semibold">
            Hikes
          </Text>
          <Text className="text-foreground-muted text-sm">4 stamps</Text>
        </View>
      </View>
      <View className="bg-border h-px" />
      <View>
        {hikes.map((hike, index) => (
          <View key={hike.date}>
            {hike.gapBefore ? (
              <View className="flex-row" style={{ height: hike.gapBefore }}>
                <View className="w-13" />
                <View className="w-[34px] items-center">
                  <View className="bg-border w-0.5 flex-1" />
                </View>
              </View>
            ) : null}
            <View className="flex-row gap-0">
              <Text className="text-foreground-muted w-13 pt-[17px] text-[13px] font-medium">
                {hike.date}
              </Text>
              <StampTrail
                isFirst={index === 0}
                isLast={index === hikes.length - 1}
              />
              <Text className="text-foreground-secondary flex-1 pt-[17px] pl-3 text-sm">
                {hike.memo}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </ArtPanel>
  );
}

export const introArt = [
  StampedMonthArt,
  ExampleRalliesArt,
  TryStampArt,
  QuietTrailArt,
] as const;
