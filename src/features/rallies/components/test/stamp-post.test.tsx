import { Alert, Text, type AlertButton } from "react-native";

import { Slot, useLocalSearchParams } from "expo-router";
import { renderRouter } from "expo-router/testing-library";

import { QueryClientProvider } from "@tanstack/react-query";
import { act, fireEvent, screen, waitFor } from "@testing-library/react-native";

import { createTestQueryClient } from "@/shared/query/create-query-client";

import { listRallies, saveRally } from "../../db/rallies-db";
import { listStamps, saveStamp } from "../../db/stamps-db";
import { type Stamp } from "../../schemas/stamps";
import { StampPost } from "../stamp-post";

const stamp: Stamp = {
  id: 1,
  rallyId: 1,
  stampedAt: "2026-09-18T10:02:00.000Z",
  memo: "Talked at the lab",
};

beforeEach(() => {
  jest.spyOn(Alert, "alert").mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

// Renders the post on a route, with a route to land on after Edit.
function renderPost(post: Stamp) {
  const queryClient = createTestQueryClient();
  return renderRouter({
    _layout: () => (
      <QueryClientProvider client={queryClient}>
        <Slot />
      </QueryClientProvider>
    ),
    index: () => (
      <StampPost
        stamp={post}
        emoji="🔬"
        title="Researchers I met"
        detail="7:02 PM"
      />
    ),
    "edit-stamp": function EditStampRoute() {
      const { stampId } = useLocalSearchParams();
      return <Text>{`Editing stamp ${String(stampId)}`}</Text>;
    },
  });
}

describe("S-011 RT-001 ST-003 StampPost", () => {
  test("shows a bold title, a light detail and the memo", async () => {
    await renderPost(stamp);

    expect(screen.getByText("Researchers I met")).toHaveProp(
      "className",
      expect.stringContaining("font-semibold"),
    );
    expect(screen.getByText("7:02 PM")).toHaveProp(
      "className",
      expect.stringContaining("text-foreground-muted"),
    );
    expect(screen.getByText("Talked at the lab")).toBeOnTheScreen();
  });

  test("shows no memo when the stamp has none", async () => {
    await renderPost({ ...stamp, memo: null });

    expect(screen.getByText("no memo")).toBeOnTheScreen();
  });
});

describe("RT-001 ST-001 StampPost edits and deletes its stamp", () => {
  test("Edit opens the edit sheet for the stamp", async () => {
    await renderPost(stamp);

    await act(() => fireEvent.press(screen.getByTestId("stamp-edit-1")));

    expect(await screen.findByText("Editing stamp 1")).toBeOnTheScreen();
  });

  test("Delete asks first and deletes the stamp once confirmed", async () => {
    await saveRally({ name: "Lab", emoji: "🔬" });
    const [rally] = await listRallies();
    const saved = await saveStamp({ rallyId: rally.id });
    await renderPost(saved);

    await act(() =>
      fireEvent.press(screen.getByTestId(`stamp-delete-${saved.id}`)),
    );
    const buttons: AlertButton[] =
      jest.mocked(Alert.alert).mock.calls.at(-1)?.[2] ?? [];
    await act(() =>
      buttons.find((button) => button.text === "Delete")?.onPress?.(),
    );

    await waitFor(async () => {
      expect(await listStamps()).toEqual([]);
    });
  });
});
