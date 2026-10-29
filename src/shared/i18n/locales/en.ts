// The source of every UI string. `ja.ts` must have the same keys.
export const en = {
  common: {
    retry: "Retry",
  },
  dates: {
    today: "Today",
    yesterday: "Yesterday",
    // Not i18next plurals: they need Intl.PluralRules, and Japanese has one form.
    dayAgo: "{{days}} day ago",
    daysAgo: "{{days}} days ago",
  },
} as const;

type Messages<T> = {
  [K in keyof T]: T[K] extends string ? string : Messages<T[K]>;
};

export type Translation = Messages<typeof en>;
