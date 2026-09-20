import { render, screen, userEvent } from "@testing-library/react-native";

import { RallyTypeRadios } from "../rally-type-radios";

jest.useFakeTimers();

describe("S-002 T-002 RT-003 ST-001 RallyTypeRadios", () => {
  test("人・場所・行動のラジオが3つ出る", async () => {
    await render(<RallyTypeRadios value="place" onChange={() => {}} />);

    const typeRadios = screen.getAllByRole("radio");
    expect(typeRadios).toHaveLength(3);
    expect(typeRadios[0]).toHaveAccessibleName("場所");
    expect(typeRadios[1]).toHaveAccessibleName("行動");
    expect(typeRadios[2]).toHaveAccessibleName("人");
    expect(typeRadios[0]).toBeChecked();
    expect(typeRadios[1]).not.toBeChecked();
  });

  test("ラジオを押すと onChange にタイプが渡る", async () => {
    const onChange = jest.fn();
    const user = userEvent.setup();

    await render(<RallyTypeRadios value="place" onChange={onChange} />);

    await user.press(screen.getByRole("radio", { name: "人" }));

    expect(onChange).toHaveBeenCalledWith("person");
  });
});
