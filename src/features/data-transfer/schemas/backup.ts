import { z } from "zod";

import { rallySchema } from "@/features/rallies/schemas/rallies";
import { stampSchema } from "@/features/rallies/schemas/stamps";

// Photos are not in the file yet (S-042).
const backupStampSchema = stampSchema.omit({ photos: true });

// The file Export data writes and Import data reads (S-041). Stamps keep their
// rally by id, so a stamp must point to a rally in the same file.
export const backupSchema = z
  .object({
    app: z.literal("stamp-log"),
    version: z.literal(1),
    exportedAt: z.iso.datetime(),
    rallies: z.array(rallySchema),
    stamps: z.array(backupStampSchema),
  })
  .refine(
    ({ rallies, stamps }) => {
      const rallyIds = new Set(rallies.map((rally) => rally.id));
      return stamps.every((stamp) => rallyIds.has(stamp.rallyId));
    },
    { message: "A stamp points to a rally that is not in the file" },
  );

export type Backup = z.infer<typeof backupSchema>;
