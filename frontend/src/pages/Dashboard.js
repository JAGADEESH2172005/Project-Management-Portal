import { TaskCard } from "../components/TaskCard.js";
import { StatusFilter } from "../components/StatusFilter.js";

function getStats(tasks) {
  return {
    total: tasks.length,
    pending: tasks.filter((task) => task.status === "Pending").length,
    inProgress: tasks.filter((task) => task.status === "In Progress").length,
    completed: tasks.filter((task) => task.status === "Completed").length
  };
}

export function Dashboard({ tasks, loading, activeFilter, searchTerm }) {
  const stats = getStats(tasks);
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredTasks = tasks.filter((task) => {
    const matchesStatus = activeFilter === "All" || task.status === activeFilter;
    const matchesSearch =
      !normalizedSearch ||
      task.title.toLowerCase().includes(normalizedSearch) ||
      task.description.toLowerCase().includes(normalizedSearch);

    return matchesStatus && matchesSearch;
  });

  return `
    <main class="container">
      <section class="page-header">
        <div>
          <p class="eyebrow">Dashboard</p>
          <h1>Manage project tasks</h1>
          <p class="lead">Track task progress, complete finished work, and keep the board clean.</p>
        </div>
        <button class="button primary" data-route="add">Add Task</button>
      </section>

      <section class="stats-grid" aria-label="Task statistics">
        <div class="stat"><span>Total</span><strong>${stats.total}</strong></div>
        <div class="stat"><span>Pending</span><strong>${stats.pending}</strong></div>
        <div class="stat"><span>In Progress</span><strong>${stats.inProgress}</strong></div>
        <div class="stat"><span>Completed</span><strong>${stats.completed}</strong></div>
      </section>

      <section class="toolbar">
        ${StatusFilter(activeFilter)}
        <input class="search-box" data-action="search" value="${searchTerm}" placeholder="Search tasks" aria-label="Search tasks">
      </section>

      ${
        loading
          ? `<section class="state-panel"><h2>Loading tasks...</h2><p>Please wait while the latest data is fetched.</p></section>`
          : filteredTasks.length
            ? `<section class="task-grid">${filteredTasks.map(TaskCard).join("")}</section>`
            : `<section class="state-panel"><h2>No tasks found</h2><p>Add a task or adjust the current filter.</p></section>`
      }
    </main>
  `;
}
