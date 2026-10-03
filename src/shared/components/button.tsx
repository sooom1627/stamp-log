import { ActivityIndicator, Pressable, Text } from "react-native";

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: "primary" | "danger";
  disabled?: boolean;
  isLoading?: boolean;
  /** Outer spacing only (e.g. `mt-8`). */
  className?: string;
  "aria-label"?: string;
};

const pressableClassNames = {
  primary: "bg-primary active:bg-main-hover",
  danger: "border-danger active:bg-danger/10 border",
  disabled: "bg-surface-muted-active",
} as const;

const labelClassNames = {
  primary: "text-primary-foreground",
  danger: "text-danger",
  disabled: "text-text-muted",
} as const;

export function Button({
  label,
  onPress,
  variant = "primary",
  disabled = false,
  isLoading = false,
  className = "",
  "aria-label": ariaLabel,
}: ButtonProps) {
  // While loading the button keeps its variant look; only an idle disabled button is muted.
  const look = disabled && !isLoading ? "disabled" : variant;

  return (
    <Pressable
      role="button"
      aria-label={ariaLabel ?? label}
      aria-disabled={disabled || isLoading}
      aria-busy={isLoading}
      disabled={disabled || isLoading}
      onPress={onPress}
      className={`border-continuous flex-row items-center justify-center gap-2 rounded-2xl py-4 ${pressableClassNames[look]} ${className}`}
    >
      {isLoading ? (
        <ActivityIndicator
          testID="button-spinner"
          size="small"
          colorClassName={
            variant === "danger" ? "accent-danger" : "accent-primary-foreground"
          }
        />
      ) : null}
      <Text className={`text-base font-semibold ${labelClassNames[look]}`}>
        {label}
      </Text>
    </Pressable>
  );
}
