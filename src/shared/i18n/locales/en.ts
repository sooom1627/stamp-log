// The source of every UI string. `ja.ts` must have the same keys.
export const en = {
  common: {
    retry: "Retry",
  },
} as const;

type Messages<T> = {
  [K in keyof T]: T[K] extends string ? string : Messages<T[K]>;
};

export type Translation = Messages<typeof en>;
