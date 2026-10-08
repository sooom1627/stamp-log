export function localDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// A stamp's stored ISO time, keyed by the local day it was stamped on.
export function localDateKeyFromIso(iso: string) {
  return localDateKey(new Date(iso));
}
