import { Dimensions } from "react-native";

import { File, Paths } from "expo-file-system";
import { router } from "expo-router";
import { renderRouter } from "expo-router/testing-library";

import {
  act,
  fireEvent,
  screen,
  userEvent,
  waitFor,
} from "@testing-library/react-native";

import { formatStampDateTime } from "@/shared/utils/format-stamp-date-time";

import { listRallies, saveRally } from "../../db/rallies-db";
import { listStamps, saveStamp, updateStampMemo } from "../../db/stamps-db";

jest.useFakeTimers();

const now = new Date(2026, 9, 10, 21, 0);

beforeEach(() => {
  jest.setSystemTime(now);
});

// A stamp with photos the user picked in the library (S-035).
let nextPickedPhotoId = 1;
async function seedStampWithPhotos(name: string, count: number) {
  await saveRally({ name, emoji: "🔬" });
  const rally = (await listRallies()).find(
    (candidate) => candidate.name === name,
  );
  if (!rally) throw new Error(`Rally ${name} not found`);
  const stampedAt = new Date(2026, 9, 10, 20, 15);
  const { id: stampId } = await saveStamp({
    rallyId: rally.id,
    stampedAt: stampedAt.toISOString(),
  });
  const photoUris = Array.from({ length: count }, () => {
    const file = new File(
      Paths.cache,
      `viewer-picked-${nextPickedPhotoId++}.jpg`,
    );
    file.writeSync("jpeg");
    return file.uri;
  });
  await updateStampMemo({ id: stampId, memo: "", photoUris });
  const stamp = (await listStamps()).find(({ id }) => id === stampId);
  if (!stamp) throw new Error(`Stamp ${stampId} not found`);

  return { rally, stamp, stampedAt };
}

async function openViewer(photoId: number) {
  const app = await renderRouter("./src/app");
  await act(() => {
    router.push({
      pathname: "/stamp-photos",
      params: { photoId: String(photoId) },
    });
  });
  return app;
}

describe("S-037 T-001 ST-002 page through a stamp's photos full screen", () => {
  test("opens at the pressed photo with the rally and the stamp's date", async () => {
    const { stamp, stampedAt } = await seedStampWithPhotos("Viewer rally", 3);

    await openViewer(stamp.photos[1].id);

    expect(await screen.findByText("2 / 3")).toBeOnTheScreen();
    expect(screen.getByText("🔬 Viewer rally")).toBeOnTheScreen();
    expect(
      screen.getByText(formatStampDateTime(stampedAt, now)),
    ).toBeOnTheScreen();
    // The list renders from the opened page, so earlier pages may not be
    // mounted yet; the opened one is.
    expect(screen.getByLabelText("Photo 2 of 3")).toBeOnTheScreen();
  });

  test("swiping to the next page shows which photo it is", async () => {
    const { stamp } = await seedStampWithPhotos("Viewer swipe rally", 3);
    await openViewer(stamp.photos[1].id);
    const pages = await screen.findByTestId("stamp-photos-pages");

    await fireEvent(pages, "momentumScrollEnd", {
      nativeEvent: {
        contentOffset: { x: 2 * Dimensions.get("window").width, y: 0 },
      },
    });

    expect(screen.getByText("3 / 3")).toBeOnTheScreen();
  });

  test("hides the counter when the stamp has one photo", async () => {
    const { stamp } = await seedStampWithPhotos("Viewer single rally", 1);

    await openViewer(stamp.photos[0].id);

    expect(await screen.findByLabelText("Photo 1 of 1")).toBeOnTheScreen();
    expect(screen.queryByText("1 / 1")).not.toBeOnTheScreen();
  });

  test("the close button returns to the screen it was opened from", async () => {
    const { rally, stamp } = await seedStampWithPhotos("Viewer close rally", 2);
    const app = await renderRouter("./src/app");
    await act(() => {
      router.push(`/rallies/${rally.id}`);
    });
    await act(() => {
      router.push({
        pathname: "/stamp-photos",
        params: { photoId: String(stamp.photos[0].id) },
      });
    });

    await userEvent
      .setup()
      .press(await screen.findByRole("button", { name: "Close" }));

    expect(app.getPathname()).toBe(`/rallies/${rally.id}`);
  });

  test.each([["abc"], ["0"], ["999999"]])(
    "photoId %s closes the screen",
    async (photoId) => {
      const app = await renderRouter("./src/app");

      await act(() => {
        router.push({ pathname: "/stamp-photos", params: { photoId } });
      });

      await waitFor(() => {
        expect(app.getPathname()).toBe("/");
      });
    },
  );
});

describe("S-037 T-003 ST-003 page through the day's photos of the rally", () => {
  async function pickedPhotos(count: number) {
    return Array.from({ length: count }, () => {
      const file = new File(
        Paths.cache,
        `viewer-day-${nextPickedPhotoId++}.jpg`,
      );
      file.writeSync("jpeg");
      return file.uri;
    });
  }

  // Two stamps of one rally on one day (older data, or S-026 later), plus
  // another rally's stamp that day.
  async function seedDay() {
    await saveRally({ name: "Viewer day rally", emoji: "🔬" });
    await saveRally({ name: "Viewer other rally", emoji: "☕" });
    const rallies = await listRallies();
    const rally = rallies.find(({ name }) => name === "Viewer day rally");
    const other = rallies.find(({ name }) => name === "Viewer other rally");
    if (!rally || !other) throw new Error("Rallies not found");
    const morningAt = new Date(2026, 9, 10, 9, 0);
    const morning = await saveStamp({
      rallyId: rally.id,
      stampedAt: morningAt.toISOString(),
    });
    await updateStampMemo({
      id: morning.id,
      memo: "",
      photoUris: await pickedPhotos(2),
    });
    // Stamped now (21:00 the same day): the same-day check only guards past
    // stamps.
    const evening = await saveStamp({ rallyId: rally.id });
    await updateStampMemo({
      id: evening.id,
      memo: "",
      photoUris: await pickedPhotos(1),
    });
    const otherStamp = await saveStamp({ rallyId: other.id });
    await updateStampMemo({
      id: otherStamp.id,
      memo: "",
      photoUris: await pickedPhotos(1),
    });
    const stamps = await listStamps();
    const byId = (id: number) => {
      const stamp = stamps.find((candidate) => candidate.id === id);
      if (!stamp) throw new Error(`Stamp ${id} not found`);
      return stamp;
    };
    return {
      morning: byId(morning.id),
      morningAt,
      evening: byId(evening.id),
    };
  }

  test("pages through every photo of the rally that day, oldest stamp first", async () => {
    const { evening } = await seedDay();

    await openViewer(evening.photos[0].id);

    expect(await screen.findByText("3 / 3")).toBeOnTheScreen();
    expect(screen.getByLabelText("Photo 3 of 3")).toBeOnTheScreen();
    expect(screen.getByText("🔬 Viewer day rally")).toBeOnTheScreen();
    expect(screen.getByText(formatStampDateTime(now, now))).toBeOnTheScreen();
  });

  test("the date follows the stamp of the photo shown", async () => {
    const { evening, morningAt } = await seedDay();
    await openViewer(evening.photos[0].id);
    const pages = await screen.findByTestId("stamp-photos-pages");

    await fireEvent(pages, "momentumScrollEnd", {
      nativeEvent: { contentOffset: { x: 0, y: 0 } },
    });

    expect(screen.getByText("1 / 3")).toBeOnTheScreen();
    expect(
      screen.getByText(formatStampDateTime(morningAt, now)),
    ).toBeOnTheScreen();
  });
});
