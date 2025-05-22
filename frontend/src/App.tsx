import { TaskInput } from "./components/TaskInput";
import { TaskList } from "./components/TaskList";

function App() {
  return (
    <div>
      <h1 style={{ textAlign: "center", padding: "1rem" }}>🕰️ Time Keeper</h1>
      <TaskInput />
      <TaskList />
    </div>
  );
}

export default App;

