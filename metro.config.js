// Learn more: https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

// isTsconfigPathsEnabled: honor the `@/*` alias declared in tsconfig.json.
const config = getDefaultConfig(__dirname, { isTsconfigPathsEnabled: true });

module.exports = withNativeWind(config, { input: "./src/global.css" });
