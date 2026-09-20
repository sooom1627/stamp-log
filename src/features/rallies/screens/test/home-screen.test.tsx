import { Alert, type AlertButton } from "react-native";

import { renderRouter } from "expo-router/testing-library";

import { act, screen, userEvent, waitFor } from "@testing-library/react-native";
import { toast } from "sonner-native";

import * as ralliesDb from "../../db/rallies-db";
import * as stampsDb from "../../db/stamps-db";
import { type RallyType } from "../../schemas/rallies";

jest.useFakeTimers();

beforeEach(() => {
  jest.spyOn(Alert, "alert").mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

function findAlertButton(style: AlertButton["style"]): AlertButton {
  const alertSpy = jest.mocked(Alert.alert);
  const buttons = alertSpy.mock.calls.at(-1)?.[2] ?? [];
  const button = buttons.find((candidate) => candidate.style === style);
  if (!button) throw new Error(`Alert button with style ${style} not found`);
  return button;
}

function findToastAction(): { label: string; onClick: () => void } {
  const options = jest.mocked(toast).mock.calls.at(-1)?.[1];
  const action = options?.action;
  if (
    !action ||
    typeof action !== "object" ||
    !("onClick" in action) ||
    typeof action.onClick !== "function"
  ) {
    throw new Error("toast action not found");
  }
  return action;
}

async function renderHomeWithRally(name: string, type: RallyType = "place") {
  await ralliesDb.saveRally({ name, type });
  await renderRouter("./src/app");
  expect(await screen.findByText(name)).toBeOnTheScreen();
  return userEvent.setup();
}

describe("ST-001 create rally entry", () => {
  test("opens create screen from Create rally on home", async () => {
    await renderRouter("./src/app");

    const user = userEvent.setup();
    await user.press(screen.getByRole("link", { name: "Create rally" }));

    expect(
      await screen.findByPlaceholderText("Enter a place to track"),
    ).toBeOnTheScreen();
    expect(
      screen.queryByRole("heading", { name: "Create rally" }),
    ).not.toBeOnTheScreen();
  });
});

describe("S-022 section heading", () => {
  test("shows Your Days when rallies exist", async () => {
    await renderHomeWithRally("Your Days check");

    expect(
      screen.getByRole("heading", { name: "Your Days" }),
    ).toBeOnTheScreen();
  });

  test("opens rallies list from View All", async () => {
    const user = await renderHomeWithRally("View All check");

    await user.press(screen.getByRole("link", { name: "View All" }));

    expect(await screen.findByLabelText("Rallies list")).toBeOnTheScreen();
    expect(screen.queryByText("View All check")).not.toBeOnTheScreen();
  });
});

describe("T-002 ST-001 delete button", () => {
  test("shows delete button on each rally in the list", async () => {
    await renderHomeWithRally("Tokyo museums");

    expect(
      screen.getByRole("button", { name: "Delete Tokyo museums" }),
    ).toBeOnTheScreen();
  });
});

describe("T-002 ST-002 delete confirmation", () => {
  test("shows confirmation on delete and keeps rally on cancel", async () => {
    const user = await renderHomeWithRally("Yamanote stations");

    await user.press(
      screen.getByRole("button", { name: "Delete Yamanote stations" }),
    );

    expect(Alert.alert).toHaveBeenCalledTimes(1);

    findAlertButton("cancel").onPress?.();

    expect(screen.getByText("Yamanote stations")).toBeOnTheScreen();
  });
});

describe("T-002 ST-003 delete confirm", () => {
  test("removes rally from home list after confirming delete", async () => {
    const user = await renderHomeWithRally("Weekend running");

    await user.press(
      screen.getByRole("button", { name: "Delete Weekend running" }),
    );
    await act(async () => {
      findAlertButton("destructive").onPress?.();
    });

    await waitFor(() => {
      expect(screen.queryByText("Weekend running")).not.toBeOnTheScreen();
    });
  });
});

describe("S-002 T-001 ST-004 stamp rally", () => {
  const stampedAt = "2026-09-19T12:34:00.000Z";

  beforeEach(() => {
    jest.setSystemTime(new Date(stampedAt));
  });

  test("marks today as recorded after stamping", async () => {
    const user = await renderHomeWithRally("Researchers met this year");

    await user.press(
      screen.getByRole("button", {
        name: "Stamp Researchers met this year for today",
      }),
    );

    expect(
      await screen.findByRole("button", {
        name: "Researchers met this year already stamped today",
      }),
    ).toBeDisabled();
  });

  test("stamps person, place, and action rallies the same way", async () => {
    const rallies = [
      { name: "Classmates", type: "person" },
      { name: "Stations on Yamanote", type: "place" },
      { name: "Goals this year", type: "action" },
    ] as const;

    for (const rally of rallies) {
      await ralliesDb.saveRally(rally);
    }

    await renderRouter("./src/app");
    const user = userEvent.setup();
    expect(await screen.findByText("Classmates")).toBeOnTheScreen();

    for (const rally of rallies) {
      await user.press(
        screen.getByRole("button", {
          name: `Stamp ${rally.name} for today`,
        }),
      );
    }

    expect(
      (
        await screen.findAllByRole("button", {
          name: /already stamped today/,
        })
      ).length,
    ).toBeGreaterThanOrEqual(3);
    expect(screen.queryByText("Who")).not.toBeOnTheScreen();
    expect(screen.queryByText("Where")).not.toBeOnTheScreen();
    expect(screen.queryByText("What")).not.toBeOnTheScreen();
  });

  test("shows error toast when save fails", async () => {
    jest.spyOn(stampsDb, "saveStamp").mockRejectedValue(new Error("disk full"));
    jest.mocked(toast.error).mockClear();

    const user = await renderHomeWithRally("Failing rally");
    await user.press(
      screen.getByRole("button", {
        name: "Stamp Failing rally for today",
      }),
    );

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Something went wrong. Please try again.",
      );
    });
    expect(
      screen.queryByText("Could not save. Please try again."),
    ).not.toBeOnTheScreen();
    expect(Alert.alert).not.toHaveBeenCalledWith(
      "Could not save. Please try again.",
      "disk full",
    );
  });
});

