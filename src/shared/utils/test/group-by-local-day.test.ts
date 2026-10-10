import { groupByLocalDay } from "../group-by-local-day";

const at = (day: number, hour: number) =>
  new Date(2026, 9, day, hour).toISOString();

describe("S-011 RT-001 ST-002 groupByLocalDay", () => {
  test("groups items by the local day of their time, keeping the input order", () => {
    const items = [
      { id: 4, stampedAt: at(10, 20) },
      { id: 3, stampedAt: at(10, 8) },
      { id: 2, stampedAt: at(8, 23) },
      { id: 1, stampedAt: at(8, 0) },
    ];

    expect(groupByLocalDay(items, (item) => item.stampedAt)).toEqual([
      { dateKey: "2026-10-10", data: [items[0], items[1]] },
      { dateKey: "2026-10-08", data: [items[2], items[3]] },
    ]);
  });

  test("returns no sections for no items", () => {
    expect(groupByLocalDay([], () => "")).toEqual([]);
  });
});
