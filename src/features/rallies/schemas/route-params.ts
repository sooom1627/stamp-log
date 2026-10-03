import { z } from "zod";

// Deep-link params arrive as strings (or string[] when repeated); accept only
// a positive integer string such as "12".
export const idParamSchema = z
  .string()
  .regex(/^[1-9]\d*$/)
  .transform(Number);
