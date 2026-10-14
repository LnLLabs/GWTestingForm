import "server-only";

import Database from "better-sqlite3";
import { drizzle, type BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import fs from "node:fs";
import path from "node:path";
import { getEnv } from "@/lib/env";
import * as schema from "@/lib/schema";

type DatabaseHandle = BetterSQLite3Database<typeof schema> & {
  $client: Database.Database;
};

let current: { path: string; db: DatabaseHandle } | null = null;

export function getDb(): DatabaseHandle {
  const { databasePath } = getEnv();
  if (current?.path === databasePath) return current.db;

  current?.db.$client.close();
  fs.mkdirSync(path.dirname(databasePath), { recursive: true });

  const sqlite = new Database(databasePath);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");

  const db = drizzle(sqlite, { schema }) as DatabaseHandle;
  migrate(db, {
    migrationsFolder: path.join(process.cwd(), "drizzle"),
  });

  current = { path: databasePath, db };
  return db;
}

export function closeDb() {
  current?.db.$client.close();
  current = null;
}
