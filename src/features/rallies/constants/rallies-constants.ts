import { type RallyType } from "../schemas/rallies";

export const rallyTypeLabels: Record<RallyType, string> = {
  place: "場所",
  action: "行動",
  person: "人",
};

export const deleteRallyLabel = "削除";
export const cancelLabel = "キャンセル";
export const deleteRallyConfirmTitle = "ラリーを削除しますか？";
export const deleteRallyConfirmMessage = "この操作は取り消せません。";

export const rallyNamePlaceholders: Record<RallyType, string> = {
  place: "記録したい場所を入力",
  action: "記録したい行動を入力",
  person: "記録したい人を入力",
};

export const pressStampLabel = "スタンプを押す";
export const addMemoPrompt = "メモを追加しますか？";
export const addMemoActionLabel = "メモを追加";
export const addMemoTitle = "メモを追加";
export const memoPlaceholder = "メモを入力";
export const saveFailedMessage =
  "保存できませんでした。もう一度お試しください。";
