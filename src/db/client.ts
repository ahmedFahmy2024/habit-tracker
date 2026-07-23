/**
 * The database singleton — opened ONCE, with change listeners on so `useLiveQuery`
 * re-renders on any write (docs/architecture.md §5). Nothing else opens the DB.
 */
import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";

import * as schema from "./schema";

/**
 * enableChangeListener is what makes reads reactive: expo-sqlite emits change events that
 * drizzle's useLiveQuery subscribes to. Without it, live queries never refresh.
 */
export const expoDb = openDatabaseSync("happit.db", {
  enableChangeListener: true,
});

/**
 * SQLite defaults `foreign_keys` to OFF per connection (it's a compile-time default expo-sqlite
 * doesn't override). Turn it ON so the `checkins.habitId` cascade (docs/architecture.md §4)
 * actually fires on `deleteHabit` — otherwise a hard delete would orphan its check-ins. Run
 * once, synchronously, on the single connection before any query.
 */
expoDb.execSync("PRAGMA foreign_keys = ON;");

export const db = drizzle(expoDb, { schema });

export type DB = typeof db;
