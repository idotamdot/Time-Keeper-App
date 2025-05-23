import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const tasks = sqliteTable("tasks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  isComplete: integer("is_complete", { mode: "boolean" }).default(false),
  dueDate: text("due_date"),
  createdAt: text("created_at")
    .notNull()
    .default("CURRENT_TIMESTAMP")
    .$onUpdate(() => new Date().toISOString()),
  recurring: text("recurring"),
  category: text("category").default("General"),
  priorityTags: text("priority_tags"),
});