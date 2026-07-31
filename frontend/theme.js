/**
 * theme.js — Blogify Theme Manager
 * Apply BEFORE page paint to prevent flash of wrong theme.
 * Include with: <script src="theme.js"></script>  (no defer)
 */
(function () {
  const KEY = 'blogify-theme';

  function getTheme() {
    return localStorage.getItem(KEY) || 'dark';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
  }

  /**
   * Render the pill toggle switch HTML into any .theme-toggle-btn element.
   * Structure:  [track]  >  [thumb with embedded icon]
   */
  function updateButtons(theme) {
    const isDark = theme === 'dark';

    // Sun icon (shown in light mode — inside thumb)
    const SUN = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/>
      <line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/>
      <line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>`;

    // Moon icon (shown in dark mode — inside thumb)
    const MOON = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>`;

    document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
      btn.innerHTML = `
        <span class="theme-switch-track">
          <span class="theme-switch-thumb">${isDark ? MOON : SUN}</span>
        </span>`;
      btn.title = isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode';
      btn.setAttribute('aria-label', btn.title);
    });
  }

  function syncDropdownLabel(theme) {
    const label = document.querySelector('#dropdownThemeToggle .theme-label-text');
    if (label) label.textContent = theme === 'dark' ? 'Dark Mode' : 'Light Mode';
  }

  function toggle() {
    const next = getTheme() === 'dark' ? 'light' : 'dark';
    localStorage.setItem(KEY, next);
    applyTheme(next);
    updateButtons(next);
    syncDropdownLabel(next);
  }

  // ── Apply immediately to prevent FOUC ──
  applyTheme(getTheme());

  // ── Expose global API ──
  window.BlogifyTheme = { toggle, getTheme, updateButtons };

  // ── Wire up all buttons after DOM is ready ──
  document.addEventListener('DOMContentLoaded', function () {
    updateButtons(getTheme());

    // Use event delegation so dynamically injected buttons also work
    document.addEventListener('click', function (e) {
      if (e.target.closest('.theme-toggle-btn')) {
        toggle();
      }
    });
  });
})();
