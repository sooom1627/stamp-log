import { type RallyType } from "../schemas/rallies";

export const rallyTypeLabels: Record<RallyType, string> = {
  place: "場所",
  action: "行動",
  person: "人",
};

export const rallyNamePlaceholders: Record<RallyType, string> = {
  place: "記録したい場所を入力",
  action: "記録したい行動を入力",
  person: "記録したい人を入力",
};
