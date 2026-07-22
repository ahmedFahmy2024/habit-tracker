module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      // jsxImportSource: 'nativewind' enables className on RN components.
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      // Reanimated 4 uses the worklets plugin (NOT react-native-reanimated/plugin).
      // Verified against react-native-worklets@0.10.0 source. MUST be last.
      "react-native-worklets/plugin",
    ],
  };
};
