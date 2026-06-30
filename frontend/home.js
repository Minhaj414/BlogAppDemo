const API = '../backend/posts.php';
const AUTH = '../backend/auth.php';
let allPosts = [];
let currentUser = null;

async function fetchBlogs(){
  try {
    const res = await fetch(API, {credentials: 'same-origin'});
    const posts = await res.json();
    allPosts = posts || [];
    renderBlogsList(allPosts);
  } catch (e) {
    console.error('Error fetching devlogs:', e);
    document.getElementById('blogsList').innerHTML = '<p>Error loading devlogs. Please try again.</p>';
  }
}

function escapeHtml(s) {
  if(!s) return '';
  return s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
}

function getExcerpt(content, length = 150) {
  const text = content.replace(/<[^>]*>/g, '').substring(0, length);
  return text + (content.length > length ? '...' : '');
}

function renderBlogsList(posts) {
  const list = document.getElementById('blogsList');
  if(!posts || posts.length === 0) {
    list.innerHTML = '<p class="empty-state">No devlogs found. Be the first to document a build!</p>';
    return;
  }

  list.innerHTML = '';
  posts.forEach(post => {
    const card = document.createElement('article');
    card.className = 'blog-card';
    const excerpt = getExcerpt(post.content);
    
    card.innerHTML = `
      <div class="project-panel-content">
        <h3 class="post-heading">${escapeHtml(post.title)}</h3>
        <p class="blog-excerpt">${escapeHtml(excerpt)}</p>
        <div class="blog-meta">
          <span class="author">👤 ${escapeHtml(post.author || 'Anonymous')}</span>
          <span class="date">📅 ${new Date(post.created_at).toLocaleDateString()}</span>
        </div>
      </div>
      <a href="blog.html?id=${post.id}" class="blog-link">Read More →</a>
    `;
    list.appendChild(card);
  });
}

function searchBlogs() {
  const query = document.getElementById('searchInput').value.toLowerCase();
  if (!query.trim()) {
    renderBlogsList(allPosts);
    return;
  }

  const filtered = allPosts.filter(post =>
    post.title.toLowerCase().includes(query) ||
    post.content.toLowerCase().includes(query) ||
    (post.author || '').toLowerCase().includes(query)
  );
  renderBlogsList(filtered);
}

async function checkAuth(){
  try {
    const res = await fetch(AUTH + '?action=me', {credentials: 'same-origin'});
    const me = await res.json();
    currentUser = me;
    const area = document.getElementById('authArea');
    const dashLink = document.getElementById('dashboardLink');
    
    if(me) {
      area.innerHTML = `<span style="color: #00ff88;">👤 ${escapeHtml(me.username)}</span> <button id="logoutBtn">Logout</button>`;
      if(dashLink) dashLink.style.display = 'inline-block';
      document.getElementById('logoutBtn').addEventListener('click', async ()=>{
        await fetch(AUTH + '?action=logout', {method:'POST', credentials: 'same-origin'});
        location.reload();
      });
    } else {
      area.innerHTML = `<a href="login.html"><div class="auth-btn auth-btn-login">⚡ Sign In</div></a> <a href="register.html"><div class="auth-btn-register auth-btn">🔧 Register</div></a>`;
      if(dashLink) dashLink.style.display = 'none';
    }
  } catch(e) {
    console.warn('Auth check failed', e);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  fetchBlogs();
  
  document.getElementById('searchBtn').addEventListener('click', searchBlogs);
  document.getElementById('searchInput').addEventListener('keypress', (e) => {
    if(e.key === 'Enter') searchBlogs();
  });
});
