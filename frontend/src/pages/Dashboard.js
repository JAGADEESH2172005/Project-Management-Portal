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

  
