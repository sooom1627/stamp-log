import Storage from "expo-sqlite/kv-store";

import { hasOnboarded, markOnboarded } from "../onboarding-state";

beforeEach(() => {
  Storage.clearSync();
});

describe("S-047 T-001 ST-002 onboarding state", () => {
  test("is not done on a fresh install", () => {
    expect(hasOnboarded()).toBe(false);
  });

  test("stays done once marked", () => {
    markOnboarded();

    expect(hasOnboarded()).toBe(true);
  });
});
