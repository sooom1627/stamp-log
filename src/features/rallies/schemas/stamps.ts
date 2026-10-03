import { z } from "zod";

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

export function parseStampRow(row: Record<string, unknown>): Stamp {
  return stampSchema.parse({
    id: Number(row.id),
    rallyId: Number(row.rallyId ?? row.rally_id ?? row.rallyid),
    stampedAt: String(row.stampedAt ?? row.stamped_at ?? row.stampedat),
    memo: row.memo ?? null,
  });
}
