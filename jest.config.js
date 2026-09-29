module.exports = {
  preset: "jest-expo",
  passWithNoTests: true,
  // The first renderRouter("./src/app") in a suite loads the whole route tree; without a transform cache (CI) that exceeds 5 s.
  testTimeout: 15000,
  setupFilesAfterEnv: ["./jest-setup.ts"],
  testPathIgnorePatterns: [
    "/node_modules/",
    ".cursor/",
    ".claude/",
    ".agents/",
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@/assets/(.*)$": "<rootDir>/assets/$1",
    "^lucide-react-native$": "<rootDir>/__mocks__/lucide-react-native.tsx",
    "\\.css$": "<rootDir>/__mocks__/style-mock.ts",
  },
};
