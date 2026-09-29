import { DatePicker, Host } from "@expo/ui/swift-ui";
import { labelsHidden, tint } from "@expo/ui/swift-ui/modifiers";

import { type PastStampPickerProps } from "./past-stamp-picker";

// The community DateTimePicker only matches content height, so inside a row
// its Host collapses to zero width and the picker overflows the sheet edge.
// Match both axes so the row can right-align the picker at its own size.
export function PastStampPicker({
  testID,
  mode,
  value,
  maximumDate,
  onChange,
}: PastStampPickerProps) {
  return (
    <Host matchContents>
      <DatePicker
        testID={testID}
        selection={value}
        displayedComponents={mode === "date" ? ["date"] : ["hourAndMinute"]}
        range={maximumDate ? { end: maximumDate } : undefined}
        onDateChange={onChange}
        modifiers={[labelsHidden(), tint("#f97316")]}
      />
    </Host>
  );
}