describe("S-002 T-002 ST-001 memo toast", () => {
  const stampedAt = "2026-09-20T15:00:00.000Z";

  beforeEach(() => {
    jest.setSystemTime(new Date(stampedAt));
    jest.mocked(toast).mockClear();
  });

  test("shows toast on stamp and keeps stamp after it dismisses", async () => {
    const user = await renderHomeWithRally("Memo toast rally");

    await user.press(
      screen.getByRole("button", {
        name: "Stamp Memo toast rally for today",
      }),
    );

    expect(
      await screen.findByRole("button", {
        name: "Memo toast rally already stamped today",
      }),
    ).toBeDisabled();
    expect(toast).toHaveBeenCalledWith(
      "Add a memo?",
      expect.objectContaining({
        duration: 5000,
        action: {
          label: "Add memo",
          onClick: expect.any(Function),
        },
      }),
    );

    await act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(
      screen.getByRole("button", {
        name: "Memo toast rally already stamped today",
      }),
    ).toBeDisabled();
  });
});

describe("S-002 T-002 ST-005 memo formSheet", () => {
  const stampedAt = "2026-09-21T10:00:00.000Z";

  beforeEach(() => {
    jest.setSystemTime(new Date(stampedAt));
    jest.mocked(toast).mockClear();
  });

  test("opens formSheet from Add memo and keeps recorded dot after save", async () => {
    const user = await renderHomeWithRally("Memo formSheet rally");

    await user.press(
      screen.getByRole("button", {
        name: "Stamp Memo formSheet rally for today",
      }),
    );

    expect(
      await screen.findByRole("button", {
        name: "Memo formSheet rally already stamped today",
      }),
    ).toBeDisabled();

    const action = findToastAction();
    expect(action.label).toBe("Add memo");

    await act(async () => {
      action.onClick();
    });

    expect(toast.dismiss).toHaveBeenCalled();
    expect(await screen.findByText("Memo")).toBeOnTheScreen();
    expect(
      screen.queryByRole("heading", { name: "Add memo" }),
    ).not.toBeOnTheScreen();

    await user.type(screen.getByPlaceholderText("Enter memo"), "Met them");
    await user.press(screen.getByRole("button", { name: "Save" }));

    expect(
      await screen.findByRole("button", {
        name: "Memo formSheet rally already stamped today",
      }),
    ).toBeDisabled();
  });
});

describe("S-002 T-002 RT-002 error display", () => {
  test("shows load error and retry when rally list fails", async () => {
    jest
      .spyOn(ralliesDb, "listRallies")
      .mockRejectedValue(new Error("disk full"));

    await renderRouter("./src/app");

    expect(await screen.findByText("Couldn't load")).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "Retry" })).toBeOnTheScreen();
    expect(
      screen.queryByText("Could not save. Please try again."),
    ).not.toBeOnTheScreen();
  });

  test("shows load error and retry when stamp list fails", async () => {
    jest
      .spyOn(stampsDb, "listStamps")
      .mockRejectedValue(new Error("disk full"));

    await renderRouter("./src/app");

    expect(await screen.findByText("Couldn't load")).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "Retry" })).toBeOnTheScreen();
  });

  test("shows list after retrying a failed load", async () => {
    const listSpy = jest
      .spyOn(ralliesDb, "listRallies")
      .mockRejectedValue(new Error("disk full"));

    await renderRouter("./src/app");
    expect(await screen.findByText("Couldn't load")).toBeOnTheScreen();

    listSpy.mockResolvedValue([]);
    const user = userEvent.setup();
    await user.press(screen.getByRole("button", { name: "Retry" }));

    await waitFor(() => {
      expect(screen.queryByText("Couldn't load")).not.toBeOnTheScreen();
    });
  });

  test("shows error toast when delete fails", async () => {
    jest
      .spyOn(ralliesDb, "deleteRally")
      .mockRejectedValue(new Error("disk full"));
    jest.mocked(toast.error).mockClear();

    const user = await renderHomeWithRally("Delete fails rally");
    await user.press(
      screen.getByRole("button", { name: "Delete Delete fails rally" }),
    );
    await act(async () => {
      findAlertButton("destructive").onPress?.();
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Something went wrong. Please try again.",
      );
    });
    expect(screen.getByText("Delete fails rally")).toBeOnTheScreen();
  });
});
