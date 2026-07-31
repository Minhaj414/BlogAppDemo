/**
 * auth-menu.js — Shared Blogify Navbar Auth Widget
 * Renders the professional user avatar dropdown into #authArea on every page.
 * Usage:
 *   const me = await initAuthMenu({ showDashboard: true });
 *   // returns the user object (or null if not logged in)
 */

const AUTH_API = '../backend/auth.php';

function escapeHtml(s) {
  if (!s) return '';
  return s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

async function initAuthMenu({ showDashboard = false } = {}) {
  try {
    const res = await fetch(AUTH_API + '?action=me', { credentials: 'same-origin' });
    const me = await res.json();
    const area = document.getElementById('authArea');
    if (!area) return me;

    if (me) {
      const initial = escapeHtml(me.username).charAt(0).toUpperCase();
      const dashBtn = showDashboard
        ? `<a href="dashboard.html" class="nav-dashboard-btn">My Dashboard</a>`
        : '';

      area.innerHTML = `
        ${dashBtn}
        <div class="user-menu-wrapper" id="userMenuWrapper">
          <button class="user-menu-trigger" id="userMenuTrigger" aria-haspopup="true" aria-expanded="false">
            <span class="user-avatar">${initial}</span>
            <span class="user-menu-name">${escapeHtml(me.username)}</span>
            <svg class="user-menu-caret" width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <div class="user-dropdown" id="userDropdown" role="menu">
            <div class="user-dropdown-header">
              <span class="user-dropdown-avatar">${initial}</span>
              <div>
                <div class="user-dropdown-name">${escapeHtml(me.username)}</div>
                <div class="user-dropdown-role">Author</div>
              </div>
            </div>
            <div class="user-dropdown-divider"></div>
            <button class="dropdown-theme-toggle" id="dropdownThemeToggle" role="menuitem" aria-label="Toggle theme">
              <span class="theme-toggle-label">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" id="dropdownThemeIcon">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
                <span class="theme-label-text">Dark Mode</span>
              </span>
              <span class="theme-toggle-pill"></span>
            </button>
            <div class="user-dropdown-divider"></div>
            <button class="user-dropdown-item user-dropdown-logout" id="userLogoutBtn" role="menuitem">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Sign Out
            </button>
          </div>
        </div>`;

      // Sync the dropdown theme label text and icon
      function syncThemeLabel() {
        const isDark = (localStorage.getItem('blogify-theme') || 'dark') !== 'light';
        const label = document.getElementById('dropdownThemeToggle')?.querySelector('.theme-label-text');
        if (label) label.textContent = isDark ? 'Dark Mode' : 'Light Mode';
        
        const iconEl = document.getElementById('dropdownThemeIcon');
        if (iconEl) {
          iconEl.innerHTML = isDark
            ? `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>`
            : `<circle cx="12" cy="12" r="5"/>
               <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
               <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
               <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
               <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>`;
        }
      }

      syncThemeLabel();

      // Wire up the dropdown theme button
      document.getElementById('dropdownThemeToggle')?.addEventListener('click', (e) => {
        e.stopPropagation(); // don't close dropdown
        if (window.BlogifyTheme) BlogifyTheme.toggle();
        syncThemeLabel();
      });

      // Update the standalone navbar toggle icon
      if (window.BlogifyTheme) {
        BlogifyTheme.updateButtons(BlogifyTheme.getTheme());
      }

      // Toggle dropdown on click
      const trigger = document.getElementById('userMenuTrigger');
      const dropdown = document.getElementById('userDropdown');
      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const open = dropdown.classList.toggle('open');
        trigger.setAttribute('aria-expanded', open);
      });

      // Close on outside click (but NOT when clicking theme toggle inside dropdown)
      document.addEventListener('click', (e) => {
        if (!e.target.closest('#userMenuWrapper')) {
          dropdown.classList.remove('open');
          trigger.setAttribute('aria-expanded', 'false');
        }
      });

      document.getElementById('userLogoutBtn').addEventListener('click', async () => {
        await fetch(AUTH_API + '?action=logout', { method: 'POST', credentials: 'same-origin' });
        location.reload();
      });

    } else {
      // Not logged in — show standalone theme toggle + auth buttons
      area.innerHTML = `
        <button class="theme-toggle-btn" id="navThemeToggle" aria-label="Toggle theme"></button>
        <a href="login.html"><span class="auth-btn auth-btn-login">Sign In</span></a>
        <a href="register.html"><span class="auth-btn auth-btn-register">Register</span></a>`;

      if (window.BlogifyTheme) {
        BlogifyTheme.updateButtons(BlogifyTheme.getTheme());
      }
    }

    return me;
  } catch (e) {
    console.warn('Auth menu init failed', e);
    return null;
  }
}
