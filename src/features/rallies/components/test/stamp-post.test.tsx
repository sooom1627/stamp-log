import { render, screen } from "@testing-library/react-native";

import { StampPost } from "../stamp-post";

const defaultProps = {
  id: 1,
  emoji: "🔬",
  title: "Thu, Oct 8",
  detail: "7:02 PM",
  memo: "Talked at the lab",
  onEdit: () => {},
  onDelete: () => {},
};

describe("S-010 T-001 ST-002 StampPost rally name", () => {
  test("shows the rally name under the date and time when given", async () => {
    await render(<StampPost {...defaultProps} rallyName="Researchers I met" />);

    expect(screen.getByText("Researchers I met")).toBeOnTheScreen();
    expect(screen.getByText("Thu, Oct 8")).toBeOnTheScreen();
    expect(screen.getByText("Talked at the lab")).toBeOnTheScreen();
  });

  test("shows no rally name line when not given", async () => {
    await render(<StampPost {...defaultProps} />);

    expect(screen.queryByText("Researchers I met")).not.toBeOnTheScreen();
    expect(screen.getByText("Talked at the lab")).toBeOnTheScreen();
  });
});
