import { useState } from "react";

import { Pressable, Text, TextInput, View } from "react-native";

import { useRouter } from "expo-router";

import { RallyTypeRadios } from "../components/rally-type-radios";
import { useSaveRally } from "../hooks/use-rallies";
import {
  rallyNameSchema,
  rallyTypeSchema,
  type RallyType,
} from "../schemas/rallies";

const rallyNamePlaceholders: Record<RallyType, string> = {
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
  const save = useSaveRally();

  const isNameValid = rallyNameSchema.safeParse(name).success;
  const canSave = isNameValid && !save.isPending;

  return (
    <View className="flex-1 gap-4 p-4">
      <Text role="heading" className="text-xl font-semibold">
        ラリーを作る
      </Text>

      <RallyTypeRadios value={selectedType} onChange={setSelectedType} />

      <TextInput
        value={name}
        onChangeText={setName}
        placeholder={rallyNamePlaceholders[selectedType]}
        autoFocus
        className="border-continuous rounded-[10px] border border-[#c6c6c8] p-3 text-base"
      />
      <Pressable
        role="button"
        disabled={!canSave}
        onPress={() =>
          save.mutate(
            { name, type: selectedType },
            { onSuccess: () => router.back() },
          )
        }
        className="border-continuous items-center rounded-[10px] bg-[#007aff] py-3.5 disabled:opacity-50"
      >
        <Text className="text-base font-semibold text-white">保存</Text>
      </Pressable>
    </View>
  );
}
