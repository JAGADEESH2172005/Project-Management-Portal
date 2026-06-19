const mysql = require("mysql2/promise");

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
