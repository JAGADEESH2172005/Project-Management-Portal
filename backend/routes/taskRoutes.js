const taskController = require("../controllers/taskController");

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;
    });

    req.on("end", () => {
      if (!body) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });
  });
}

async function handleTaskRoutes(req, res, pathname) {
  if (req.method === "OPTIONS") {
    taskController.sendJson(res, 204, {});
    return true;
  }

  if (pathname === "/tasks" && req.method === "GET") {
    await taskController.getTasks(req, res);
    return true;
  }

  if (pathname === "/tasks" && req.method === "POST") {
    const body = await readRequestBody(req);
    await taskController.createTask(req, res, body);
    return true;
  }

  const taskMatch = pathname.match(/^\/tasks\/(\d+)$/);
  if (taskMatch && req.method === "PUT") {
    const body = await readRequestBody(req);
    await taskController.updateTask(req, res, Number(taskMatch[1]), body);
    return true;
  }

  if (taskMatch && req.method === "DELETE") {
    await taskController.deleteTask(req, res, Number(taskMatch[1]));
    return true;
  }

  return false;
}

module.exports = handleTaskRoutes;
