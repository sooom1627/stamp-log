import "react-native-gesture-handler/jestSetup";

jest.mock("expo-sqlite");
jest.mock("uniwind", () => ({
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
