import { z } from "zod";

export const rallyNameSchema = z.string().trim().min(1);
export const rallyEmojiSchema = z.string().trim().min(1);
export const rallySchema = z.object({
  id: z.number(),
  name: rallyNameSchema,
  emoji: rallyEmojiSchema,
  // Not a favorite unless set, like the column's default.
  isFavorite: z.boolean().default(false),
});
export const saveRallyInputSchema = rallySchema
  .pick({
    name: true,
  })
  .extend({ emoji: rallyEmojiSchema.optional() });
// The edit form never touches the favorite; the header star sets it.
export const updateRallyInputSchema = rallySchema.omit({ isFavorite: true });
export const setRallyFavoriteInputSchema = rallySchema
  .pick({ id: true })
  .extend({ isFavorite: z.boolean() });

export type Rally = z.infer<typeof rallySchema>;
export type SaveRallyInput = z.infer<typeof saveRallyInputSchema>;
export type UpdateRallyInput = z.infer<typeof updateRallyInputSchema>;
export type SetRallyFavoriteInput = z.infer<typeof setRallyFavoriteInputSchema>;

export const defaultRallyEmoji = "✨";
