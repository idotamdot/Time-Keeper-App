import { db } from "../db/db";
import { tasks } from "../db/schema";
import { eq } from "drizzle-orm"; // Needed for filtering by title

// Utility: Parse tags from the line
function parseTags(line: string): string[] {
  const tagRegex = /#(\w+)/g;
  const tags = [];
  let match;
  while ((match = tagRegex.exec(line)) !== null) {
    tags.push(match[1]);
  }
  return tags;
}

// Utility: Parse due date from "due:2025-06-01" or "due:June 1"
function parseDueDate(line: string): string | null {
  const dueRegex = /due[:\s]*(\d{4}-\d{2}-\d{2}|\w+\s\d{1,2})/i;
  const match = line.match(dueRegex);
  return match ? match[1] : null;
}

export async function parseAndSaveTasks(input: string) {
  const lines = input.split("\n").map(line => line.trim()).filter(Boolean);
  if (lines.length === 0) return [];

  const keywordsToCategory = [
    { keywords: ["code", "develop", "debug"], category: "Dev" },
    { keywords: ["email", "reply"], category: "Admin" },
    { keywords: ["paint", "art", "design"], category: "Creative" },
    { keywords: ["call", "appointment", "meeting"], category: "Errands" },
    { keywords: ["read", "study", "learn"], category: "Mind" },
    { keywords: ["gym", "run", "workout"], category: "Body" },
    { keywords: ["pray", "meditate"], category: "Spiritual" },
  ];

  const taskEntries = [];

  for (const line of lines) {
    const lowerLine = line.toLowerCase();

    const matchedCategory =
      keywordsToCategory.find(({ keywords }) =>
        keywords.some(word => lowerLine.includes(word))
      )?.category || "General";

    // Check if task already exists in DB (title match)
    const existing = await db
      .select()
      .from(tasks)
      .where(eq(tasks.title, line));

    if (existing.length > 0) {
      console.log(`Skipping duplicate task: "${line}"`);
      continue;
    }

    const tags = parseTags(line);
    const dueDate = parseDueDate(line);

    taskEntries.push({
      title: line,
      category: matchedCategory,
      isComplete: false,
      priorityTags: tags.length > 0 ? tags.join(", ") : null,
      dueDate: dueDate || null,
    });
  }

  try {
    const result = await db.insert(tasks).values(taskEntries).returning();
    return result;
  } catch (error) {
    console.error("❌ Error inserting tasks:", error);
    throw new Error("Failed to save tasks to database");
  }
}
