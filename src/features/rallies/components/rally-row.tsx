import { Pressable, Text, View } from "react-native";

type StampLabel = {
  id: number;
  label: string;
  memo: string | null;
};

type RallyRowProps = {
  name: string;
  typeLabel: string;
  stampLabels: StampLabel[];
  onPressStamp: () => void;
  onDelete: () => void;
};

export function RallyRow({
  name,
  typeLabel,
  stampLabels,
  onPressStamp,
  onDelete,
}: RallyRowProps) {
  return (
    <View className="w-full gap-4 border-b border-black/10 py-5 dark:border-white/10">
      <View className="flex-row items-start justify-between gap-4">
        <View className="flex-1 gap-1">
          <Text selectable className="text-lg font-semibold">
            {name}
          </Text>
          <View className="flex-row items-center gap-2">
            <Text className="text-sm">{typeLabel}</Text>
            <Text className="text-sm">スタンプ {stampLabels.length}個</Text>
          </View>
        </View>
        <Pressable
          role="button"
          aria-label={`${name}を削除`}
          className="px-2 py-1"
          onPress={onDelete}
        >
          <Text className="text-red-500">削除</Text>
        </Pressable>
      </View>
      {stampLabels.length > 0 ? (
        <View className="gap-2">
          {stampLabels.map((stamp) => (
            <View key={stamp.id} className="flex-row items-center gap-2">
              <Text className="text-sm">{stamp.label}</Text>
              {stamp.memo ? (
                <Text className="flex-1 text-sm" numberOfLines={1}>
                  {stamp.memo}
                </Text>
              ) : null}
            </View>
          ))}
        </View>
      ) : null}
      <Pressable
        role="button"
        aria-label={`${name}にスタンプを押す`}
        className="self-start rounded-full bg-black px-4 py-2 dark:bg-white"
        onPress={onPressStamp}
      >
        <Text className="font-medium text-white dark:text-black">
          スタンプを押す
        </Text>
      </Pressable>
    </View>
  );
}
