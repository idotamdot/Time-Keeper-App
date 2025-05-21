// File: backend/src/index.ts
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import taskRoutes from "./routes/taskRoutes"; // ✅ correct import

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ✅ Mount your routes under /api
app.use("/api/tasks", taskRoutes); // important — mounts the router

app.get("/", (req, res) => {
  res.send("⏳ Time Keeper backend is running!");
});

app.listen(PORT, () => {
  console.log(`✅ Server live at http://localhost:${PORT}`);
});
