import "react-native-gesture-handler/jestSetup";

jest.mock("react-native-worklets", () =>
  jest.requireActual("react-native-worklets/src/mock"),
);
jest.mock("react-native-reanimated", () => {
  return jest.requireActual("react-native-reanimated/mock");
});

jest.mock("expo-sqlite");
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
