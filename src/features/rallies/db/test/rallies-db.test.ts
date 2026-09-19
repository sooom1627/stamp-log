import { deleteRally } from "../rallies-db";
import { listStamps, saveStamp } from "../stamps-db";

describe("deleteRally", () => {
  test("ラリーを削除するとそのスタンプも消え、他のラリーのスタンプは残る", async () => {
    await saveStamp({ rallyId: 1 });
    await saveStamp({ rallyId: 2 });

    await deleteRally(1);

    const remaining = await listStamps();
    expect(remaining).toHaveLength(1);
    expect(remaining[0].rallyId).toBe(2);
  });
});
