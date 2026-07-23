// Learn more: https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

// isTsconfigPathsEnabled: honor the `@/*` alias declared in tsconfig.json.
const config = getDefaultConfig(__dirname, { isTsconfigPathsEnabled: true });

// Let Metro resolve `.sql` files so drizzle's generated migrations can be imported
// (paired with babel-plugin-inline-import in babel.config.js). Required by
// drizzle-orm/expo-sqlite migrations — docs/architecture.md §8.
config.resolver.sourceExts.push("sql");

module.exports = withNativeWind(config, { input: "./src/global.css" });
