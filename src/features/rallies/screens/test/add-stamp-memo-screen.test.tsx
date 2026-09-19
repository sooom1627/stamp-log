import { router } from "expo-router";
import { renderRouter } from "expo-router/testing-library";

import { act, screen, userEvent } from "@testing-library/react-native";

import { listRallies, saveRally } from "../../db/rallies-db";
import { listStamps, saveStamp } from "../../db/stamps-db";

jest.useFakeTimers();

describe("S-002 T-002 RT-003 ST-002 メモの保存", () => {
  test("メモを入れて保存すると stamp に残る", async () => {
    await saveRally({ name: "メモ追加用のラリー", type: "place" });
    const [rally] = await listRallies();
    const stamp = await saveStamp({ rallyId: rally.id });

    await renderRouter("./src/app");
    expect(await screen.findByText("メモ追加用のラリー")).toBeOnTheScreen();

    await act(() => {
      router.push(`/add-stamp-memo?stampId=${stamp.id}`);
    });

    const user = userEvent.setup();
    await user.type(await screen.findByPlaceholderText("メモを入力"), "会った");
    await user.press(screen.getByRole("button", { name: "保存" }));

    expect(await screen.findByText("会った")).toBeOnTheScreen();
    const [updated] = await listStamps();
    expect(updated.memo).toBe("会った");
  });
});
