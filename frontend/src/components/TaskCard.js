function getBadgeClass(status) {
  if (status === "Completed") {
    return "completed";
  }

  if (status === "In Progress") {
    return "progress";
  }

  return "";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function TaskCard(task) {
  const createdDate = new Date(task.created_at).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });

  const completeDisabled = task.status === "Completed" ? "disabled" : "";

  return `
    <article class="task-card">
      <div>
        <h2>${escapeHtml(task.title)}</h2>
        <p>${escapeHtml(task.description)}</p>
      </div>
      <div class="task-meta">
        <span class="badge ${getBadgeClass(task.status)}">${escapeHtml(task.status)}</span>
        <span class="date">${createdDate}</span>
      </div>
      <div class="task-actions">
        <button class="button primary" data-action="complete" data-id="${task.id}" ${completeDisabled}>
          Complete
        </button>
        <button class="button danger" data-action="delete" data-id="${task.id}">
          Delete
        </button>
      </div>
    </article>
  `;
}
