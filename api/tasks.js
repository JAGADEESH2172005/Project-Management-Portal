require("dotenv").config();
const handleTaskRoutes = require("../backend/routes/taskRoutes");
const initDb = require("../backend/config/initDb");
const { sendJson } = require("../backend/controllers/taskController");

let dbInitialized = false;
let initPromise = null;

async function ensureDbInitialized() {
  if (dbInitialized) return;
  if (!initPromise) {
    initPromise = initDb()
      .then(() => {
        dbInitialized = true;
      })
      .catch((err) => {
        console.error("Database initialization failed:", err.message);
        initPromise = null; // retry next time
        throw err;
      });
  }
  return initPromise;
}

module.exports = async (req, res) => {
  // CORS Headers for API
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  try {
    await ensureDbInitialized();

    const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
    
    // Determine the original path based on query parameters or matched path header
    const id = url.searchParams.get("id");
    const pathname = id ? `/tasks/${id}` : "/tasks";

    const handled = await handleTaskRoutes(req, res, pathname);
    if (!handled) {
      sendJson(res, 404, { message: `Route ${pathname} not found.` });
    }
  } catch (error) {
    if (error instanceof SyntaxError) {
      sendJson(res, 400, { message: "Invalid JSON body." });
      return;
    }
    sendJson(res, 500, { message: "Server error.", detail: error.message });
  }
};
