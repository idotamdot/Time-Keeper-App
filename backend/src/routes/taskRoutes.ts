import { Router, Request, Response } from "express";
import { parseAndSaveTasks } from "../controllers/parseController";
import { db } from "../db/db";
import { tasks } from "../db/schema";
import { eq, and, lte } from "drizzle-orm";

// Optional middleware for future use
// import { authMiddleware } from "../middleware/auth";

const router = Router();
// router.use(authMiddleware); // Uncomment if you add auth later

// --- Interfaces ---
interface BreakdownRequestBody {
  input: string;
}

interface TaskFromDB {
  id: number;
  title: string;
  isComplete: boolean | null;
  dueDate: string | null;
  createdAt: string | null;
  recurring: string | null;
  category: string | null;
  priorityTags: string | null;
}

interface TaskWithParsedTags extends TaskFromDB {
  parsedPriorityTags: string[];
}

interface ErrorResponse {
  error: string;
}

// --- Utilities ---
const parsePriorityTags = (priorityTags: string | null): string[] =>
  priorityTags ? priorityTags.split(",").map(tag => tag.trim()).filter(Boolean) : [];

const tagRank = (tags: string[]): number => {
  if (!tags.length) return 999;
  const uniqueTags = [...new Set(tags)].sort();
  const joined = uniqueTags.join(",");
  const ranks: Record<string, number> = {
    "important,urgent": 1,
    "important": 2,
    "urgent": 3,
    "not important,urgent": 4,
    "important,not urgent": 5,
    "not important": 6,
    "not urgent": 7,
    "not important,not urgent": 8,
  };
  return ranks[joined] ?? 999;
};

// --- POST /api/tasks/breakdown ---
router.post("/breakdown", async (req: Request<{}, any, BreakdownRequestBody>, res: Response<TaskFromDB[] | ErrorResponse>) => {
  const { input } = req.body;
  if (!input || typeof input !== "string" || input.trim() === "") {
    return res.status(400).json({ error: "Missing or invalid input" });
  }

  try {
    const result: TaskFromDB[] = await parseAndSaveTasks(input);
    res.status(201).json(result);
  } catch (err) {
    console.error("[POST /breakdown] Error:", err);
    res.status(500).json({ error: "An internal server error occurred." });
  }
});

// --- GET /api/tasks ---
router.get("/", async (req: Request, res: Response<{ top10: TaskWithParsedTags[]; all: TaskWithParsedTags[] } | ErrorResponse>) => {
  try {
    // --- Optional Filters ---
    const { category, isComplete, dueBefore, page = "1", limit = "50" } = req.query;

    const whereClauses = [];
    if (category) whereClauses.push(eq(tasks.category, String(category)));
    if (isComplete !== undefined) whereClauses.push(eq(tasks.isComplete, isComplete === "true"));
    if (dueBefore) whereClauses.push(lte(tasks.dueDate, String(dueBefore)));

    const offset = (parseInt(page as string, 10) - 1) * parseInt(limit as string, 10);
    const filteredTasks: TaskFromDB[] = await db
      .select()
      .from(tasks)
      .where(and(...whereClauses))
      .limit(Number(limit))
      .offset(offset);

    const tasksWithParsedTags: TaskWithParsedTags[] = filteredTasks.map(task => ({
      ...task,
      parsedPriorityTags: parsePriorityTags(task.priorityTags),
    }));

    const sortedTasks = [...tasksWithParsedTags].sort(
      (a, b) => tagRank(a.parsedPriorityTags) - tagRank(b.parsedPriorityTags)
    );

    const prioritizedTop10 = sortedTasks.slice(0, 10);

    res.status(200).json({ top10: prioritizedTop10, all: sortedTasks });
  } catch (err) {
    console.error("[GET /tasks] Error:", err);
    res.status(500).json({ error: "An internal server error occurred." });
  }
});

// --- PATCH /api/tasks/toggle/:id ---
router.patch("/toggle/:id", async (req: Request<{ id: string }>, res: Response<TaskFromDB | ErrorResponse>) => {
  const taskId = Number(req.params.id);
  if (isNaN(taskId)) return res.status(400).json({ error: "Invalid task ID" });

  try {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, taskId));
    if (!task) return res.status(404).json({ error: "Task not found" });

    const updated = await db
      .update(tasks)
      .set({ isComplete: !task.isComplete })
      .where(eq(tasks.id, taskId))
      .returning();

    res.status(200).json(updated[0]);
  } catch (err) {
    console.error("[PATCH /toggle/:id] Error:", err);
    res.status(500).json({ error: "Failed to toggle task completion" });
  }
});

// --- PATCH /api/tasks/mark-recurring/:id ---
router.patch("/mark-recurring/:id", async (req: Request<{ id: string }, any, { recurring: string }>, res: Response<TaskFromDB | ErrorResponse>) => {
  const taskId = Number(req.params.id);
  const { recurring } = req.body;
  if (isNaN(taskId) || !recurring) return res.status(400).json({ error: "Invalid request" });

  try {
    const updated = await db
      .update(tasks)
      .set({ recurring })
      .where(eq(tasks.id, taskId))
      .returning();

    res.status(200).json(updated[0]);
  } catch (err) {
    console.error("[PATCH /mark-recurring/:id] Error:", err);
    res.status(500).json({ error: "Failed to mark task as recurring" });
  }
});

// --- DELETE /api/tasks/delete/:id ---
router.delete("/delete/:id", async (req: Request<{ id: string }>, res: Response<{ success: boolean } | ErrorResponse>) => {
  const taskId = Number(req.params.id);
  if (isNaN(taskId)) return res.status(400).json({ error: "Invalid task ID" });

  try {
    await db.delete(tasks).where(eq(tasks.id, taskId));
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("[DELETE /delete/:id] Error:", err);
    res.status(500).json({ error: "Failed to delete task" });
  }
});

export default router;

// Note: This code assumes that the database connection and schema are set up correctly.
// The error handling is basic and can be improved further.
// The middleware for authentication is commented out and can be added later.
// The code is structured to allow for easy expansion and modification in the future.