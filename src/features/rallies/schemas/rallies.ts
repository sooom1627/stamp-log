import { z } from "zod";

export const rallyNameSchema = z.string().trim().min(1);
export const rallyEmojiSchema = z.string().trim().min(1);
export const rallySchema = z.object({
  id: z.number(),
  name: rallyNameSchema,
  emoji: rallyEmojiSchema,
  // Not a favorite unless set, like the column's default.
  isFavorite: z.boolean().default(false),
  // Not archived unless set, like the column's default.
  isArchived: z.boolean().default(false),
});
export const saveRallyInputSchema = rallySchema
  .pick({
    name: true,
  })
  .extend({ emoji: rallyEmojiSchema.optional() });
// The edit form never touches the favorite or the archive; the header star
// and the actions menu set them.
export const updateRallyInputSchema = rallySchema.omit({
  isFavorite: true,
  isArchived: true,
});
export const setRallyFavoriteInputSchema = rallySchema
  .pick({ id: true })
  .extend({ isFavorite: z.boolean() });
export const setRallyArchivedInputSchema = rallySchema
  .pick({ id: true })
  .extend({ isArchived: z.boolean() });

export type Rally = z.infer<typeof rallySchema>;
export type SaveRallyInput = z.infer<typeof saveRallyInputSchema>;
export type UpdateRallyInput = z.infer<typeof updateRallyInputSchema>;
export type SetRallyFavoriteInput = z.infer<typeof setRallyFavoriteInputSchema>;
export type SetRallyArchivedInput = z.infer<typeof setRallyArchivedInputSchema>;

export const defaultRallyEmoji = "✨";
