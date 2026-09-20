import { z } from "zod";

export const stampSchema = z.object({
  id: z.number(),
  rallyId: z.number(),
  stampedAt: z.iso.datetime(),
  memo: z.string().nullable(),
});
export const saveStampInputSchema = stampSchema.pick({
  rallyId: true,
});
export const updateStampMemoInputSchema = z.object({
  id: stampSchema.shape.id,
  memo: z.string().trim().min(1),
});

export type Stamp = z.infer<typeof stampSchema>;
export type SaveStampInput = z.infer<typeof saveStampInputSchema>;
export type UpdateStampMemoInput = z.infer<typeof updateStampMemoInputSchema>;

export function parseStampRow(row: Record<string, unknown>): Stamp {
  return stampSchema.parse({
    id: Number(row.id),
    rallyId: Number(row.rallyId ?? row.rally_id ?? row.rallyid),
    stampedAt: String(row.stampedAt ?? row.stamped_at ?? row.stampedat),
    memo: row.memo ?? null,
  });
}
