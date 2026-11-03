import { File, Paths } from "expo-file-system";
import { router, type Href } from "expo-router";
import { renderRouter } from "expo-router/testing-library";
import Storage from "expo-sqlite/kv-store";

import { act, screen } from "@testing-library/react-native";

import { listRallies, saveRally } from "@/shared/db/rallies-db";
import { listStamps, saveStamp, updateStampMemo } from "@/shared/db/stamps-db";

jest.useFakeTimers();

// How each route opens (S-059 RT-002): moving route files into groups must
// keep every sheet a sheet and every full-screen modal full screen.

let rallyId: number;
let stampId: number;
let photoId: number;

beforeAll(async () => {
  await saveRally({ name: "Presentation rally", emoji: "🧭" });
  const rally = (await listRallies()).find(
    ({ name }) => name === "Presentation rally",
  );
  if (!rally) throw new Error("Presentation rally not found");
  rallyId = rally.id;
  ({ id: stampId } = await saveStamp({
    rallyId,
    stampedAt: new Date(2026, 8, 18, 20, 15).toISOString(),
  }));
  const file = new File(Paths.cache, "presentation-photo.jpg");
  file.writeSync("jpeg");
  await updateStampMemo({ id: stampId, memo: "", photoUris: [file.uri] });
  const stamp = (await listStamps()).find(({ id }) => id === stampId);
  const photo = stamp?.photos[0];
  if (!photo) throw new Error("Presentation photo not found");
  photoId = photo.id;
});

beforeEach(() => {
  jest.setSystemTime(new Date(2026, 8, 20, 9, 0));
});

// The native modal screens on top of the tabs, bottom first.
function modalScreens() {
  return screen.container
    .queryAll((instance) => instance.type === "RNSModalScreen")
    .map((instance) => ({
      stackPresentation: instance.props.stackPresentation as string,
      statusBarStyle: instance.props.statusBarStyle as string | undefined,
    }));
}

async function open(...hrefs: Href[]) {
  await renderRouter("./src/app");
  for (const href of hrefs) {
    await act(() => {
      router.push(href);
    });
  }
}

describe("S-059 RT-002 ST-002 how each route opens", () => {
  test.each<[string, () => Href]>([
    ["create-rally", () => "/create-rally"],
    ["edit-rally", () => ({ pathname: "/edit-rally", params: { rallyId } })],
    [
      "rally-day",
      () => ({
        pathname: "/rally-day",
        params: { rallyId, date: "2026-09-18" },
      }),
    ],
    [
      "add-past-stamp",
      () => ({ pathname: "/add-past-stamp", params: { rallyId } }),
    ],
    [
      "add-stamp-memo",
      () => ({ pathname: "/add-stamp-memo", params: { stampId } }),
    ],
    ["edit-stamp", () => ({ pathname: "/edit-stamp", params: { stampId } })],
    [
      "logs-day",
      () => ({ pathname: "/logs-day", params: { date: "2026-09-18" } }),
    ],
    ["settings", () => "/settings"],
  ])("opens %s as a form sheet", async (_name, href) => {
    await open(href());

    expect(modalScreens()).toEqual([
      { stackPresentation: "formSheet", statusBarStyle: undefined },
    ]);
  });

  test("opens Language as a second form sheet over Settings", async () => {
    await open("/settings", "/language");

    expect(modalScreens().map((modal) => modal.stackPresentation)).toEqual([
      "formSheet",
      "formSheet",
    ]);
  });

  test("opens the past stamp sheet over the rally day sheet", async () => {
    await open(
      { pathname: "/rally-day", params: { rallyId, date: "2026-09-18" } },
      {
        pathname: "/add-past-stamp",
        params: { rallyId, date: "2026-09-18" },
      },
    );

    expect(modalScreens().map((modal) => modal.stackPresentation)).toEqual([
      "formSheet",
      "formSheet",
    ]);
  });

  test("opens About Ato full screen over Settings", async () => {
    await open("/settings", "/about-ato");

    expect(modalScreens().map((modal) => modal.stackPresentation)).toEqual([
      "formSheet",
      "fullScreenModal",
    ]);
  });

  test("opens the photo viewer full screen with a light status bar", async () => {
    await open({ pathname: "/stamp-photos", params: { photoId } });

    expect(modalScreens()).toEqual([
      { stackPresentation: "fullScreenModal", statusBarStyle: "light" },
    ]);
  });

  test("opens onboarding on first launch with no swipe back", async () => {
    // A fresh install; jest-setup marks onboarding done again before the next test.
    Storage.clearSync();
    await renderRouter("./src/app");

    const onboarding = screen.container
      .queryAll((instance) => instance.type === "RNSScreen")
      .filter((instance) => instance.props.gestureEnabled === false);
    expect(onboarding).toHaveLength(1);
    expect(modalScreens()).toEqual([]);
    expect(await screen.findByLabelText("Page 1 of 4")).toBeOnTheScreen();
  });
});
