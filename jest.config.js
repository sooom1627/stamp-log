module.exports = {
  preset: "jest-expo",
  passWithNoTests: true,
  setupFilesAfterEnv: ["./jest-setup.ts"],
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)",
  ],
  testPathIgnorePatterns: [
    "/node_modules/",
    ".cursor/",
    ".claude/",
    ".agents/",
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@/assets/(.*)$": "<rootDir>/assets/$1",
  },
};
