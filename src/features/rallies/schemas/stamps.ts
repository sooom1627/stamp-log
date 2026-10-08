import { z } from "zod";

import {
  localDateKey,
  localDateKeyFromIso,
} from "@/shared/utils/local-date-key";

export const stampSchema = z.object({
  id: z.number(),
  rallyId: z.number(),
  stampedAt: z.iso.datetime(),
  memo: z.string().nullable(),
});
export const notFutureDatetimeSchema = stampSchema.shape.stampedAt.refine(
  (stampedAt) => Date.parse(stampedAt) <= Date.now(),
  { message: "stampedAt must not be in the future" },
);
export const saveStampInputSchema = stampSchema
  .pick({ rallyId: true })
  .extend({ stampedAt: notFutureDatetimeSchema.optional() });
export const updateStampMemoInputSchema = stampSchema
  .pick({ id: true })
  .extend({ memo: z.string().trim().min(1) });
export const updateStampInputSchema = stampSchema.pick({ id: true }).extend({
  stampedAt: notFutureDatetimeSchema,
  memo: z
    .string()
    .trim()
    .transform((memo) => (memo === "" ? null : memo)),
});

export type Stamp = z.infer<typeof stampSchema>;
export type SaveStampInput = z.infer<typeof saveStampInputSchema>;
export type UpdateStampMemoInput = z.infer<typeof updateStampMemoInputSchema>;
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
