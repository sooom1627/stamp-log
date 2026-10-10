import { render, screen } from "@testing-library/react-native";

import { StampPost } from "../stamp-post";

const defaultProps = {
  id: 1,
  emoji: "🔬",
  title: "Researchers I met",
  detail: "7:02 PM",
  memo: "Talked at the lab",
  onEdit: () => {},
  onDelete: () => {},
};

describe("S-011 RT-001 ST-003 StampPost", () => {
  test("shows a bold title, a light detail and the memo", async () => {
    await render(<StampPost {...defaultProps} />);

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
    await render(<StampPost {...defaultProps} memo={null} />);

    expect(screen.getByText("no memo")).toBeOnTheScreen();
  });
});
