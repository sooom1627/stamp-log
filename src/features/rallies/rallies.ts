import { z } from "zod";

export const rallyTypeSchema = z.enum(["place", "action", "person"]);
export const rallySchema = z.object({
  id: z.number(),
  name: z.string(),
  type: rallyTypeSchema,
});
export const saveRallyInputSchema = rallySchema.pick({
  name: true,
  type: true,
});

export type RallyType = z.infer<typeof rallyTypeSchema>;
export type Rally = z.infer<typeof rallySchema>;
export type SaveRallyInput = z.infer<typeof saveRallyInputSchema>;
