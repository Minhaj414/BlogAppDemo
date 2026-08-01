/**
 * text-toolbar.js — Blogify Floating Formatting Toolbar
 * A professional bubble toolbar that appears when text is selected
 * in the post content textarea. Wraps selected text with markdown syntax.
 */
(function () {
  'use strict';

  const TOOLBAR_ID = 'textFormatToolbar';

  // ── Toolbar button definitions ──
  const buttons = [
    { id: 'tb-heading',    icon: 'H',   title: 'Heading',        action: 'heading' },
    { id: 'tb-bold',       icon: 'B',   title: 'Bold (Ctrl+B)',  action: 'bold',   style: 'font-weight:800' },
    { id: 'tb-italic',     icon: 'I',   title: 'Italic (Ctrl+I)',action: 'italic', style: 'font-style:italic' },
    { id: 'tb-code',       icon: '⟨⟩',  title: 'Inline Code',    action: 'code' },
    { id: 'tb-link',       icon: null,   title: 'Link (Ctrl+K)', action: 'link',   svg: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>` },
    { id: 'tb-sep1', separator: true },
    { id: 'tb-ol',         icon: null,   title: 'Numbered List',  action: 'ol',     svg: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><text x="3" y="7" fill="currentColor" stroke="none" font-size="7" font-weight="700" font-family="Inter,sans-serif">1</text><text x="3" y="13" fill="currentColor" stroke="none" font-size="7" font-weight="700" font-family="Inter,sans-serif">2</text><text x="3" y="19" fill="currentColor" stroke="none" font-size="7" font-weight="700" font-family="Inter,sans-serif">3</text></svg>` },
    { id: 'tb-ul',         icon: null,   title: 'Bullet List',    action: 'ul',     svg: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4" cy="6" r="1.5" fill="currentColor" stroke="none"/><circle cx="4" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="4" cy="18" r="1.5" fill="currentColor" stroke="none"/></svg>` },
    { id: 'tb-quote',      icon: '❝',   title: 'Blockquote',     action: 'quote' },
  ];

  // ── Create toolbar DOM ──
  function createToolbar() {
    if (document.getElementById(TOOLBAR_ID)) return;

    const bar = document.createElement('div');
    bar.id = TOOLBAR_ID;
    bar.className = 'text-toolbar';
    bar.setAttribute('role', 'toolbar');
    bar.setAttribute('aria-label', 'Text formatting');

    buttons.forEach(btn => {
      if (btn.separator) {
        const sep = document.createElement('span');
        sep.className = 'text-toolbar-sep';
        bar.appendChild(sep);
        return;
      }

      const el = document.createElement('button');
      el.type = 'button';
      el.id = btn.id;
      el.className = 'text-toolbar-btn';
      el.title = btn.title;
      el.setAttribute('aria-label', btn.title);
      el.dataset.action = btn.action;

      if (btn.svg) {
        el.innerHTML = btn.svg;
      } else {
        el.textContent = btn.icon;
      }

      if (btn.style) el.setAttribute('style', btn.style);

      bar.appendChild(el);
    });

    document.body.appendChild(bar);
  }

  // ── Formatting actions ──
  function applyFormat(textarea, action) {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);

    if (!selected && !['ol', 'ul', 'quote', 'heading'].includes(action)) return;

    let replacement = '';
    let cursorOffset = 0;

    switch (action) {
      case 'bold':
        replacement = `**${selected}**`;
        cursorOffset = 2;
        break;
      case 'italic':
        replacement = `*${selected}*`;
        cursorOffset = 1;
        break;
      case 'code':
        replacement = `\`${selected}\``;
        cursorOffset = 1;
        break;
      case 'heading': {
        // Find the start of the current line
        const lineStart = text.lastIndexOf('\n', start - 1) + 1;
        const lineEnd = text.indexOf('\n', end);
        const fullLine = text.substring(lineStart, lineEnd === -1 ? text.length : lineEnd);

        // Toggle heading: if already has ##, remove it; otherwise add ##
        let newLine;
        if (fullLine.startsWith('## ')) {
          newLine = fullLine.substring(3);
        } else if (fullLine.startsWith('# ')) {
          newLine = fullLine.substring(2);
        } else {
          newLine = `## ${fullLine}`;
        }

        textarea.value = text.substring(0, lineStart) + newLine + text.substring(lineEnd === -1 ? text.length : lineEnd);
        textarea.focus();
        textarea.selectionStart = textarea.selectionEnd = lineStart + newLine.length;
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        return;
      }
      case 'link': {
        const url = prompt('Enter URL:', 'https://');
        if (!url) return;
        replacement = `[${selected}](${url})`;
        cursorOffset = 1;
        break;
      }
      case 'ol': {
        const lines = selected.split('\n');
        replacement = lines.map((line, i) => `${i + 1}. ${line}`).join('\n');
        cursorOffset = 0;
        break;
      }
      case 'ul': {
        const lines = selected.split('\n');
        replacement = lines.map(line => `- ${line}`).join('\n');
        cursorOffset = 0;
        break;
      }
      case 'quote': {
        const lines = selected.split('\n');
        replacement = lines.map(line => `> ${line}`).join('\n');
        cursorOffset = 0;
        break;
      }
    }

    // Replace selected text
    textarea.value = text.substring(0, start) + replacement + text.substring(end);
    textarea.focus();

    // Place cursor after the replacement
    const newPos = start + replacement.length;
    textarea.selectionStart = textarea.selectionEnd = newPos;
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
  }

  // ── Show / Hide / Position ──
  function showToolbar(textarea) {
    const bar = document.getElementById(TOOLBAR_ID);
    if (!bar) return;

    const sel = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);
    if (!sel || sel.trim().length === 0) {
      hideToolbar();
      return;
    }

    // Position the toolbar above the textarea, near the cursor
    const taRect = textarea.getBoundingClientRect();
    const barWidth = 340; // approximate

    // Calculate approximate cursor position within textarea
    // Use a mirror div approach for accurate positioning
    const textBeforeCursor = textarea.value.substring(0, textarea.selectionStart);
    const lines = textBeforeCursor.split('\n');
    const currentLineIndex = lines.length - 1;

    const computedStyle = getComputedStyle(textarea);
    const lineHeight = parseFloat(computedStyle.lineHeight) || 24;
    const paddingTop = parseFloat(computedStyle.paddingTop) || 12;

    // Calculate Y position (accounting for scroll)
    const cursorY = paddingTop + (currentLineIndex * lineHeight) - textarea.scrollTop;

    let top = taRect.top + cursorY - 50; // 50px above cursor
    let left = taRect.left + (taRect.width / 2) - (barWidth / 2);

    // Clamp to viewport
    top = Math.max(8, top);
    left = Math.max(8, Math.min(left, window.innerWidth - barWidth - 8));

    bar.style.top = `${top}px`;
    bar.style.left = `${left}px`;
    bar.classList.add('visible');
  }

  function hideToolbar() {
    const bar = document.getElementById(TOOLBAR_ID);
    if (bar) bar.classList.remove('visible');
  }

  // ── Initialize ──
  function init() {
    const textarea = document.getElementById('content');
    if (!textarea) return;

    createToolbar();
    const bar = document.getElementById(TOOLBAR_ID);

    // Show toolbar on text selection
    textarea.addEventListener('mouseup', () => {
      // Small delay to ensure selection is finalized
      setTimeout(() => showToolbar(textarea), 10);
    });

    // Show on keyboard selection (Shift+Arrow, Ctrl+Shift+Arrow, etc.)
    textarea.addEventListener('keyup', (e) => {
      if (e.shiftKey || e.key === 'Shift') {
        setTimeout(() => showToolbar(textarea), 10);
      }
    });

    // Hide on click with no selection
    textarea.addEventListener('mousedown', () => {
      // Don't hide immediately — let mouseup decide
    });

    // Hide when clicking outside
    document.addEventListener('mousedown', (e) => {
      if (!e.target.closest('#' + TOOLBAR_ID) && e.target !== textarea) {
        hideToolbar();
      }
    });

    // Hide on scroll (reposition would be jittery)
    textarea.addEventListener('scroll', hideToolbar);

    // Handle toolbar button clicks
    bar.addEventListener('click', (e) => {
      const btn = e.target.closest('.text-toolbar-btn');
      if (!btn) return;
      e.preventDefault();
      e.stopPropagation();

      const action = btn.dataset.action;
      applyFormat(textarea, action);
      hideToolbar();
    });

    // Keyboard shortcuts
    textarea.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey) {
        switch (e.key.toLowerCase()) {
          case 'b':
            e.preventDefault();
            applyFormat(textarea, 'bold');
            break;
          case 'i':
            e.preventDefault();
            applyFormat(textarea, 'italic');
            break;
          case 'k':
            e.preventDefault();
            applyFormat(textarea, 'link');
            break;
        }
      }
    });
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
