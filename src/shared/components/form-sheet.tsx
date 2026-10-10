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
  /** Scrolls the content under a fixed heading. Only for sheets without a footer. */
  scrollable?: boolean;
  children: ReactNode;
};

// Sheets hide the native header, so the top padding is fixed: it only has to
// clear the grabber.
// Do not use ScrollView / KeyboardAvoidingView inside formSheet.
// react-native-screens force-overrides the ScrollView frame to the full sheet,
// which interferes with sibling content (footer) and stops rendering.
// Keep the root intrinsically sized so fitToContents includes the Save button.
// `scrollable` sheets (a day's posts, no footer) instead make one ScrollView the
// root, so that full-sheet frame becomes the scroll area.
export function FormSheetLayout({
  testID,
  eyebrow,
  title,
  className = "",
  scrollable = false,
  children,
}: FormSheetLayoutProps) {
  const heading = (
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
  );

  if (scrollable) {
    // The heading is the sticky first child, so it stays under the grabber
    // while the posts scroll beneath it.
    return (
      <ScrollView
        testID={testID}
        className="bg-background"
        contentContainerClassName={`gap-5 px-5 pb-6 ${className}`}
        stickyHeaderIndices={[0]}
      >
        <View
          testID={testID ? `${testID}-heading` : undefined}
          className="bg-background pt-8"
        >
          {heading}
        </View>
        {children}
      </ScrollView>
    );
  }

  return (
    <View
      testID={testID}
      className={`bg-background gap-5 px-5 pt-8 pb-6 ${className}`}
    >
      {heading}
      {children}
    </View>
  );
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
