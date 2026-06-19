export function Navbar({ route, onNavigate, isDark, onToggleTheme }) {
  return `
    <header class="topbar">
      <div class="topbar-inner">
        <div class="brand">
          <div class="brand-mark">PM</div>
          <div>
            <h1 class="brand-title">Project Portal</h1>
            <p class="brand-subtitle">Task tracking assessment build</p>
          </div>
        </div>
        <nav class="nav-actions" aria-label="Main navigation">
          <button class="button ${route === "dashboard" ? "primary" : ""}" data-route="dashboard">
            Dashboard
          </button>
          <button class="button ${route === "add" ? "primary" : ""}" data-route="add">
            Add Task
          </button>
          <button class="button icon" data-action="toggle-theme" title="Toggle dark mode" aria-label="Toggle dark mode">
            ${isDark ? "☀" : "◐"}
          </button>
        </nav>
      </div>
    </header>
  `;
}

export function bindNavbarEvents(root, onNavigate, onToggleTheme) {
  root.querySelectorAll("[data-route]").forEach((button) => {
    button.addEventListener("click", () => onNavigate(button.dataset.route));
  });

  root.querySelector("[data-action='toggle-theme']")?.addEventListener("click", onToggleTheme);
}
