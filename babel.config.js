module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      // jsxImportSource: 'nativewind' enables className on RN components.
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      // Inline the generated .sql migration files as strings so drizzle's Expo migrator
      // can bundle them (docs/architecture.md §8). Required by drizzle-orm/expo-sqlite.
      ["babel-plugin-inline-import", { extensions: [".sql"] }],
      // Reanimated 4 uses the worklets plugin (NOT react-native-reanimated/plugin).
      // Verified against react-native-worklets@0.10.0 source. MUST be last.
      "react-native-worklets/plugin",
    ],
  };
};
