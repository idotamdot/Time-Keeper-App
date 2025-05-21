// frontend/src/components/TaskInput.tsx

import { useState } from "react";

export function TaskInput() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("http://localhost:5000/api/tasks/breakdown", {

        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input }),
      });

      if (!res.ok) throw new Error("Failed to submit");

      const data = await res.json();
      console.log("Response:", data);
      setMessage("✅ Task submitted!");
      setInput("");
    } catch (err) {
      console.error(err);
      setMessage("❌ Error submitting task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: "1rem" }}>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="e.g. Finish blog post #writing due:2025-06-01"
        style={{ width: "70%", padding: "0.5rem" }}
      />
      <button type="submit" disabled={loading} style={{ marginLeft: "1rem" }}>
        {loading ? "Submitting..." : "Add Task"}
      </button>
      {message && <p>{message}</p>}
    </form>
  );
}
