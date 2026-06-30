// When using XAMPP/Apache serve the frontend from http://localhost/Assignment/frontend/
// and call the backend with a relative path to the backend folder.
const API = '../backend/posts.php';
const AUTH = '../backend/auth.php';
let currentUser = null;

async function fetchPosts(){
  const res = await fetch(API, {credentials: 'same-origin'});
  const posts = await res.json();
  const list = document.getElementById('postsList');
  if(!posts || posts.length === 0){ list.innerHTML = '<p>No devlogs yet.</p>'; return; }
  list.innerHTML = '';
  posts.forEach(p => {
    const el = document.createElement('div'); el.className = 'post';
    el.innerHTML = `
      <h3>${escapeHtml(p.title)}</h3>
      <div class="meta">By <strong>${escapeHtml(p.author || 'Anonymous')}</strong> • ${new Date(p.created_at).toLocaleString()}</div>
      <p>${escapeHtml(p.content)}</p>
      <div class="post-actions">
        <button class="btn-small" onclick="startEdit(${p.id})">Edit</button>
        <button class="btn-small" onclick="deletePost(${p.id})">Delete</button>
      </div>
    `;
    list.appendChild(el);
  });
}

function escapeHtml(s){ if(!s) return ''; return s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;'); }

async function createOrUpdate(e){
  e.preventDefault();
  const id = document.getElementById('postId').value;
  const title = document.getElementById('title').value.trim();
  const content = document.getElementById('content').value.trim();
  
  if(!title || !content) return alert('Title and content required');
  if(!currentUser) return alert('You must be logged in to create or edit devlogs');
  
  if(id){
    await fetch(API, {method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify({id, title, content}), credentials: 'same-origin'});
  } else {
    await fetch(API, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({title, content}), credentials: 'same-origin'});
  }
  resetForm();
  fetchPosts();
}

function startEdit(id){
  fetch(API + '?id=' + id, {credentials: 'same-origin'}).then(r=>r.json()).then(p=>{
    document.getElementById('postId').value = p.id;
    document.getElementById('title').value = p.title;
    document.getElementById('content').value = p.content;
    window.scrollTo({top:0,behavior:'smooth'});
  });
}

async function deletePost(id){
  if(!confirm('Delete devlog?')) return;
  if(!currentUser) return alert('You must be logged in to delete devlogs');
  await fetch(API + '?id=' + id, {method:'DELETE', credentials: 'same-origin'});
  fetchPosts();
}

async function checkAuth(){
  try{
    const res = await fetch(AUTH + '?action=me', {credentials: 'same-origin'});
    const me = await res.json();
    currentUser = me;
    const area = document.getElementById('authArea');
    if(!area) return;
    if(me){
      area.innerHTML = `Logged in as <strong>${escapeHtml(me.username)}</strong> <button id="logoutBtn">Logout</button>`;
      document.getElementById('logoutBtn').addEventListener('click', async ()=>{
      await fetch(AUTH + '?action=logout', {method:'POST', credentials: 'same-origin'});
      location.reload();
      });
    } else {
      area.innerHTML = `<a href="login.html"><div class="auth-btn auth-btn-login">⚡ Sign In</div></a> <a href="register.html"><div class="auth-btn-register auth-btn">🔧 Register</div></a>`;
    }
  }catch(e){ console.warn('auth check failed', e); }
}
function resetForm(){
  document.getElementById('postId').value = '';
  document.getElementById('title').value = '';
  document.getElementById('content').value = '';
}

document.addEventListener('DOMContentLoaded', ()=>{
  document.getElementById('postForm').addEventListener('submit', createOrUpdate);
  document.getElementById('cancelEdit').addEventListener('click', resetForm);
  checkAuth();
  fetchPosts();
});
