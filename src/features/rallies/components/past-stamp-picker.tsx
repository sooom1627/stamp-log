import { DateTimePicker } from "@expo/ui/community/datetime-picker";

export type PastStampPickerProps = {
  testID: string;
  mode: "date" | "time";
  value: Date;
  maximumDate?: Date;
  onChange: (date: Date) => void;
};

export function PastStampPicker({
  testID,
  mode,
  value,
  maximumDate,
  onChange,
}: PastStampPickerProps) {
  return (
    <DateTimePicker
      testID={testID}
      mode={mode}
      value={value}
      maximumDate={maximumDate}
      accentColor="#f97316"
      onValueChange={(_event, date) => onChange(date)}
    />
  );
}
