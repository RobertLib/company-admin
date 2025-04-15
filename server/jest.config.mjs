export default {
  preset: "ts-jest",
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  testMatch: ["**/__tests__/**/*.test.ts"],
  setupFilesAfterEnv: [
    "<rootDir>/src/__tests__/setup.ts",
    "<rootDir>/src/__tests__/mocks/prisma.ts",
  ],
};
