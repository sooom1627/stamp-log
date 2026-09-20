import { render, screen, userEvent } from "@testing-library/react-native";

import { RallyTypeRadios } from "../rally-type-radios";

jest.useFakeTimers();

describe("S-002 T-002 RT-003 ST-001 RallyTypeRadios", () => {
  test("shows three radios for person, place, and action", async () => {
    await render(<RallyTypeRadios value="place" onChange={() => {}} />);

    const typeRadios = screen.getAllByRole("radio");
    expect(typeRadios).toHaveLength(3);
    expect(typeRadios[0]).toHaveAccessibleName("Place");
    expect(typeRadios[1]).toHaveAccessibleName("Action");
    expect(typeRadios[2]).toHaveAccessibleName("Person");
    expect(typeRadios[0]).toBeChecked();
    expect(typeRadios[1]).not.toBeChecked();
  });

  test("passes the selected type to onChange when a radio is pressed", async () => {
    const onChange = jest.fn();
    const user = userEvent.setup();

    await render(<RallyTypeRadios value="place" onChange={onChange} />);

    await user.press(screen.getByRole("radio", { name: "Person" }));

    expect(onChange).toHaveBeenCalledWith("person");
  });
});
