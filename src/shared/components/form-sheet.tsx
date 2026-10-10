import { type ReactNode } from "react";

import {
  ScrollView,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";

type FormSheetLayoutProps = {
  testID?: string;
  /** Small line above the title (e.g. the rally or the weekday). */
  eyebrow?: string;
  title: string;
  /** Extra layout classes (e.g. `gap-5`). */
  className?: string;
  /** Wraps the whole sheet in a ScrollView. Only for sheets without a footer. */
  scrollable?: boolean;
  children: ReactNode;
};

// Sheets hide the native header, so the top padding is fixed: it only has to
// clear the grabber.
// Do not use ScrollView / KeyboardAvoidingView inside formSheet.
// react-native-screens force-overrides the ScrollView frame to the full sheet,
// which interferes with sibling content (footer) and stops rendering.
// Keep the root intrinsically sized so fitToContents includes the Save button.
// `scrollable` sheets (a day's posts, no footer) instead put everything in one
// ScrollView, so that full-sheet frame becomes the scroll area.
export function FormSheetLayout({
  testID,
  eyebrow,
  title,
  className = "",
  scrollable = false,
  children,
}: FormSheetLayoutProps) {
  const sheet = (
    <View
      testID={testID}
      className={`bg-background gap-5 px-5 pt-8 pb-6 ${className}`}
    >
      <View className="gap-1">
        {eyebrow ? (
          <Text className="text-accent-strong text-sm font-semibold">
            {eyebrow}
          </Text>
        ) : null}
        <Text role="heading" className="text-foreground text-3xl font-bold">
          {title}
        </Text>
      </View>
      {children}
    </View>
  );

  if (!scrollable) return sheet;
  return <ScrollView className="bg-background">{sheet}</ScrollView>;
}

type FormFieldProps = {
  label: string;
  children: ReactNode;
};

export function FormField({ label, children }: FormFieldProps) {
  return (
    <View className="gap-2">
      <Text className="text-foreground text-sm font-semibold">{label}</Text>
      {children}
    </View>
  );
}

type FormTextInputProps = Omit<
  TextInputProps,
  | "cursorColorClassName"
  | "selectionColorClassName"
  | "placeholderTextColorClassName"
>;

export function FormTextInput({
  className = "",
  ...props
}: FormTextInputProps) {
  return (
    <TextInput
      {...props}
      className={`border-continuous border-border bg-surface-muted text-foreground focus:border-accent rounded-2xl border px-4 py-3.5 text-base ${className}`}
      cursorColorClassName="accent-accent"
      selectionColorClassName="accent-accent"
      placeholderTextColorClassName="accent-text-muted"
    />
  );
}
