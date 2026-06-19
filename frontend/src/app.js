import { Navbar, bindNavbarEvents } from "./components/Navbar.js";
import { Dashboard } from "./pages/Dashboard.js";
import { AddTask } from "./pages/AddTask.js";
import { completeTask, createTask, deleteTask, getTasks } from "./services/taskService.js";

const root = document.querySelector("#app");

const state = {
  route: "dashboard",
  tasks: [],
  loading: true,
  activeFilter: "All",
  searchTerm: "",
  form: {
    title: "",
    description: "",
    status: "Pending"
  },
  errors: {},
  submitting: false,
  toast: "",
  isDark: localStorage.getItem("theme") === "dark"
};

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function sanitizeForm() {
  return {
    title: escapeHtml(state.form.title),
    description: escapeHtml(state.form.description),
    status: state.form.status
  };
}

function setToast(message) {
  state.toast = message;
  render();
  window.setTimeout(() => {
    if (state.toast === message) {
      state.toast = "";
      render();
    }
  }, 2600);
}

function navigate(route) {
  state.route = route;
  state.errors = {};
  render();
}

function validateForm() {
  const errors = {};

  if (!state.form.title.trim()) {
    errors.title = "Title is required.";
  }

  if (state.form.description.trim().length < 20) {
    errors.description = "Description must be at least 20 characters.";
  }

  if (!["Pending", "In Progress"].includes(state.form.status)) {
    errors.status = "Choose a valid status.";
  }

  return errors;
}

async function loadTasks() {
  state.loading = true;
  render();

  try {
    state.tasks = await getTasks();
  } catch (error) {
    setToast(error.message);
  } finally {
    state.loading = false;
    render();
  }
}

async function handleComplete(taskId) {
  try {
    await completeTask(taskId);
    await loadTasks();
    setToast("Task marked as completed.");
  } catch (error) {
    setToast(error.message);
  }
}

async function handleDelete(taskId) {
  try {
    await deleteTask(taskId);
    await loadTasks();
    setToast("Task deleted.");
  } catch (error) {
    setToast(error.message);
  }
}

async function handleSubmit(event) {
  event.preventDefault();
  state.errors = validateForm();

  if (Object.keys(state.errors).length > 0) {
    render();
    return;
  }

  state.submitting = true;
  render();

  try {
    await createTask({
      title: state.form.title.trim(),
      description: state.form.description.trim(),
      status: state.form.status
    });

    state.form = { title: "", description: "", status: "Pending" };
    state.route = "dashboard";
    await loadTasks();
    setToast("Task created successfully.");
  } catch (error) {
    state.errors = error.payload?.errors || {};
    setToast(error.message);
  } finally {
    state.submitting = false;
    render();
  }
}

function bindEvents() {
  bindNavbarEvents(root, navigate, () => {
    state.isDark = !state.isDark;
    localStorage.setItem("theme", state.isDark ? "dark" : "light");
    render();
  });

  root.querySelectorAll("[data-route]").forEach((button) => {
    button.addEventListener("click", () => navigate(button.dataset.route));
  });

  root.querySelectorAll("[data-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeFilter = button.dataset.filter;
      render();
    });
  });

  root.querySelector("[data-action='search']")?.addEventListener("input", (event) => {
    state.searchTerm = event.target.value;
    render();
  });

  root.querySelectorAll("[data-action='complete']").forEach((button) => {
    button.addEventListener("click", () => handleComplete(Number(button.dataset.id)));
  });

  root.querySelectorAll("[data-action='delete']").forEach((button) => {
    button.addEventListener("click", () => handleDelete(Number(button.dataset.id)));
  });

  const form = root.querySelector("[data-form='task']");
  if (form) {
    form.addEventListener("input", (event) => {
      if (event.target.name) {
        state.form[event.target.name] = event.target.value;
      }
    });
    form.addEventListener("submit", handleSubmit);
  }
}

function render() {
  document.documentElement.classList.toggle("dark", state.isDark);

  const page =
    state.route === "add"
      ? AddTask({
          form: sanitizeForm(),
          errors: state.errors,
          submitting: state.submitting
        })
      : Dashboard({
          tasks: state.tasks,
          loading: state.loading,
          activeFilter: state.activeFilter,
          searchTerm: escapeHtml(state.searchTerm)
        });

  root.innerHTML = `
    <div class="app-shell">
      ${Navbar({
        route: state.route,
        isDark: state.isDark
      })}
      ${page}
      ${state.toast ? `<div class="toast" role="status">${state.toast}</div>` : ""}
    </div>
  `;

  bindEvents();
}

render();
loadTasks();
