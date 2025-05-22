// drizzle.config.ts
import { defineConfig } from "drizzle-kit";
export default defineConfig({
  schema: "./src/db/schema.ts", // ✅ Ensure this path is correct
  out: "./drizzle",
  driver: "better-sqlite3",
  dialect: "sqlite",
  dbCredentials: {
    url: "./src/db/timekeeper.db", // ✅ Path to your SQLite database file
  },
  // migrationsFolder: "./drizzle/migrations", // Optional: specify a custom migrations folder
  // migrationsTable: "migrations", // Optional: specify a custom migrations table
  // verbose: true, // Optional: for more detailed output from drizzle-kit
  // strict: true,  // Optional: for stricter schema checking
});
