/**
 * Jest config — domain unit tests (docs/code-standards.md §11).
 *
 * Uses the `jest-expo/node` preset: the Expo toolchain (so babel transforms match the app)
 * but a Node test environment, since the domain layer is pure — zero React/RN/expo imports
 * (docs/code-standards.md §5). Feature-level component tests, when they arrive, can add a
 * second project on the default `jest-expo` preset.
 *
 * Only `src/domain/**` is collected for now; that's where correctness lives this phase.
 */
module.exports = {
  preset: "jest-expo/node",
  testMatch: ["<rootDir>/src/domain/**/*.test.ts"],
  clearMocks: true,
};
