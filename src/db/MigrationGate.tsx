/**
 * MigrationGate — runs Drizzle migrations once at boot and gates the app UI behind them
 * (docs/architecture.md §5, §8). Children render only after migrations succeed; until then
 * a loading screen shows, and on failure a full-screen recoverable error (never a white
 * screen). Built from the Phase 1 primitives (EmptyState) — no inline styling.
 */
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { type ReactNode } from "react";
import { View } from "react-native";

import { strings } from "@/lib";
import { EmptyState } from "@/ui/primitives";

import { db } from "./client";
import migrations from "./migrations/migrations";

export interface MigrationGateProps {
  children: ReactNode;
}

export function MigrationGate({ children }: MigrationGateProps) {
  const { success, error } = useMigrations(db, migrations);

  if (error) {
    // Recoverable: the message is surfaced; restarting re-runs the gate.
    return (
      <View className="flex-1 bg-surface">
        <EmptyState
          glyph="database-alert-outline"
          title={strings.migration.errorTitle}
          body={strings.migration.errorBody}
        />
      </View>
    );
  }

  if (!success) {
    return (
      <View className="flex-1 bg-surface">
        <EmptyState
          glyph="database-sync-outline"
          title={strings.migration.loadingTitle}
          body={strings.migration.loadingBody}
        />
      </View>
    );
  }

  return <>{children}</>;
}
