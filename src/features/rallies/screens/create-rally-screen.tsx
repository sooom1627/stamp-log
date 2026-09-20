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

import {
  EmojiKeyboard,
  type EmojiType,
} from "@softwhere-uz/react-native-emoji-keyboard";

import { RallyTypeRadios } from "../components/rally-type-radios";
import { useSaveRally } from "../hooks/use-rallies";
import {
  rallyEmojiSchema,
  rallyNameSchema,
  rallyTypeEmojis,
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
  const [emoji, setEmoji] = useState(rallyTypeEmojis[selectedType]);
  const [isEmojiCustomized, setIsEmojiCustomized] = useState(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [name, setName] = useState("");
  const { back } = useRouter();
  const headerHeight = useHeaderHeight();
  const save = useSaveRally();

  const isNameValid = rallyNameSchema.safeParse(name).success;
  const isEmojiValid = rallyEmojiSchema.safeParse(emoji).success;
  const canSave = isNameValid && isEmojiValid && !save.isPending;

  const handleTypeChange = (type: RallyType) => {
    setSelectedType(type);
    if (!isEmojiCustomized) setEmoji(rallyTypeEmojis[type]);
  };

  const handleEmojiSelect = (selectedEmoji: EmojiType) => {
    setEmoji(selectedEmoji.emoji);
    setIsEmojiCustomized(true);
    setIsEmojiPickerOpen(false);
  };

  const handleSave = () => {
    if (!canSave) return;

    save.mutate({ name, type: selectedType, emoji }, { onSuccess: back });
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
          <RallyTypeRadios value={selectedType} onChange={handleTypeChange} />
        </View>

        <View className="gap-2">
          <Text className="text-main text-sm font-semibold dark:text-slate-100">
            絵文字
          </Text>
          <Pressable
            role="button"
            accessibilityLabel={`絵文字を選ぶ（現在 ${emoji}）`}
            onPress={() => setIsEmojiPickerOpen((isOpen) => !isOpen)}
            className="border-continuous border-border bg-surface-muted active:bg-surface-muted-active dark:bg-main-hover flex-row items-center gap-3 rounded-2xl border px-4 py-3 dark:border-slate-700"
          >
            <Text className="text-3xl">{emoji}</Text>
            <Text className="text-text-muted flex-1 text-sm dark:text-slate-400">
              タップして変更
            </Text>
          </Pressable>
          {isEmojiPickerOpen ? (
            <View className="border-continuous border-border h-80 overflow-hidden rounded-2xl border dark:border-slate-700">
              <EmojiKeyboard
                onEmojiSelected={handleEmojiSelect}
                hideHeader
                enableSearchBar
                categoryPosition="top"
                defaultHeight={320}
                disableSafeArea
              />
            </View>
          ) : null}
        </View>

        <View className="gap-2">
          <Text className="text-main text-sm font-semibold dark:text-slate-100">
            名称
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            onFocus={() => setIsEmojiPickerOpen(false)}
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
