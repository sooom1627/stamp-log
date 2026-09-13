import { useState } from "react";

import { Pressable, Text, TextInput, View } from "react-native";

import { useRouter } from "expo-router";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { rallyNameSchema, rallyTypeSchema, type RallyType } from "../rallies";
import { saveRally } from "../rallies-db";

const RALLY_TYPE_LABELS: Record<RallyType, string> = {
  place: "場所",
  action: "行動",
  person: "人",
};

const RALLY_NAME_PLACEHOLDERS: Record<RallyType, string> = {
  place: "記録したい場所を入力",
  action: "記録したい行動を入力",
  person: "記録したい人を入力",
};

export function CreateRallyScreen() {
  const [selectedType, setSelectedType] = useState<RallyType>(
    rallyTypeSchema.options[0],
  );
  const [name, setName] = useState("");
  const router = useRouter();
  const queryClient = useQueryClient();

  const save = useMutation({
    mutationFn: () => saveRally({ name, type: selectedType }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["rallies"] });
      router.back();
    },
  });

  const isNameValid = rallyNameSchema.safeParse(name).success;
  const canSave = isNameValid && !save.isPending;

  return (
    <View style={{ flex: 1, padding: 16, gap: 16 }}>
      <Text role="heading" style={{ fontSize: 20, fontWeight: "600" }}>
        ラリーを作る
      </Text>

      <View role="radiogroup" style={{ flexDirection: "row", gap: 8 }}>
        {rallyTypeSchema.options.map((type) => {
          const isSelected = selectedType === type;
          return (
            <Pressable
              key={type}
              role="radio"
              aria-checked={isSelected}
              accessibilityLabel={RALLY_TYPE_LABELS[type]}
              onPress={() => setSelectedType(type)}
              style={{
                flex: 1,
                paddingVertical: 12,
                alignItems: "center",
                borderRadius: 10,
                borderCurve: "continuous",
                backgroundColor: isSelected ? "#007aff" : "#f2f2f7",
              }}
            >
              <Text style={{ color: isSelected ? "#ffffff" : "#000000" }}>
                {RALLY_TYPE_LABELS[type]}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <TextInput
        value={name}
        onChangeText={setName}
        placeholder={RALLY_NAME_PLACEHOLDERS[selectedType]}
        autoFocus
        style={{
          borderWidth: 1,
          borderColor: "#c6c6c8",
          borderRadius: 10,
          borderCurve: "continuous",
          padding: 12,
          fontSize: 16,
        }}
      />
      {save.isError && (
        <Text selectable style={{ color: "#ff3b30" }}>
          保存できませんでした。もう一度お試しください。
        </Text>
      )}
      <Pressable
        role="button"
        disabled={!canSave}
        onPress={() => save.mutate()}
        style={{
          paddingVertical: 14,
          alignItems: "center",
          borderRadius: 10,
          borderCurve: "continuous",
          backgroundColor: "#007aff",
          opacity: canSave ? 1 : 0.5,
        }}
      >
        <Text style={{ color: "#ffffff", fontSize: 16, fontWeight: "600" }}>
          保存
        </Text>
      </Pressable>
    </View>
  );
}
