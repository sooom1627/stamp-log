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
    <View className="items-center gap-1">
      <Text selectable>{name}</Text>
      <Text>{typeLabel}</Text>
      <Pressable
        role="button"
        aria-label={`${name}にスタンプを押す`}
        onPress={onPressStamp}
      >
        <Text>スタンプを押す</Text>
      </Pressable>
      {stampLabels.map((stamp) => (
        <View key={stamp.id} className="flex-row items-center gap-2">
          <Text>{stamp.label}</Text>
          {stamp.memo ? <Text>{stamp.memo}</Text> : null}
        </View>
      ))}
      <Pressable role="button" aria-label={`${name}を削除`} onPress={onDelete}>
        <Text className="text-red-500">削除</Text>
      </Pressable>
    </View>
  );
}
