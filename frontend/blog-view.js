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
      ${blog.content.split('\n').map(para => `<p>${escapeHtml(para)}</p>`).join('')}
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
  try {
    const res = await fetch(AUTH + '?action=me', {credentials: 'same-origin'});
    const me = await res.json();
    currentUser = me;
    const area = document.getElementById('authArea');
    
    if(me) {
      area.innerHTML = `<span style="color: #00ff88;">👤 ${escapeHtml(me.username)}</span> <button id="logoutBtn">Logout</button>`;
      document.getElementById('logoutBtn').addEventListener('click', async () => {
        await fetch(AUTH + '?action=logout', {method: 'POST', credentials: 'same-origin'});
        location.reload();
      });
    } else {
      area.innerHTML = `<a href="login.html"><div class="auth-btn auth-btn-login">⚡ Sign In</div></a> <a href="register.html"><div class="auth-btn-register auth-btn">🔧 Register</div></a>`;
    }
  } catch(e) {
    console.warn('Auth check failed', e);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  fetchBlog();
});
