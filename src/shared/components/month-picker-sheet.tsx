import { useState } from "react";

import {
  BottomSheet,
  Button,
  Host,
  HStack,
  Picker,
  Text,
  VStack,
} from "@expo/ui/swift-ui";
import { pickerStyle, tag } from "@expo/ui/swift-ui/modifiers";

const MONTH_NAMES = Array.from({ length: 12 }, (_, monthIndex) =>
  new Intl.DateTimeFormat("en-US", { month: "long" }).format(
    new Date(2026, monthIndex, 1),
  ),
);

type MonthPickerSheetProps = {
  isPresented: boolean;
  month: Date;
  years: number[];
  onDone: (month: Date) => void;
  onClose: () => void;
};

// Native SwiftUI wheels in a native sheet, styled by the system on purpose:
// no custom drawing to keep in sync with iOS.
export function MonthPickerSheet({
  isPresented,
  month,
  years,
  onDone,
  onClose,
}: MonthPickerSheetProps) {
  const [monthIndex, setMonthIndex] = useState(month.getMonth());
  const [year, setYear] = useState(month.getFullYear());
  const [wasPresented, setWasPresented] = useState(isPresented);

  // Start from the shown month every time the sheet opens, so wheels turned
  // and then dismissed without Done do not linger.
  if (isPresented !== wasPresented) {
    setWasPresented(isPresented);
    if (isPresented) {
      setMonthIndex(month.getMonth());
      setYear(month.getFullYear());
    }
  }

  return (
    <Host matchContents>
      <BottomSheet
        testID="month-picker-sheet"
        isPresented={isPresented}
        onIsPresentedChange={(presented) => {
          if (!presented) onClose();
        }}
        fitToContents
      >
        <VStack spacing={8}>
          <HStack>
            <Picker
              testID="month-picker-month"
              label="Month"
              selection={monthIndex}
              onSelectionChange={setMonthIndex}
              modifiers={[pickerStyle("wheel")]}
            >
              {MONTH_NAMES.map((name, index) => (
                <Text key={name} modifiers={[tag(index)]}>
                  {name}
                </Text>
              ))}
            </Picker>
            <Picker
              testID="month-picker-year"
              label="Year"
              selection={year}
              onSelectionChange={setYear}
              modifiers={[pickerStyle("wheel")]}
            >
              {years.map((candidate) => (
                <Text key={candidate} modifiers={[tag(candidate)]}>
                  {String(candidate)}
                </Text>
              ))}
            </Picker>
          </HStack>
          <Button
            testID="month-picker-done"
            label="Done"
            onPress={() => onDone(new Date(year, monthIndex, 1))}
          />
        </VStack>
      </BottomSheet>
    </Host>
  );
}
