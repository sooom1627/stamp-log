import "react-native-gesture-handler/jestSetup";

jest.mock("expo-sqlite");
jest.mock("sonner-native", () => ({
  Toaster: () => null,
  toast: jest.fn(),
}));
