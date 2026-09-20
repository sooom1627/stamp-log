import { router } from "expo-router";
import { renderRouter } from "expo-router/testing-library";

import {
  act,
  fireEvent,
  screen,
  userEvent,
} from "@testing-library/react-native";

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
    expect(await screen.findByText("メモ")).toBeOnTheScreen();
    expect(
      screen.queryByRole("heading", { name: "メモを追加" }),
    ).not.toBeOnTheScreen();

    const memoInput = screen.getByPlaceholderText("メモを入力");
    await user.type(memoInput, "会った");
    await act(async () => {
      fireEvent(memoInput, "submitEditing");
    });

    expect(
      await screen.findByRole("button", {
        name: "メモ追加用のラリーは今日記録済み",
      }),
    ).toBeDisabled();
    const [updated] = await listStamps();
    expect(updated.memo).toBe("会った");
  });
});
