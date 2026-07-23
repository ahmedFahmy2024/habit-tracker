/**
 * drizzle-kit config — generates SQL migrations from src/db/schema.ts.
 *
 * dialect 'sqlite' + driver 'expo' is the Expo SQLite strategy: drizzle-kit emits a bundled
 * `migrations.js` (the journal + SQL as a JS object) that `useMigrations` reads at boot,
 * instead of loose .sql files a Node driver would apply. Verified against the installed
 * drizzle-kit 0.31 Config type (dialect 'sqlite', driver 'expo').
 *
 * Regenerate after any schema change:  bunx drizzle-kit generate
 */
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  driver: "expo",
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
});
