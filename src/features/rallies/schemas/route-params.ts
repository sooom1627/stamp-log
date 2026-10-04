import { z } from "zod";

import { localDateKey } from "@/shared/utils/local-date-key";

// Deep-link params arrive as strings (or string[] when repeated); accept only
// a positive integer string such as "12".
export const idParamSchema = z
  .string()
  .regex(/^[1-9]\d*$/)
  .transform(Number);

// A local calendar day such as "2026-09-18", today or earlier. Parsed into
// local midnight; impossible days such as "2026-02-30" do not round-trip.
export const dateParamSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .transform((value) => {
    const [year, month, day] = value.split("-").map(Number);
    return { value, date: new Date(year, month - 1, day) };
  })
  .refine(({ value, date }) => localDateKey(date) === value)
  .refine(({ value }) => value <= localDateKey(new Date()))
  .transform(({ date }) => date);
