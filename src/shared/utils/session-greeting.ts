const greetings = ["Hello", "Welcome back", "Good morning"] as const;

let sessionGreeting: (typeof greetings)[number] | undefined;

export function getSessionGreeting() {
  sessionGreeting ??= greetings[Math.floor(Math.random() * greetings.length)];
  return sessionGreeting;
}
