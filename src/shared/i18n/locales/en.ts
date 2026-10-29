// The source of every UI string. `ja.ts` must have the same keys.
export const en = {
  common: {
    retry: "Retry",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    done: "Done",
    more: "More",
    menu: "Menu",
    cannotUndo: "This action cannot be undone.",
    errorTryAgain: "Something went wrong. Please try again.",
  },
  errors: {
    renderTitle: "Something went wrong",
    renderBody: "This screen couldn't be shown.",
    tryAgain: "Try again",
    couldNotLoad: "Couldn't load",
  },
  stamps: {
    noMemo: "no memo",
    deleteTitle: "Delete stamp?",
    showPhotos: "{{photos}}. Show photos",
    view: "View",
    stampsSegment: "Stamps · {{n}}",
    albumSegment: "Album · {{n}}",
    noPhotos: "No photos yet",
    openPhoto: "Open photo, {{rally}}, {{date}}",
    openPhotos: "Open {{photos}}, {{rally}}, {{date}}",
  },
  calendar: {
    previousMonth: "Previous month",
    nextMonth: "Next month",
    previousWeek: "Previous week",
    nextWeek: "Next week",
    chooseMonth: "Choose month, {{month}}",
    showWeek: "Show week",
    showMonth: "Show month",
    month: "Month",
    year: "Year",
    dayNotRecorded: "{{date}}, not recorded",
    dayRecorded: "{{date}}, recorded",
    dayRecordedCount: "{{date}}, recorded, {{stamps}}",
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
