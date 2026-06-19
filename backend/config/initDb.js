const mysql = require("mysql2/promise");
const fs = require("fs/promises");
const path = require("path");

async function initDb() {
  const host = process.env.DB_HOST || "localhost";
  const port = Number(process.env.DB_PORT) || 3306;
  const user = process.env.DB_USER || "root";
  const password = process.env.DB_PASSWORD || "";
  const database = process.env.DB_NAME || "project_management";

  console.log("Initializing MySQL database...");

  // 1. Connect without database name to ensure the database exists
  try {
    let connection = await mysql.createConnection({
      host,
      port,
      user,
      password
    });

    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\``);
    await connection.end();
  } catch (err) {
    console.warn("Could not ensure database existence (this is common on cloud-hosted databases):", err.message);
  }

  // 2. Connect to the specific database
  connection = await mysql.createConnection({
    host,
    port,
    user,
    password,
    database
  });

  // 3. Create the tasks table if it does not exist
  await connection.query(`
    CREATE TABLE IF NOT EXISTS \`tasks\` (
      \`id\` INT AUTO_INCREMENT PRIMARY KEY,
      \`title\` VARCHAR(255) NOT NULL,
      \`description\` TEXT NOT NULL,
      \`status\` ENUM('Pending', 'In Progress', 'Completed') DEFAULT 'Pending',
      \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // 4. Migrate initial data from tasks.json if the table is empty
  const [rows] = await connection.query("SELECT COUNT(*) as count FROM \`tasks\`");
  if (rows[0].count === 0) {
    console.log("MySQL tasks table is empty. Migrating existing JSON tasks data...");
    try {
      const jsonPath = path.join(__dirname, "../data/tasks.json");
      const jsonData = await fs.readFile(jsonPath, "utf8");
      const tasks = JSON.parse(jsonData);

      if (Array.isArray(tasks) && tasks.length > 0) {
        for (const task of tasks) {
          // Format date or default to current date
          const createdAt = task.created_at ? new Date(task.created_at) : new Date();
          
          await connection.query(
            "INSERT INTO \`tasks\` (\`id\`, \`title\`, \`description\`, \`status\`, \`created_at\`) VALUES (?, ?, ?, ?, ?)",
            [task.id, task.title, task.description, task.status || "Pending", createdAt]
          );
        }
        console.log(`Successfully migrated ${tasks.length} tasks to MySQL.`);
      }
    } catch (err) {
      console.warn("Could not migrate initial tasks data from JSON:", err.message);
    }
  }

  await connection.end();
  console.log("MySQL database initialization completed successfully.");
}

module.exports = initDb;
