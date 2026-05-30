const express = require("express");
const pool = require("./db");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

async function waitForDB() {
  while (true) {
    try {
      await pool.query("SELECT 1");
      console.log("DB connected");
      break;
    } catch (err) {
      console.log("Waiting for DB...");
      await new Promise(res => setTimeout(res, 2000));
    }
  }
}
app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.status(200).json({
      status: "ok",
      database: "connected",
      version: "2.0.0"
    });
  } catch (err) {
    res.status(503).json({
      status: "error",
      database: "disconnected",
      version: "2.0.0"
    });
  }
});

async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      completed BOOLEAN DEFAULT false,
      priority TEXT DEFAULT 'medium'
    )
  `);
}

app.get("/tasks", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM tasks");
    res.json(result.rows);
  } catch (err) {
    res.status(503).json({ error: "database unavailable" });
  }
});

app.post("/tasks", async (req, res) => {
  if (!req.body || !req.body.title) {
    return res.status(400).json({ error: "title is required" });
  }

  const { title, priority = "medium" } = req.body;

  const result = await pool.query(
    "INSERT INTO tasks (title, priority) VALUES ($1, $2) RETURNING *",
    [title, priority]
  );

  res.status(201).json(result.rows[0]);
});


app.patch("/tasks/:id", async (req, res) => {
  const { id } = req.params;
  const { completed } = req.body;

  const result = await pool.query(
    "UPDATE tasks SET completed=$1 WHERE id=$2 RETURNING *",
    [completed, id]
  );

  res.json(result.rows[0]);
});


app.delete("/tasks/:id", async (req, res) => {
  const { id } = req.params;

  await pool.query("DELETE FROM tasks WHERE id=$1", [id]);
  res.sendStatus(204);
});


const PORT = 3000;

app.listen(PORT, async () => {
  await waitForDB();
  await initDB();
  console.log("Server started on port", PORT);
});