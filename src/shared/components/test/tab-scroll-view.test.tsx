import { router } from "expo-router";
import { renderRouter } from "expo-router/testing-library";

import { act, screen } from "@testing-library/react-native";

import * as ralliesDb from "@/shared/db/rallies-db";
import { saveStamp } from "@/shared/db/stamps-db";

jest.useFakeTimers();

// The tab bar floats over every tab screen. A scroll that takes iOS's safe
// area as its inset (which includes the tab bar) and keeps the same room
// below its end never leaves its last content under the bar.
function bottomRoom(scroll: ReturnType<typeof screen.getByLabelText>) {
  return {
    inset: scroll.props.contentInsetAdjustmentBehavior,
    padding: scroll.props.contentContainerClassName,
  };
}

const clearsTabBar = {
  inset: "automatic",
  padding: expect.stringContaining("pb-32"),
};

describe("scrolls on tab screens end above the tab bar", () => {
  test("Home and Logs", async () => {
    await renderRouter("./src/app");

    expect(bottomRoom(await screen.findByLabelText("Home"))).toEqual(
      clearsTabBar,
    );
    expect(bottomRoom(screen.getByLabelText("Logs timeline"))).toEqual(
      clearsTabBar,
    );
  });

  test("the rallies list pages", async () => {
    await renderRouter("./src/app", { initialUrl: "/rallies-list" });

    const pager = await screen.findByTestId("rallies-list-pager-all");
    const [pageScroll] = pager.queryAll(
      (instance) => instance.type === "RCTScrollView",
    );
    expect(bottomRoom(pageScroll)).toEqual(clearsTabBar);
  });

  test("rally detail", async () => {
    await ralliesDb.saveRally({ name: "Tokyo towers", emoji: "🗼" });
    const [rally] = await ralliesDb.listRallies();
    await saveStamp({ rallyId: rally.id });

    await renderRouter("./src/app");
    await act(() => {
      router.push(`/rallies/${rally.id}`);
    });

    expect(bottomRoom(await screen.findByLabelText("Rally detail"))).toEqual(
      clearsTabBar,
    );
  });
});
