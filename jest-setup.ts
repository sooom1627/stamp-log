import "react-native-gesture-handler/jestSetup";

import Storage from "expo-sqlite/kv-store";

import { markOnboarded } from "@/features/onboarding/db/onboarding-state";
import { i18n } from "@/shared/i18n";

jest.mock("react-native-worklets", () =>
  jest.requireActual("react-native-worklets/src/mock"),
);
jest.mock("react-native-reanimated", () => {
  return jest.requireActual("react-native-reanimated/mock");
});

jest.mock("expo-sqlite");
jest.mock("expo-sqlite/kv-store");
jest.mock("uniwind", () => ({
  withUniwind: <T>(Component: T) => Component,
  useCSSVariable: () => "#f97316",
  useResolveClassNames: () => ({
    backgroundColor: "#ffffff",
    color: "#1e293b",
  }),
}));
jest.mock("sonner-native", () => {
  const toast = Object.assign(jest.fn(), {
    dismiss: jest.fn(),
    error: jest.fn(),
  });
  return {
    Toaster: () => null,
    toast,
  };
});
// RN 0.88's Jest renderer rejects the test host instance PagerView passes to
// its native commands (setPage), logging an error on every page change. The
// commands have no native side in Jest, so dispatch nothing.
jest.mock("react-native/Libraries/ReactNative/RendererProxy", () => ({
  ...jest.requireActual<object>(
    "@react-native/jest-preset/jest/mocks/RendererProxy",
  ),
  dispatchCommand: jest.fn(),
}));

// Tests open the app as someone who already finished onboarding (S-047);
// onboarding tests clear the storage first. They read English text, so a test
// that switches to Japanese does not leak into the next one.
beforeEach(async () => {
  // Device settings (onboarding, language) start empty in every test.
  Storage.clearSync();
  markOnboarded();
  await i18n.changeLanguage("en");
});
