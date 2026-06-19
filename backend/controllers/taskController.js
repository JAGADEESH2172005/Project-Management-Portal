const taskModel = require("../models/taskModel");

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  });
  res.end(JSON.stringify(payload));
}

async function getTasks(req, res) {
  const tasks = await taskModel.getAllTasks();
  sendJson(res, 200, tasks);
}

async function createTask(req, res, body) {
  const result = await taskModel.createTask(body);

  if (result.errors) {
    sendJson(res, 400, { message: "Validation failed.", errors: result.errors });
    return;
  }

  sendJson(res, 201, result.task);
}

async function updateTask(req, res, id, body) {
  const result = await taskModel.updateTask(id, body);

  if (result.notFound) {
    sendJson(res, 404, { message: "Task not found." });
    return;
  }

  if (result.errors) {
    sendJson(res, 400, { message: "Validation failed.", errors: result.errors });
    return;
  }

  sendJson(res, 200, result.task);
}

async function deleteTask(req, res, id) {
  const result = await taskModel.deleteTask(id);

  if (result.notFound) {
    sendJson(res, 404, { message: "Task not found." });
    return;
  }

  sendJson(res, 200, { message: "Task deleted successfully." });
}

module.exports = {
  sendJson,
  getTasks,
  createTask,
  updateTask,
  deleteTask
};
