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

export const db = drizzle(expoDb, { schema });

export type DB = typeof db;
