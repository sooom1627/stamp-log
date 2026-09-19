import "react-native-gesture-handler/jestSetup";

jest.mock("expo-sqlite");
jest.mock("sonner-native", () => {
  const toast = Object.assign(jest.fn(), { dismiss: jest.fn() });
  return {
    Toaster: () => null,
    toast,
  };
});
