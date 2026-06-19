require("dotenv").config();
const http = require("http");
const fs = require("fs/promises");
const path = require("path");

const handleTaskRoutes = require("./routes/taskRoutes");
const initDb = require("./config/initDb");
const { sendJson } = require("./controllers/taskController");
const config = require("./config/appConfig");

const rootDir = path.join(__dirname, "..");
const publicDir = path.join(rootDir, config.publicDir);

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml"
};

async function serveStaticFile(res, pathname) {
  const requestedPath = pathname === "/" ? "/index.html" : pathname;
  const filePath = path.normalize(path.join(publicDir, requestedPath));

  if (!filePath.startsWith(publicDir)) {
    sendJson(res, 403, { message: "Forbidden." });
    return;
  }

  try {
    const content = await fs.readFile(filePath);
    const ext = path.extname(filePath);
    res.writeHead(200, {
      "Content-Type": mimeTypes[ext] || "application/octet-stream"
    });
    res.end(content);
  } catch (error) {
    if (!path.extname(requestedPath)) {
      const index = await fs.readFile(path.join(publicDir, "index.html"));
      res.writeHead(200, { "Content-Type": mimeTypes[".html"] });
      res.end(index);
      return;
    }

    sendJson(res, 404, { message: "File not found." });
  }
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const handled = await handleTaskRoutes(req, res, url.pathname);

    if (handled) {
      return;
    }

    await serveStaticFile(res, url.pathname);
  } catch (error) {
    if (error instanceof SyntaxError) {
      sendJson(res, 400, { message: "Invalid JSON body." });
      return;
    }

    sendJson(res, 500, { message: "Server error.", detail: error.message });
  }
});

initDb()
  .then(() => {
    server.listen(config.port, () => {
      console.log(`Project Management Portal running at http://localhost:${config.port}`);
    });
  })
  .catch((err) => {
    console.error("Database initialization failed:", err.message);
    process.exit(1);
  });
