import { z } from "zod";

export const stampSchema = z.object({
  id: z.number(),
  rallyId: z.number(),
  stampedAt: z.iso.datetime(),
});
export const saveStampInputSchema = stampSchema.pick({
  rallyId: true,
});

export type Stamp = z.infer<typeof stampSchema>;
export type SaveStampInput = z.infer<typeof saveStampInputSchema>;

export function parseStampRow(row: Record<string, unknown>): Stamp {
  return stampSchema.parse({
    id: Number(row.id),
    rallyId: Number(row.rallyId ?? row.rally_id ?? row.rallyid),
    stampedAt: String(row.stampedAt ?? row.stamped_at ?? row.stampedat),
  });
}
