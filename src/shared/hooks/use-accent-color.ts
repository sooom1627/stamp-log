import { useCSSVariable } from "uniwind";

// For native views that take a color value instead of a className
// (@expo/ui SwiftUI views and modifiers).
export function useAccentColor() {
  return useCSSVariable("--color-accent") as string;
}
