import { getDatabase } from "@repo/db";
import { env } from "./env.js";

let db: ReturnType<typeof getDatabase> | null = null;

export function getDb() {
  if (!db) {
    if (!env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL is not defined. Please set it in your environment variables.",
      );
    }
    db = getDatabase(env.DATABASE_URL);
  }
  return db;
}

// Export commonly used helpers
export { sql, eq, and, or, desc, asc, count, sum } from "@repo/db";
