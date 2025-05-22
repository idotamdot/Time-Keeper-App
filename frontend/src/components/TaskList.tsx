// frontend/src/components/TaskList.tsx
import { useEffect, useState } from "react";

interface Task {
  id: number;
  title: string;
  isComplete: boolean | null;
  dueDate: string | null;
  category: string | null;
  parsedPriorityTags: string[];
}

export function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/tasks");
        if (!res.ok) throw new Error("Failed to fetch tasks");

        const data = await res.json();
        setTasks(data.top10); // You can also use data.all
      } catch (err) {
        console.error(err);
        setError("⚠️ Could not load tasks");
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const toggleComplete = async (id: number) => {
    try {
      const res = await fetch(`http://localhost:5000/api/tasks/toggle/${id}`, {
        method: "PATCH",
      });
      if (!res.ok) throw new Error("Toggle failed");
      const updated = await res.json();

      setTasks((prev) =>
        prev.map((task) =>
          task.id === id ? { ...task, isComplete: updated.isComplete } : task
        )
      );
    } catch (err) {
      console.error("❌ Toggle error:", err);
    }
  };

  if (loading) return <p>Loading tasks...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div style={{ padding: "1rem" }}>
      <h2>🗂️ Top Priority Tasks</h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {tasks.map((task) => (
          <li
            key={task.id}
            style={{
              marginBottom: "1rem",
              padding: "0.75rem",
              border: "1px solid #ccc",
              borderRadius: "8px",
              backgroundColor: task.isComplete ? "#e0ffe0" : "#fff8e1",
            }}
          >
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <input
                type="checkbox"
                checked={!!task.isComplete}
                onChange={() => toggleComplete(task.id)}
              />
              <strong>{task.title}</strong>
            </label>
            <div>📅 Due: {task.dueDate || "—"}</div>
            <div>🏷️ Category: {task.category || "—"}</div>
            <div>🔥 Priority Tags: {task.parsedPriorityTags.join(", ") || "—"}</div>
            <div>Status: {task.isComplete ? "✅ Done" : "🕒 Incomplete"}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
