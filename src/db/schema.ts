/**
 * Drizzle schema — the ONE source of truth for the database shape.
 * Implements docs/architecture.md §4. Do not "fix" the embedded design decisions there
 * (token-key color/icon, flat cadence, the uniq_habit_day guarantee) without a reason.
 *
 * Dates are stored as ISO-8601 strings in the local-calendar sense:
 *   - check-in days are 'YYYY-MM-DD' (no time, no zone),
 *   - timestamps (createdAt/archivedAt) are full ISO / SQLite CURRENT_TIMESTAMP.
 */
import { sql } from "drizzle-orm";
import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const habits = sqliteTable("habits", {
  id: text("id").primaryKey(), // uuid — see src/lib/id.ts (never autoincrement)
  name: text("name").notNull(),
  color: text("color").notNull(), // token key, e.g. 'green' — NOT a hex
  icon: text("icon").notNull(), // icon name from the icon set
  // Cadence, stored flat (not JSON) to stay SQL-queryable:
  cadenceType: text("cadence_type", {
    enum: ["daily", "weekdays", "weekly_count"],
  }).notNull(),
  weekdays: text("weekdays"), // CSV '1,3,5' (0=Sun..6=Sat) — only for 'weekdays'
  weeklyTarget: integer("weekly_target"), // N — only for 'weekly_count'
  sortOrder: integer("sort_order").notNull().default(0),
  archivedAt: text("archived_at"), // ISO ts or null
  createdAt: text("created_at")
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
});

export const checkins = sqliteTable(
  "checkins",
  {
    id: text("id").primaryKey(),
    habitId: text("habit_id")
      .notNull()
      .references(() => habits.id, { onDelete: "cascade" }),
    day: text("day").notNull(), // 'YYYY-MM-DD' local calendar day
    createdAt: text("created_at")
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`),
  },
  // Array form of the extra-config callback (drizzle 0.45: the object form is deprecated).
  (t) => [
    // The real "one check-in per habit per day" guarantee lives here, at the DB level —
    // toggling is an insert-or-delete against this unique index (architecture.md §7.4).
    uniqueIndex("uniq_habit_day").on(t.habitId, t.day),
    index("idx_checkins_habit").on(t.habitId),
    index("idx_checkins_day").on(t.day),
  ],
);

export type Habit = typeof habits.$inferSelect;
export type NewHabit = typeof habits.$inferInsert;
export type Checkin = typeof checkins.$inferSelect;
export type NewCheckin = typeof checkins.$inferInsert;

/** Cadence type union, derived from the schema so it can never drift from the column. */
export type CadenceType = Habit["cadenceType"];
