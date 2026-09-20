import { getSessionGreeting } from "../session-greeting";

const greetings = ["Hello", "Welcome back", "Good morning"];

describe("S-019 ST-001 getSessionGreeting", () => {
  test("returns Hello, Welcome back, or Good morning", () => {
    expect(greetings).toContain(getSessionGreeting());
  });

  test("returns the same greeting within one app launch", () => {
    expect(getSessionGreeting()).toBe(getSessionGreeting());
  });
});
