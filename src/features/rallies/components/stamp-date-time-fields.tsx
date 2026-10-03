import { Text } from "react-native";

import { DatePicker, Host } from "@expo/ui/swift-ui";
import { tint } from "@expo/ui/swift-ui/modifiers";

import { useAccentColor } from "@/shared/hooks/use-accent-color";

type StampDateTimeFieldsProps = {
  value: Date;
  onChange: (next: Date) => void;
  /** testIDs become `${testIDPrefix}-date` and `${testIDPrefix}-time`. */
  testIDPrefix: string;
};

// Date and time pickers for one stampedAt; each picker changes only its part.
export function StampDateTimeFields({
  value,
  onChange,
  testIDPrefix,
}: StampDateTimeFieldsProps) {
  const accentColor = useAccentColor();

  const handleDateChange = (date: Date) => {
    const next = new Date(value);
    next.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
    onChange(next);
  };

  const handleTimeChange = (date: Date) => {
    const next = new Date(value);
    next.setHours(date.getHours(), date.getMinutes(), 0, 0);
    onChange(next);
  };

  return (
    <>
      <Host matchContents={{ vertical: true }}>
        <DatePicker
          testID={`${testIDPrefix}-date`}
          title="Date"
          selection={value}
          displayedComponents={["date"]}
          range={{ end: new Date() }}
          onDateChange={handleDateChange}
          modifiers={[tint(accentColor)]}
        />
      </Host>

      <Host matchContents={{ vertical: true }}>
        <DatePicker
          testID={`${testIDPrefix}-time`}
          title="Time"
          selection={value}
          displayedComponents={["hourAndMinute"]}
          onDateChange={handleTimeChange}
          modifiers={[tint(accentColor)]}
        />
      </Host>
    </>
  );
}

type StampDateTimeErrorsProps = {
  isFuture: boolean;
  hasStampOnDay: boolean;
};

export function StampDateTimeErrors({
  isFuture,
  hasStampOnDay,
}: StampDateTimeErrorsProps) {
  return (
    <>
      {isFuture ? (
        <Text className="text-danger text-sm">
          Future times can't be saved.
        </Text>
      ) : null}
      {hasStampOnDay ? (
        <Text className="text-danger text-sm">
          This rally already has a stamp on this day.
        </Text>
      ) : null}
    </>
  );
}
