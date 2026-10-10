import { z } from "zod";

export const rallyNameSchema = z.string().trim().min(1);
export const rallyEmojiSchema = z.string().trim().min(1);
export const rallySchema = z.object({
  id: z.number(),
  name: rallyNameSchema,
  emoji: rallyEmojiSchema,
});
export const saveRallyInputSchema = rallySchema
  .pick({
    name: true,
  })
  .extend({ emoji: rallyEmojiSchema.optional() });
export const updateRallyInputSchema = rallySchema;

export type Rally = z.infer<typeof rallySchema>;
export type SaveRallyInput = z.infer<typeof saveRallyInputSchema>;
export type UpdateRallyInput = z.infer<typeof updateRallyInputSchema>;

export const defaultRallyEmoji = "✨";
