/**
 * ID generation — docs/code-standards.md §4 (IDs generated here; never autoincrement).
 *
 * Uses expo-crypto's `randomUUID()` (RFC4122 v4), the RN-safe path in Expo SDK 57. The npm
 * `uuid` package was rejected: the installed version relies on Node's `crypto.randomBytes`,
 * which isn't present in the React Native runtime without a polyfill.
 */
import { randomUUID } from "expo-crypto";

/** A new v4 UUID for a habit, check-in, or any row primary key. */
export function newId(): string {
  return randomUUID();
}
