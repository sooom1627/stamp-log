import { z } from "zod";

export const rallyTypeSchema = z.enum(["place", "action", "person"]);
export const rallyNameSchema = z.string().trim().min(1);
export const rallySchema = z.object({
  id: z.number(),
  name: rallyNameSchema,
  type: rallyTypeSchema,
});
export const saveRallyInputSchema = rallySchema.pick({
  name: true,
  type: true,
});

export type RallyType = z.infer<typeof rallyTypeSchema>;
export type Rally = z.infer<typeof rallySchema>;
export type SaveRallyInput = z.infer<typeof saveRallyInputSchema>;

export const rallyTypeLabels: Record<RallyType, string> = {
  place: "場所",
  action: "行動",
  person: "人",
};
