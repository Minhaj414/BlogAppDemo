const API = '../backend/posts.php';
const AUTH = '../backend/auth.php';
let currentBlog = null;
let currentUser = null;
let allPosts = [];

function escapeHtml(s) {
  if(!s) return '';
  return s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
}

function getBlogId() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

async function fetchBlog() {
  const id = getBlogId();
  if (!id) {
    document.getElementById('blogContent').innerHTML = '<p>DevLog not found.</p>';
    return;
  }

  try {
    const res = await fetch(API + '?id=' + id, {credentials: 'same-origin'});
    const blog = await res.json();
    
    if (!blog) {
      document.getElementById('blogContent').innerHTML = '<p>DevLog not found.</p>';
      return;
    }

    currentBlog = blog;
    renderBlog(blog);
    await fetchAllPosts();
    renderRelatedPosts();
    checkOwnership();
  } catch (e) {
    console.error('Error fetching devlog:', e);
    document.getElementById('blogContent').innerHTML = '<p>Error loading devlog.</p>';
  }
}

/**
 * Lightweight markdown-to-HTML parser.
 * Supports: headings, bold, italic, inline code, links, lists, blockquotes, hr.
 */
function parseMarkdown(raw) {
  // Escape HTML first (security)
  let text = escapeHtml(raw);

  // Split into lines for block-level parsing
  const lines = text.split('\n');
  const html = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Blank line
    if (line.trim() === '') {
      i++;
      continue;
    }

    // Headings: ### h3, ## h2, # h1
    const headingMatch = line.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      html.push(`<h${level}>${inlineFormat(headingMatch[2])}</h${level}>`);
      i++;
      continue;
    }

    // Horizontal rule: --- or ***
    if (/^(\-{3,}|\*{3,})$/.test(line.trim())) {
      html.push('<hr>');
      i++;
      continue;
    }

    // Blockquote: > text
    if (line.startsWith('&gt; ')) {
      const quoteLines = [];
      while (i < lines.length && lines[i].startsWith('&gt; ')) {
        quoteLines.push(inlineFormat(lines[i].substring(5)));
        i++;
      }
      html.push(`<blockquote>${quoteLines.join('<br>')}</blockquote>`);
      continue;
    }

    // Unordered list: - item
    if (/^[-*]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
        items.push(`<li>${inlineFormat(lines[i].replace(/^[-*]\s+/, ''))}</li>`);
        i++;
      }
      html.push(`<ul>${items.join('')}</ul>`);
      continue;
    }

    // Ordered list: 1. item
    if (/^\d+\.\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        items.push(`<li>${inlineFormat(lines[i].replace(/^\d+\.\s+/, ''))}</li>`);
        i++;
      }
      html.push(`<ol>${items.join('')}</ol>`);
      continue;
    }

    // Regular paragraph
    html.push(`<p>${inlineFormat(line)}</p>`);
    i++;
  }

  return html.join('\n');
}

/**
 * Parse inline markdown: bold, italic, code, links.
 */
function inlineFormat(text) {
  // Inline code: `code`
  text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
  // Bold: **text**
  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  // Italic: *text*
  text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  // Links: [text](url)
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  return text;
}

function renderBlog(blog) {
  const content = document.getElementById('blogContent');
  content.className = '';
  content.innerHTML = `
    <header class="blog-header">
      <h1>${escapeHtml(blog.title)}</h1>
      <div class="blog-info">
        <span class="author-info">
          <strong>✍️ ${escapeHtml(blog.author || 'Anonymous')}</strong>
        </span>
        <span class="date-info">
          📅 ${new Date(blog.created_at).toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'})}
        </span>
        ${blog.updated_at ? `<span class="updated-info">📝 Updated: ${new Date(blog.updated_at).toLocaleDateString()}</span>` : ''}
      </div>
    </header>
    <div class="blog-body">
      ${parseMarkdown(blog.content)}
    </div>
  `;

  document.title = escapeHtml(blog.title) + ' - Blogify';
}

async function fetchAllPosts() {
  try {
    const res = await fetch(API, {credentials: 'same-origin'});
    allPosts = await res.json() || [];
  } catch (e) {
    console.error('Error fetching posts:', e);
  }
}

function renderRelatedPosts() {
  if (!currentBlog) return;

  const related = allPosts
    .filter(p => p.author === currentBlog.author && p.id !== currentBlog.id)
    .slice(0, 3);

  const container = document.getElementById('relatedPosts');
  if (related.length === 0) {
    container.innerHTML = '<p class="empty-state">No other devlogs from this author.</p>';
    return;
  }

  container.innerHTML = '';
  related.forEach(post => {
    const card = document.createElement('article');
    card.className = 'blog-card';
    card.innerHTML = `
      <h3 class="post-heading">${escapeHtml(post.title)}</h3>
      <p class="blog-meta" style="margin-top: 8px; font-size: 13px;">
        ${new Date(post.created_at).toLocaleDateString()}
      </p>
      <a href="blog.html?id=${post.id}" class="blog-link">Read →</a>
    `;
    container.appendChild(card);
  });
}

function checkOwnership() {
  if (!currentUser || !currentBlog) return;

  const isOwner = currentUser.id === currentBlog.user_id;
  if (isOwner) {
    const ownerDiv = document.getElementById('ownerActions');
    ownerDiv.innerHTML = `
      <a href="dashboard.html?edit=${currentBlog.id}" class="btn-primary">Edit</a>
      <button id="deleteBtn" class="btn-danger">Delete</button>
    `;
    document.getElementById('deleteBtn').addEventListener('click', deleteBlog);
  }
}

async function deleteBlog() {
  if (!confirm('Are you sure you want to delete this devlog?')) return;

  try {
    await fetch(API + '?id=' + currentBlog.id, {
      method: 'DELETE',
      credentials: 'same-origin'
    });
    alert('DevLog deleted successfully');
    window.location.href = 'index.html';
  } catch (e) {
    alert('Error deleting devlog');
    console.error(e);
  }
}

async function checkAuth() {
  currentUser = await initAuthMenu({ showDashboard: false });
}

document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  fetchBlog();
});
