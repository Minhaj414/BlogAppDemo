const API = '../backend/posts.php';
const AUTH = '../backend/auth.php';
let currentUser = null;
let userPosts = [];

function escapeHtml(s) {
  if(!s) return '';
  return s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
}

function getEditIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('edit');
}

async function checkAuth() {
  try {
    const res = await fetch(AUTH + '?action=me', {credentials: 'same-origin'});
    const me = await res.json();
    currentUser = me;
    
    if (!me) {
      alert('You must be logged in to access the workshop');
      window.location.href = 'login.html';
      return;
    }

    const area = document.getElementById('authArea');
    area.innerHTML = `<span style="color: #00ff88;">👤 ${escapeHtml(me.username)}</span> <button id="logoutBtn">Logout</button>`;
    document.getElementById('logoutBtn').addEventListener('click', async () => {
      await fetch(AUTH + '?action=logout', {method: 'POST', credentials: 'same-origin'});
      location.reload();
    });

    fetchUserPosts();
    checkEditMode();
  } catch(e) {
    console.error('Auth check failed', e);
  }
}

async function fetchUserPosts() {
  try {
    const res = await fetch(API, {credentials: 'same-origin'});
    const allPosts = await res.json() || [];
    
    if (!currentUser) return;
    
    userPosts = allPosts.filter(p => p.user_id === currentUser.id);
    renderUserPosts();
  } catch (e) {
    console.error('Error fetching devlogs:', e);
  }
}

function renderUserPosts() {
  const container = document.getElementById('userPostsList');
  
  if (userPosts.length === 0) {
    container.innerHTML = '<p class="empty-state">You haven\'t published any devlogs yet. Start documenting!</p>';
    return;
  }

  container.innerHTML = `
    <table class="posts-table">
      <thead>
        <tr>
          <th>Title</th>
          <th>Created</th>
          <th>Updated</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${userPosts.map(post => `
          <tr>
            <td class="post-title">
              <a href="blog.html?id=${post.id}">${escapeHtml(post.title)}</a>
            </td>
            <td>${new Date(post.created_at).toLocaleDateString()}</td>
            <td>${post.updated_at ? new Date(post.updated_at).toLocaleDateString() : '—'}</td>
            <td class="actions">
              <button class="btn-small" onclick="editPost(${post.id})"> Edit</button>
              <button class="btn-small btn-danger" onclick="deletePost(${post.id})"> Delete</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function editPost(id) {
  const post = userPosts.find(p => p.id === id);
  if (!post) return;

  document.getElementById('postId').value = post.id;
  document.getElementById('title').value = post.title;
  document.getElementById('content').value = post.content;
  
  window.scrollTo({top: 0, behavior: 'smooth'});
}

async function deletePost(id) {
  if (!confirm('Are you sure you want to delete this devlog? This action cannot be undone.')) return;

  try {
    await fetch(API + '?id=' + id, {
      method: 'DELETE',
      credentials: 'same-origin'
    });
    alert('DevLog deleted successfully');
    fetchUserPosts();
  } catch (e) {
    alert('Error deleting devlog');
    console.error(e);
  }
}

async function submitForm(e) {
  e.preventDefault();
  
  if (!currentUser) {
    alert('You must be logged in');
    return;
  }

  const id = document.getElementById('postId').value;
  const title = document.getElementById('title').value.trim();
  const content = document.getElementById('content').value.trim();

  if (!title || !content) {
    alert('Title and content are required');
    return;
  }

  try {
    const payload = {title, content};
    if (id) payload.id = id;

    const method = id ? 'PUT' : 'POST';
    const res = await fetch(API, {
      method: method,
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(payload),
      credentials: 'same-origin'
    });

    if (!res.ok) {
      alert('Error saving devlog');
      return;
    }

    alert(id ? 'DevLog updated successfully!' : 'DevLog published successfully!');
    resetForm();
    fetchUserPosts();
  } catch (e) {
    alert('Error saving devlog');
    console.error(e);
  }
}

function resetForm() {
  document.getElementById('postId').value = '';
  document.getElementById('title').value = '';
  document.getElementById('content').value = '';
}

function checkEditMode() {
  const editId = getEditIdFromUrl();
  if (editId) {
    const post = userPosts.find(p => p.id == editId);
    if (post) {
      editPost(editId);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  checkAuth();

  document.getElementById('editorForm').addEventListener('submit', submitForm);
  document.getElementById('cancelBtn').addEventListener('click', resetForm);
});
