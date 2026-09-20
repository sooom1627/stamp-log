import { getSessionGreeting } from "../session-greeting";

const greetings = ["Hello", "Welcome back", "Good morning"];

describe("S-019 ST-001 getSessionGreeting", () => {
  test("Hello / Welcome back / Good morning のいずれかを返す", () => {
    expect(greetings).toContain(getSessionGreeting());
  });

  test("同じ起動では同じ挨拶を返す", () => {
    expect(getSessionGreeting()).toBe(getSessionGreeting());
  });
});
