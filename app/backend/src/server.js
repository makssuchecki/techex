const express = require("express");
const pool = require("./db");

const app = express();
app.use(express.json());


app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.status(200).json({
      status: "ok",
      database: "connected",
    });
  } catch (err) {
    res.status(503).json({
      status: "error",
      database: "disconnected",
    });
  }
});

async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      completed BOOLEAN DEFAULT false
    )
  `);
}

app.get("/tasks", async (req, res) => {
  const result = await pool.query("SELECT * FROM tasks");
  res.json(result.rows);
});


app.post("/tasks", async (req, res) => {
  const { title } = req.body;

  const result = await pool.query(
    "INSERT INTO tasks (title) VALUES ($1) RETURNING *",
    [title]
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
  console.log("Server started on port", PORT);
  await initDB();
});