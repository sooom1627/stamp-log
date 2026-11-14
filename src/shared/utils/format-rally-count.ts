// e.g. "1 rally" / "6 rallies". Counts stay English in every language
// (docs/ia.md 言語).
export function formatRallyCount(count: number) {
  return `${count} ${count === 1 ? "rally" : "rallies"}`;
}
