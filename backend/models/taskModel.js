const mysql = require("mysql2/promise");
const fs = require("fs/promises");
const path = require("path");

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "project_management",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const jsonFilePath = path.join(__dirname, "../data/tasks.json");

async function readJsonTasks() {
  try {
    const data = await fs.readFile(jsonFilePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function writeJsonTasks(tasks) {
  await fs.writeFile(jsonFilePath, JSON.stringify(tasks, null, 2), "utf8");
}

const allowedStatuses = new Set(["Pending", "In Progress", "Completed"]);

function validateTaskInput(input, partial = false) {
  const errors = {};

  if (!partial || Object.prototype.hasOwnProperty.call(input, "title")) {
    if (!input.title || !String(input.title).trim()) {
      errors.title = "Title is required.";
    }
  }

  if (!partial || Object.prototype.hasOwnProperty.call(input, "description")) {
    if (!input.description || String(input.description).trim().length < 20) {
      errors.description = "Description must be at least 20 characters.";
    }
  }

  if (!partial || Object.prototype.hasOwnProperty.call(input, "status")) {
    if (!allowedStatuses.has(input.status)) {
      errors.status = "Status must be Pending, In Progress, or Completed.";
    }
  }

  return errors;
}

async function getAllTasks() {
  if (!global.useMySQL) {
    const tasks = await readJsonTasks();
    return tasks.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }
  const [rows] = await pool.query("SELECT * FROM tasks ORDER BY created_at DESC");
  return rows;
}

async function createTask(input) {
  const errors = validateTaskInput(input);
  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  const title = String(input.title).trim();
  const description = String(input.description).trim();
  const status = input.status || "Pending";

  if (!global.useMySQL) {
    const tasks = await readJsonTasks();
    const newId = tasks.reduce((max, t) => t.id > max ? t.id : max, 0) + 1;
    const newTask = {
      id: newId,
      title,
      description,
      status,
      created_at: new Date().toISOString()
    };
    tasks.push(newTask);
    await writeJsonTasks(tasks);
    return { task: newTask };
  }

  const [result] = await pool.query(
    "INSERT INTO tasks (title, description, status) VALUES (?, ?, ?)",
    [title, description, status]
  );

  const [rows] = await pool.query("SELECT * FROM tasks WHERE id = ?", [result.insertId]);
  return { task: rows[0] };
}

async function updateTask(id, input) {
  const errors = validateTaskInput(input, true);
  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  if (!global.useMySQL) {
    const tasks = await readJsonTasks();
    const taskIndex = tasks.findIndex((t) => t.id === id);
    if (taskIndex === -1) {
      return { notFound: true };
    }

    const task = tasks[taskIndex];
    if (input.title !== undefined) {
      task.title = String(input.title).trim();
    }
    if (input.description !== undefined) {
      task.description = String(input.description).trim();
    }
    if (input.status !== undefined) {
      task.status = input.status;
    }

    await writeJsonTasks(tasks);
    return { task };
  }

  const updates = [];
  const params = [];

  if (input.title !== undefined) {
    updates.push("title = ?");
    params.push(String(input.title).trim());
  }
  if (input.description !== undefined) {
    updates.push("description = ?");
    params.push(String(input.description).trim());
  }
  if (input.status !== undefined) {
    updates.push("status = ?");
    params.push(input.status);
  }

  if (updates.length === 0) {
    const [rows] = await pool.query("SELECT * FROM tasks WHERE id = ?", [id]);
    if (rows.length === 0) return { notFound: true };
    return { task: rows[0] };
  }

  params.push(id);
  const [result] = await pool.query(
    `UPDATE tasks SET ${updates.join(", ")} WHERE id = ?`,
    params
  );

  if (result.affectedRows === 0) {
    return { notFound: true };
  }

  const [rows] = await pool.query("SELECT * FROM tasks WHERE id = ?", [id]);
  return { task: rows[0] };
}

async function deleteTask(id) {
  if (!global.useMySQL) {
    const tasks = await readJsonTasks();
    const taskIndex = tasks.findIndex((t) => t.id === id);
    if (taskIndex === -1) {
      return { notFound: true };
    }
    tasks.splice(taskIndex, 1);
    await writeJsonTasks(tasks);
    return { deleted: true };
  }

  const [result] = await pool.query("DELETE FROM tasks WHERE id = ?", [id]);
  if (result.affectedRows === 0) {
    return { notFound: true };
  }
  return { deleted: true };
}

module.exports = {
  getAllTasks,
  createTask,
  updateTask,
  deleteTask
};
