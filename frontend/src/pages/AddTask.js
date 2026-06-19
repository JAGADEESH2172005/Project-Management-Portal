export function AddTask({ form, errors, submitting }) {
  return `
    <main class="container">
      <section class="page-header">
        <div>
          <p class="eyebrow">New Task</p>
          <h1>Add project task</h1>
          <p class="lead">Create a task with a clear title, useful description, and starting status.</p>
        </div>
      </section>

      <form class="form-card" data-form="task">
        <div class="form-grid">
          <div class="field">
            <label for="title">Task Title</label>
            <input id="title" name="title" value="${form.title}" placeholder="Example: Build login page">
            ${errors.title ? `<p class="error">${errors.title}</p>` : ""}
          </div>

          <div class="field">
            <label for="description">Description</label>
            <textarea id="description" name="description" placeholder="Write at least 20 characters">${form.description}</textarea>
            ${errors.description ? `<p class="error">${errors.description}</p>` : ""}
          </div>

          <div class="field">
            <label for="status">Status</label>
            <select id="status" name="status">
              <option value="Pending" ${form.status === "Pending" ? "selected" : ""}>Pending</option>
              <option value="In Progress" ${form.status === "In Progress" ? "selected" : ""}>In Progress</option>
            </select>
            ${errors.status ? `<p class="error">${errors.status}</p>` : ""}
          </div>

          <div class="form-actions">
            <button class="button" type="button" data-route="dashboard">Cancel</button>
            <button class="button primary" type="submit" ${submitting ? "disabled" : ""}>
              ${submitting ? "Saving..." : "Save Task"}
            </button>
          </div>
        </div>
      </form>
    </main>
  `;
}
