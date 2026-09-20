module.exports = {
  preset: "jest-expo",
  passWithNoTests: true,
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
