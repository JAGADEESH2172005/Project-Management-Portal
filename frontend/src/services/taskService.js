const headers = {
  "Content-Type": "application/json"
};

async function handleResponse(response) {
  const payload = await response.json();

  if (!response.ok) {
    const error = new Error(payload.message || "Request failed.");
    error.payload = payload;
    throw error;
  }

  return payload;
}

export async function getTasks() {
  const response = await fetch("/tasks");
  return handleResponse(response);
}

export async function createTask(task) {
  const response = await fetch("/tasks", {
    method: "POST",
    headers,
    body: JSON.stringify(task)
  });
  return handleResponse(response);
}

export async function completeTask(taskId) {
  const response = await fetch(`/tasks/${taskId}`, {
    method: "PUT",
    headers,
    body: JSON.stringify({ status: "Completed" })
  });
  return handleResponse(response);
}

export async function deleteTask(taskId) {
  const response = await fetch(`/tasks/${taskId}`, {
    method: "DELETE"
  });
  return handleResponse(response);
}
