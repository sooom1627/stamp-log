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

export function Button({
  label,
  onPress,
  variant = "primary",
  disabled = false,
  isLoading = false,
  className = "",
  "aria-label": ariaLabel,
}: ButtonProps) {
  const isMuted = disabled && !isLoading;

  return (
    <Pressable
      role="button"
      aria-label={ariaLabel ?? label}
      accessibilityState={{ disabled, busy: isLoading }}
      disabled={disabled}
      onPress={onPress}
      className={`${className} ${containerClassName(variant, isMuted)}`}
    >
      {isLoading ? (
        <ActivityIndicator
          testID="button-spinner"
          size="small"
          colorClassName="accent-white dark:accent-main-dark"
        />
      ) : null}
      <Text className={labelClassName(variant, isMuted)}>{label}</Text>
    </Pressable>
  );
}

function containerClassName(variant: ButtonProps["variant"], isMuted: boolean) {
  if (isMuted) {
    return "border-continuous bg-surface-muted-active flex-row items-center justify-center gap-2 rounded-2xl py-4";
  }
  if (variant === "danger") {
    return "border-continuous border-danger active:bg-danger/10 flex-row items-center justify-center gap-2 rounded-2xl border py-4";
  }
  return "border-continuous bg-main active:bg-main-hover flex-row items-center justify-center gap-2 rounded-2xl py-4 dark:bg-slate-100";
}

function labelClassName(variant: ButtonProps["variant"], isMuted: boolean) {
  if (isMuted) return "text-text-muted text-base font-semibold";
  if (variant === "danger") return "text-danger text-base font-semibold";
  return "dark:text-main-dark text-base font-semibold text-white";
}
