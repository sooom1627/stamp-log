import { File, Paths } from "expo-file-system";
import { launchImageLibraryAsync } from "expo-image-picker";
import { router } from "expo-router";
import { renderRouter } from "expo-router/testing-library";

import {
  act,
  fireEvent,
  screen,
  userEvent,
  waitFor,
  within,
} from "@testing-library/react-native";

import { listRallies, saveRally } from "../../db/rallies-db";
import { listStamps, saveStamp } from "../../db/stamps-db";

jest.useFakeTimers();

describe("S-024 T-001 ST-001 fit form sheet", () => {
  test("keeps Save inside intrinsically sized memo content", async () => {
    await renderRouter("./src/app", {
      initialUrl: "/add-stamp-memo?stampId=1",
    });

    const form = await screen.findByTestId("add-stamp-memo-form");

    expect(form).not.toHaveProp("className", expect.stringContaining("flex-1"));
    expect(screen.getByRole("button", { name: "Save" })).toBeOnTheScreen();
  });
});

describe("S-002 T-002 RT-003 ST-002 save memo", () => {
  test("persists memo on stamp after save", async () => {
    await saveRally({ name: "Memo save rally" });
    const [rally] = await listRallies();
    const stamp = await saveStamp({ rallyId: rally.id });

    await renderRouter("./src/app");
    expect(
      await screen.findByRole("button", {
        name: "View Memo save rally details",
      }),
    ).toBeOnTheScreen();

    await act(() => {
      router.push(`/add-stamp-memo?stampId=${stamp.id}`);
    });

    const user = userEvent.setup();
    expect(await screen.findByText("Memo")).toBeOnTheScreen();
    // S-028 RT-002 ST-005: the rally sits above the heading inside the sheet.
    const form = screen.getByTestId("add-stamp-memo-form");
    expect(
      within(form).getByRole("heading", { name: "Memo & photos" }),
    ).toBeOnTheScreen();
    expect(
      await within(form).findByText(`${rally.emoji} Memo save rally`),
    ).toBeOnTheScreen();
    expect(form).toHaveProp("className", expect.stringContaining("pt-8"));

    const memoInput = screen.getByPlaceholderText("Enter memo");
    await user.type(memoInput, "Met them");
    await act(async () => {
      fireEvent(memoInput, "submitEditing");
    });

    expect(
      await screen.findByRole("button", {
        name: "Memo save rally already stamped today",
      }),
    ).toBeDisabled();
    const [updated] = await listStamps();
    expect(updated.memo).toBe("Met them");
  });
});

describe("S-035 ST-005 pick photos in the memo sheet", () => {
  let nextPickedId = 1;
  // The user picks these photos in the system photo library.
  function pickPhotos(count: number) {
    const assets = Array.from({ length: count }, () => {
      const file = new File(Paths.cache, `sheet-picked-${nextPickedId++}.jpg`);
      file.write("jpeg with exif");
      return { uri: file.uri, width: 1, height: 1 };
    });
    jest.mocked(launchImageLibraryAsync).mockResolvedValueOnce({
      canceled: false,
      assets,
    } as unknown as Awaited<ReturnType<typeof launchImageLibraryAsync>>);
  }

  async function openSheet(rallyName: string) {
    await saveRally({ name: rallyName });
    const rally = (await listRallies()).find(({ name }) => name === rallyName)!;
    const stamp = await saveStamp({ rallyId: rally.id });
    // Opened over Home, so saving can go back like after the toast.
    await renderRouter("./src/app");
    expect(
      await screen.findByRole("button", { name: `View ${rallyName} details` }),
    ).toBeOnTheScreen();
    await act(() => {
      router.push(`/add-stamp-memo?stampId=${stamp.id}`);
    });
    expect(
      await screen.findByRole("heading", { name: "Memo & photos" }),
    ).toBeOnTheScreen();
    return { stampId: stamp.id, user: userEvent.setup() };
  }

  const savedStamp = async (stampId: number) =>
    (await listStamps()).find(({ id }) => id === stampId)!;

  test("saves the two picked photos with the memo", async () => {
    const { stampId, user } = await openSheet("Two photos rally");
    pickPhotos(2);

    await user.press(screen.getByRole("button", { name: "Add photos" }));
    expect(await screen.findByText("2 / 4")).toBeOnTheScreen();
    await user.type(screen.getByPlaceholderText("Enter memo"), "Lab visit");
    await user.press(screen.getByRole("button", { name: "Save" }));

    // The sheet closes once the save has finished.
    await waitFor(() => {
      expect(
        screen.queryByRole("heading", { name: "Memo & photos" }),
      ).not.toBeOnTheScreen();
    });
    const stamp = await savedStamp(stampId);
    expect(stamp.memo).toBe("Lab visit");
    expect(stamp.photos).toHaveLength(2);
  });

  test("saves photos without a memo", async () => {
    const { stampId, user } = await openSheet("Photo only rally");
    pickPhotos(1);

    await user.press(screen.getByRole("button", { name: "Add photos" }));
    expect(await screen.findByText("1 / 4")).toBeOnTheScreen();
    await user.press(screen.getByRole("button", { name: "Save" }));

    // The sheet closes once the save has finished.
    await waitFor(() => {
      expect(
        screen.queryByRole("heading", { name: "Memo & photos" }),
      ).not.toBeOnTheScreen();
    });
    const stamp = await savedStamp(stampId);
    expect(stamp.memo).toBeNull();
    expect(stamp.photos).toHaveLength(1);
  });

  test("cannot save without a memo or photos", async () => {
    await openSheet("Empty sheet rally");

    expect(screen.getByText("0 / 4")).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
  });

  test("hides Add once 4 photos are picked, asking only for what is left", async () => {
    const { user } = await openSheet("Four photos rally");
    pickPhotos(3);
    await user.press(screen.getByRole("button", { name: "Add photos" }));
    expect(await screen.findByText("3 / 4")).toBeOnTheScreen();

    pickPhotos(1);
    await user.press(screen.getByRole("button", { name: "Add photos" }));

    expect(launchImageLibraryAsync).toHaveBeenLastCalledWith(
      expect.objectContaining({
        allowsMultipleSelection: true,
        selectionLimit: 1,
      }),
    );
    expect(await screen.findByText("4 / 4")).toBeOnTheScreen();
    expect(
      screen.queryByRole("button", { name: "Add photos" }),
    ).not.toBeOnTheScreen();
  });

  test("removing a picked photo lowers the count", async () => {
    const { user } = await openSheet("Remove photo rally");
    pickPhotos(2);
    await user.press(screen.getByRole("button", { name: "Add photos" }));
    expect(await screen.findByText("2 / 4")).toBeOnTheScreen();

    await user.press(screen.getByRole("button", { name: "Remove photo 1" }));

    expect(screen.getByText("1 / 4")).toBeOnTheScreen();
  });
});
