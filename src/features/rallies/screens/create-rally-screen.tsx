import { useState } from "react";

import { Pressable, Text, TextInput, View } from "react-native";

import { useRouter } from "expo-router";

import { RallyTypeRadios } from "../components/rally-type-radios";
import { rallyNamePlaceholders } from "../constants/rallies-constants";
import { useSaveRally } from "../hooks/use-rallies";
import {
  rallyNameSchema,
  rallyTypeSchema,
  type RallyType,
} from "../schemas/rallies";

export function CreateRallyScreen() {
  const [selectedType, setSelectedType] = useState<RallyType>(
    rallyTypeSchema.options[0],
  );
  const [name, setName] = useState("");
  const router = useRouter();
  const save = useSaveRally();

  const isNameValid = rallyNameSchema.safeParse(name).success;
  const canSave = isNameValid && !save.isPending;

  return (
    <View style={{ flex: 1, padding: 16, gap: 16 }}>
      <Text role="heading" style={{ fontSize: 20, fontWeight: "600" }}>
        ラリーを作る
      </Text>

      <RallyTypeRadios value={selectedType} onChange={setSelectedType} />

      <TextInput
        value={name}
        onChangeText={setName}
        placeholder={rallyNamePlaceholders[selectedType]}
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
        onPress={() =>
          save.mutate(
            { name, type: selectedType },
            { onSuccess: () => router.back() },
          )
        }
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
