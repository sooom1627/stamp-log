import { z } from "zod";

import {
  localDateKey,
  localDateKeyFromIso,
} from "@/shared/utils/local-date-key";

export const maxStampPhotos = 4;

// Photos live in their own table (stamp_photos); a Stamp carries them in
// position order.
export const stampPhotoSchema = z.object({
  id: z.number(),
  stampId: z.number(),
  fileName: z.string().min(1),
  position: z.number().int().min(0),
});

export const stampSchema = z.object({
  id: z.number(),
  rallyId: z.number(),
  stampedAt: z.iso.datetime(),
  memo: z.string().nullable(),
  photos: z.array(stampPhotoSchema).max(maxStampPhotos),
});
export const notFutureDatetimeSchema = stampSchema.shape.stampedAt.refine(
  (stampedAt) => Date.parse(stampedAt) <= Date.now(),
  { message: "stampedAt must not be in the future" },
);
export const saveStampInputSchema = stampSchema
  .pick({ rallyId: true })
  .extend({ stampedAt: notFutureDatetimeSchema.optional() });
// Memo and photos added right after stamping (S-035): either one is enough.
export const updateStampMemoInputSchema = stampSchema
  .pick({ id: true })
  .extend({
    memo: z
      .string()
      .trim()
      .transform((memo) => (memo === "" ? null : memo)),
    photoUris: z.array(z.string().min(1)).max(maxStampPhotos).default([]),
  })
  .refine(({ memo, photoUris }) => memo !== null || photoUris.length > 0, {
    message: "Add a memo or photos",
  });
// The edit sheet sends the photos it keeps by id and the ones it adds by URI.
export const updateStampInputSchema = stampSchema
  .pick({ id: true })
  .extend({
    stampedAt: notFutureDatetimeSchema,
    memo: z
      .string()
      .trim()
      .transform((memo) => (memo === "" ? null : memo)),
    keptPhotoIds: z.array(stampPhotoSchema.shape.id),
    newPhotoUris: z.array(z.string().min(1)),
  })
  .refine(
    ({ keptPhotoIds, newPhotoUris }) =>
      keptPhotoIds.length + newPhotoUris.length <= maxStampPhotos,
    { message: `A stamp can have up to ${maxStampPhotos} photos` },
  );

export type Stamp = z.infer<typeof stampSchema>;
export type SaveStampInput = z.infer<typeof saveStampInputSchema>;
export type StampPhoto = z.infer<typeof stampPhotoSchema>;
export type UpdateStampMemoInput = z.input<typeof updateStampMemoInputSchema>;
export type UpdateStampInput = z.input<typeof updateStampInputSchema>;

export const sameDayStampMessage = "This rally already has a stamp on that day";

// One stamp per rally per local calendar day (S-025 / S-006).
export function hasStampOnLocalDay(
  stamps: Pick<Stamp, "id" | "rallyId" | "stampedAt">[],
  target: { rallyId: Stamp["rallyId"]; date: Date; excludedId?: Stamp["id"] },
) {
  const dayKey = localDateKey(target.date);
  return stamps.some(
    (stamp) =>
      stamp.id !== target.excludedId &&
      stamp.rallyId === target.rallyId &&
      localDateKeyFromIso(stamp.stampedAt) === dayKey,
  );
}
