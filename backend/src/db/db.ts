import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";
import path from "path";
import fs from "fs";

const dbPath = path.resolve("src/db/timekeeper.db");

if (!fs.existsSync(dbPath)) {
  console.warn("⚠️ SQLite DB not found. A new one will be created at:", dbPath);
}

const sqlite = new Database(dbPath);
export const db = drizzle(sqlite, { schema });