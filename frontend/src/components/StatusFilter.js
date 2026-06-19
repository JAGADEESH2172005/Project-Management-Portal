const statuses = ["All", "Pending", "In Progress", "Completed"];

export function StatusFilter(activeStatus) {
  return `
    <div class="filters" role="group" aria-label="Filter tasks by status">
      ${statuses
        .map(
          (status) => `
            <button class="filter-button ${activeStatus === status ? "active" : ""}" data-filter="${status}">
              ${status}
            </button>
          `
        )
        .join("")}
    </div>
  `;
}
