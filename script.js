// ---------------- Supabase setup ----------------
const SUPABASE_URL = 'https://drkjmtanzqmjgpltjqcg.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_N8SmY7U4KDsqCtuoMIQ2fA_D6rNjL4N';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ---------------- DOM elements (global) ----------------
const loginBtn = document.getElementById('loginBtn');
const adminPanel = document.getElementById('adminPanel');
const modalWrap = document.getElementById('modalWrap');
const modalContent = document.getElementById('modalContent');
const openAddBtn = document.getElementById('openAdd');
const openManageBtn = document.getElementById('openManage');

// helper safe DOM getter
function $id(id){ return document.getElementById(id); }

// ---------- Utility ----------
function escapeHtml(str=''){ return String(str).replace(/[&<>"]/g, s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[s])); }
function sanitizeUrl(url){ return url ? url.split(' ').join('%20') : ''; }
function formatPrice(v){ if(v===null||v===undefined||v==='') return '—'; return v; }

// ---------- Modal show/hide ----------
function showModal(html){
  if(!modalWrap || !modalContent) return;
  modalContent.innerHTML = html;
  modalWrap.style.display = 'flex';
}
function hideModal(){ if(modalWrap) modalWrap.style.display = 'none'; }
if(modalWrap) modalWrap.addEventListener('click', e=>{ if(e.target === modalWrap) hideModal(); });

// ---------- Auth: show login modal ----------
async function checkSessionAndShowPanel(){
  try{
    const { data } = await supabase.auth.getSession();
    if(data?.session) {
      showAdminPanel();
    } else {
      // not logged in
      adminPanel && (adminPanel.style.display = 'none');
      loginBtn && (loginBtn.textContent = 'Admin');
    }
  }catch(e){ console.error(e); }
}
checkSessionAndShowPanel();

if(loginBtn){
  loginBtn.addEventListener('click', async ()=>{
    const { data } = await supabase.auth.getSession();
    if(data?.session){
      // already logged in -> logout
      await supabase.auth.signOut();
      hideModal();
      adminPanel && (adminPanel.style.display = 'none');
      loginBtn.textContent = 'Admin';
      alert('Logged out');
      return;
    }
    // show login modal
    showModal(`
      <h3>Admin login</h3>
      <label>Email</label><input id="adminEmailModal" type="email" placeholder="email">
      <label>Password</label><input id="adminPasswordModal" type="password" placeholder="password">
      <div style="margin-top:12px;text-align:right">
        <button class="btn" id="doLogin">Login</button>
      </div>
    `);
    document.getElementById('doLogin').addEventListener('click', async ()=>{
      const email = document.getElementById('adminEmailModal').value;
      const pass = document.getElementById('adminPasswordModal').value;
      if(!email || !pass) return alert('enter credentials');
      const res = await supabase.auth.signInWithPassword({ email, password: pass });
      if(res.error) return alert('Login failed: '+res.error.message);
      hideModal();
      showAdminPanel();
      alert('Logged in');
    });
  });
}

// ---------- Show admin panel (build buttons and handlers) ----------
function showAdminPanel(){
  if(!adminPanel) return;
  adminPanel.style.display = 'block';
  adminPanel.innerHTML = `
    <div style="font-weight:800">Admin</div>
    <div style="font-size:13px;opacity:0.95">Manage listings</div>
    <div style="margin-top:10px;display:flex;gap:8px">
      <button class="btn" id="btnAddProp">Add Property</button>
      <button class="btn" id="btnManageProp">Manage</button>
      <button class="btn danger" id="btnLogout">Logout</button>
    </div>
  `;
  $id('btnAddProp').addEventListener('click', showAddPropertyModal);
  $id('btnManageProp').addEventListener('click', showManageModal);
  $id('btnLogout').addEventListener('click', async ()=>{
    await supabase.auth.signOut();
    adminPanel.style.display = 'none';
    loginBtn.textContent = 'Admin';
    alert('Logged out');
  });
}

// ---------- Add Property Modal ----------
function showAddPropertyModal(){
  showModal(`
    <h3>Add Property</h3>

    <label>Title</label><input id="prop_title" type="text" placeholder="Title">
    <label>Description</label><textarea id="prop_description" placeholder="Description"></textarea>
    <div class="row" style="margin-top:8px">
      <div style="flex:1">
        <label>Price</label><input id="prop_price" type="text" placeholder="Price">
      </div>
      <div style="flex:1">
        <label>Value</label><input id="prop_value" type="text" placeholder="Value / size">
      </div>
    </div>
    <label style="margin-top:8px">Characteristics</label><input id="prop_characterestics" type="text" placeholder="E.g., 3 bed, 2 bath">
    <label style="margin-top:8px">Image (file)</label><input id="prop_image_file" type="file" accept="image/*">

    <div style="margin-top:12px;text-align:right">
      <button class="btn" id="savePropertyBtn">Save</button>
    </div>
  `);

  document.getElementById('savePropertyBtn').addEventListener('click', saveProperty);
}

async function saveProperty(){
  const title = $id('prop_title')?.value || '';
  const description = $id('prop_description')?.value || '';
  const price = $id('prop_price')?.value || '';
  const value = $id('prop_value')?.value || '';
  const characterestics = $id('prop_characterestics')?.value || '';
  const fileInput = $id('prop_image_file');
  let image_url = '';

  if(!title || !description) return alert('Title and description required');

  // If file selected -> upload to storage bucket 'properties'
  if(fileInput && fileInput.files && fileInput.files[0]){
    const file = fileInput.files[0];
    const fileName = `${Date.now()}-${file.name}`;
    const { error: uploadErr } = await supabase.storage.from('properties').upload(fileName, file);
    if(uploadErr){ console.error(uploadErr); alert('Image upload failed'); return; }
    const { data: publicData } = supabase.storage.from('properties').getPublicUrl(fileName);
    image_url = publicData.publicUrl;
  }

  // Insert into properties table using your schema fields
  const { error } = await supabase.from('properties').insert([{
    title,
    description,
    price,
    value,
    characterestics,
    image_url,
    owner_id: (await supabase.auth.getUser()).data?.user?.id || 'admin',
    created_at: new Date()
  }]);

  if(error){ console.error(error); alert('Save failed: '+error.message); return; }

  hideModal();
  alert('Property added');
  // refresh property lists if present
  loadPublicProperties();
  loadAdminProperties();
}

// ---------- Manage modal (quick list with edit/delete) ----------
function showManageModal(){
  showModal(`<h3>Manage Properties</h3><div id="manageList" style="max-height:60vh;overflow:auto;margin-top:12px"></div>`);
  loadAdminProperties();
}

async function loadAdminProperties(){
  const el = $id('manageList') || $id('adminPropsList');
  if(!el) return;
  el.innerHTML = '<div class="muted">Loading...</div>';

  const { data, error } = await supabase.from('properties').select('*').order('created_at',{ascending:false});
  if(error){ el.innerHTML = '<div class="muted">Failed to load</div>'; console.error(error); return; }
  if(!data || data.length===0){ el.innerHTML = '<div class="muted">No properties yet.</div>'; return; }

  const html = data.map(p=>{
    return `
      <div class="card" style="padding:10px">
        <img src="${sanitizeUrl(p.image_url)}" alt="${escapeHtml(p.title)}">
        <div style="margin-top:8px">
          <div class="name">${escapeHtml(p.title)}</div>
          <div class="muted">${escapeHtml(p.characterestics || '')}</div>
          <div style="margin-top:8px;display:flex;gap:8px">
            <button class="btn" data-id="${p.id}" data-action="edit">Edit</button>
            <button class="btn danger" data-id="${p.id}" data-action="delete">Delete</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
  el.innerHTML = html;

  // add listeners
  el.querySelectorAll('button[data-action]').forEach(btn=>{
    btn.addEventListener('click', async (e)=>{
      const id = btn.getAttribute('data-id');
      const action = btn.getAttribute('data-action');
      if(action === 'delete') return deleteProperty(id);
      if(action === 'edit') return openEditModal(id);
    });
  });
}

// ---------- Delete ----------
async function deleteProperty(id){
  if(!confirm('Delete this property?')) return;
  const { error } = await supabase.from('properties').delete().eq('id', id);
  if(error){ alert('Delete failed: '+error.message); console.error(error); return; }
  alert('Deleted');
  loadAdminProperties();
  loadPublicProperties();
}

// ---------- Edit ----------
async function openEditModal(id){
  const { data, error } = await supabase.from('properties').select('*').eq('id', id).single();
  if(error || !data){ alert('Not found'); return; }

  showModal(`
    <h3>Edit Property</h3>
    <label>Title</label><input id="edit_title" value="${escapeHtml(data.title)}" type="text">
    <label>Description</label><textarea id="edit_description">${escapeHtml(data.description||'')}</textarea>
    <div class="row" style="margin-top:8px">
      <div style="flex:1">
        <label>Price</label><input id="edit_price" value="${escapeHtml(data.price||'')}" type="text">
      </div>
      <div style="flex:1">
        <label>Value</label><input id="edit_value" value="${escapeHtml(data.value||'')}" type="text">
      </div>
    </div>
    <label style="margin-top:8px">Characteristics</label><input id="edit_characterestics" value="${escapeHtml(data.characterestics||'')}" type="text">
    <label style="margin-top:8px">Change image (optional)</label><input id="edit_image_file" type="file" accept="image/*">
    <div style="margin-top:12px;text-align:right">
      <button class="btn" id="doUpdate">Update</button>
    </div>
  `);

  document.getElementById('doUpdate').addEventListener('click', ()=> updateProperty(id, data.image_url) );
}

async function updateProperty(id, oldImageUrl){
  const title = $id('edit_title')?.value || '';
  const description = $id('edit_description')?.value || '';
  const price = $id('edit_price')?.value || '';
  const value = $id('edit_value')?.value || '';
  const characterestics = $id('edit_characterestics')?.value || '';
  const fileInput = $id('edit_image_file');

  let image_url = oldImageUrl;

  if(fileInput && fileInput.files && fileInput.files[0]){
    const file = fileInput.files[0];
    const fileName = `${Date.now()}-${file.name}`;
    const { error: uploadErr } = await supabase.storage.from('properties').upload(fileName, file);
    if(uploadErr){ alert('Image upload failed'); console.error(uploadErr); return; }
    const { data: publicData } = supabase.storage.from('properties').getPublicUrl(fileName);
    image_url = publicData.publicUrl;
  }

  const { error } = await supabase.from('properties').update({
    title, description, price, value, characterestics, image_url
  }).eq('id', id);

  if(error){ alert('Update failed: '+error.message); console.error(error); return; }

  hideModal();
  alert('Updated');
  loadAdminProperties();
  loadPublicProperties();
}

// ---------- Public properties load (for properties.html) ----------
async function loadPublicProperties(){
  const grid = $id('propsGrid');
  if(!grid) return;
  grid.innerHTML = '<div class="muted">Loading...</div>';

  const { data, error } = await supabase.from('properties').select('*').order('created_at',{ascending:false});
  if(error){ grid.innerHTML = '<div class="muted">Failed to load</div>'; console.error(error); return; }
  if(!data || data.length===0){ grid.innerHTML = '<div class="muted">No properties yet.</div>'; return; }

  grid.innerHTML = data.map(p=>{
    return `
      <div class="card">
        <img src="${sanitizeUrl(p.image_url)}" alt="${escapeHtml(p.title)}">
        <h3>${escapeHtml(p.title)}</h3>
        <p>${escapeHtml(p.characterestics || '')}</p>
        <p>Price: ${formatPrice(p.price)}</p>
        <p>Value: ${formatPrice(p.value)}</p>
      </div>
    `;
  }).join('');
}

// ---------- Init: wire admin-panel open buttons on DOM ready ----------
document.addEventListener('DOMContentLoaded', ()=>{
  // ensure admin panel buttons work if in DOM (from original pages)
  $id('openAdd')?.addEventListener('click', showAddPropertyModal);
  $id('openManage')?.addEventListener('click', showManageModal);

  // load public properties if propsGrid present
  loadPublicProperties();

  // If on admin.html we need to show admin list
  loadAdminProperties();
});
