import { useState } from "react";

import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

import { useRouter } from "expo-router";
import { useHeaderHeight } from "expo-router/react-navigation";

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

// formSheet 内では ScrollView / KeyboardAvoidingView を使わない。
// react-native-screens が ScrollView のフレームをシート全体に強制上書きし、
// 後続の兄弟（フッター）と干渉して中身が描画されなくなるため。
// キーボード表示時は iOS がシートを最大 detent に拡張するので、
// 保存ボタンを入力欄の直下に置けば常にキーボードの上に表示される。
export function CreateRallyScreen() {
  const [selectedType, setSelectedType] = useState<RallyType>(
    rallyTypeSchema.options[0],
  );
  const [name, setName] = useState("");
  const { back } = useRouter();
  const headerHeight = useHeaderHeight();
  const save = useSaveRally();

  const isNameValid = rallyNameSchema.safeParse(name).success;
  const canSave = isNameValid && !save.isPending;

  const handleSave = () => {
    if (!canSave) return;

    save.mutate({ name, type: selectedType }, { onSuccess: back });
  };

  return (
    <View
      className="bg-surface dark:bg-main-dark flex-1 px-5 pb-6"
      style={{ paddingTop: headerHeight + 16 }}
    >
      <View className="gap-6">
        <View className="gap-2">
          <Text className="text-main text-sm font-semibold dark:text-slate-100">
            タイプ
          </Text>
          <RallyTypeRadios value={selectedType} onChange={setSelectedType} />
        </View>

        <View className="gap-2">
          <Text className="text-main text-sm font-semibold dark:text-slate-100">
            名称
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            onSubmitEditing={handleSave}
            placeholder={rallyNamePlaceholders[selectedType]}
            accessibilityLabel="名称"
            returnKeyType="done"
            submitBehavior="blurAndSubmit"
            className="border-continuous border-border bg-surface-muted text-main focus:border-accent dark:bg-main-hover rounded-2xl border px-4 py-3.5 text-base dark:border-slate-700 dark:text-slate-100"
            cursorColorClassName="accent-accent"
            selectionColorClassName="accent-accent"
            placeholderTextColorClassName="accent-text-muted"
          />
        </View>
      </View>

      <Pressable
        role="button"
        accessibilityLabel={save.isPending ? "保存中…" : "保存"}
        accessibilityState={{
          disabled: !canSave,
          busy: save.isPending,
        }}
        disabled={!canSave}
        onPress={handleSave}
        className={
          canSave || save.isPending
            ? "border-continuous bg-main active:bg-main-hover mt-8 flex-row items-center justify-center gap-2 rounded-2xl py-4 dark:bg-slate-100"
            : "border-continuous bg-surface-muted-active mt-8 flex-row items-center justify-center gap-2 rounded-2xl py-4"
        }
      >
        {save.isPending ? (
          <ActivityIndicator
            size="small"
            colorClassName="accent-white dark:accent-main-dark"
          />
        ) : null}
        <Text
          className={
            canSave || save.isPending
              ? "dark:text-main-dark text-base font-semibold text-white"
              : "text-text-muted text-base font-semibold"
          }
        >
          {save.isPending ? "保存中…" : "保存"}
        </Text>
      </Pressable>
    </View>
  );
}
