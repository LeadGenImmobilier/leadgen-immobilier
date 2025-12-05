// ----------------- Supabase Setup -----------------
const SUPABASE_URL = 'sb_publishable_N8SmY7U4KDsqCtuoMIQ2fA_D6rNjL4N';
const SUPABASE_ANON_KEY = 'sb_secret_1DLFRaoWrjz_IRNU1zKUWA_cwhJnEbX';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ----------------- DOM Elements -----------------
const loginBtn = document.getElementById('loginBtn');
const adminPanel = document.getElementById('adminPanel');
const modalWrap = document.getElementById('modalWrap');
const modalContent = document.getElementById('modalContent');
const propsGrid = document.getElementById('propsGrid');

// ----------------- Utility Functions -----------------
function showModal(html) {
  modalContent.innerHTML = html;
  modalWrap.style.display = 'flex';
}
function closeModal() {
  modalWrap.style.display = 'none';
  modalContent.innerHTML = '';
}
modalWrap.addEventListener('click', e => {
  if(e.target === modalWrap) closeModal();
});

function isLoggedIn() {
  return sessionStorage.getItem('lg_logged') === '1';
}
function setLoginState(logged) {
  if (logged) {
    sessionStorage.setItem('lg_logged','1');
    adminPanel.style.display = 'block';
    loginBtn.textContent = 'Logout';
    loginBtn.onclick = () => {
      sessionStorage.removeItem('lg_logged');
      adminPanel.style.display = 'none';
      loginBtn.textContent = 'Admin';
      loginBtn.onclick = handleLoginBtn;
    }
  } else {
    adminPanel.style.display = 'none';
    loginBtn.textContent = 'Admin';
    loginBtn.onclick = handleLoginBtn;
  }
}

// ----------------- Render Properties -----------------
async function loadProperties() {
  const { data: properties, error } = await supabase
    .from('properties')
    .select('*')
    .order('created_at', { ascending: false });

  if(error) return console.error(error);

  propsGrid.innerHTML = '';
  if(!properties.length){
    propsGrid.innerHTML = `<div class="muted">No properties available</div>`;
    return;
  }

  properties.forEach(p => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${p.image_url}" alt="${p.title}">
      <div style="margin-top:10px">
        <div class="meta">
          <div class="name">${p.title}</div>
          <div class="price">$${p.price.toLocaleString()}</div>
        </div>
        <div class="muted" style="margin-top:6px">${p.characteristics}</div>
        <div style="margin-top:8px;display:flex;justify-content:space-between;align-items:center">
          <div class="muted">Value: <strong>$${p.value.toLocaleString()}</strong></div>
          ${isLoggedIn() ? `<button class="btn danger" onclick="deleteProperty('${p.id}')">Delete</button>` : ''}
        </div>
      </div>
    `;
    propsGrid.appendChild(card);
  });
}

// ----------------- Admin Functions -----------------
async function handleLoginBtn() {
  if(!isLoggedIn()) {
    showModal(`
      <h3>Admin Login</h3>
      <label>Email</label>
      <input type="email" id="adminEmail" placeholder="Admin email">
      <label>Password</label>
      <input type="password" id="adminPassword" placeholder="Password">
      <div style="margin-top:10px;text-align:right">
        <button class="btn" onclick="adminLogin()">Login</button>
      </div>
    `);
  }
}

async function adminLogin() {
  const email = document.getElementById('adminEmail').value;
  const password = document.getElementById('adminPassword').value;

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if(error) return alert('Login failed: ' + error.message);

  alert('Logged in!');
  closeModal();
  setLoginState(true);
  loadProperties();
}

// Add Property Modal
document.getElementById('openAdd').addEventListener('click', ()=>{
  if(!isLoggedIn()) { alert('Please login first'); return; }
  showModal(`
    <h3>Add Property</h3>
    <label>Title</label><input id="propTitle" type="text">
    <label>Image URL</label><input id="propImage" type="text">
    <label>Characteristics</label><input id="propChars" type="text">
    <div class="row" style="margin-top:8px">
      <div class="small"><label>Price</label><input id="propPrice" type="number"></div>
      <div class="small"><label>Value</label><input id="propValue" type="number"></div>
    </div>
    <div style="text-align:right;margin-top:10px">
      <button class="btn" onclick="addProperty()">Add</button>
      <button class="btn danger" onclick="closeModal()">Cancel</button>
    </div>
  `);
});

async function addProperty() {
  const title = document.getElementById('propTitle').value;
  const image_url = document.getElementById('propImage').value;
  const characteristics = document.getElementById('propChars').value;
  const price = Number(document.getElementById('propPrice').value);
  const value = Number(document.getElementById('propValue').value);

  const { data, error } = await supabase.from('properties').insert([{
    title, image_url, characteristics, price, value
  }]);
  if(error) return alert('Error: ' + error.message);

  alert('Property added!');
  closeModal();
  loadProperties();
}

async function deleteProperty(id){
  if(!confirm('Delete this property?')) return;
  const { error } = await supabase.from('properties').delete().eq('id', id);
  if(error) return alert('Error: ' + error.message);
  loadProperties();
}

// Manage Properties Button
document.getElementById('openManage').addEventListener('click', async ()=>{
  if(!isLoggedIn()){ alert('Please login first'); return; }

  const { data: properties, error } = await supabase.from('properties').select('*').order('created_at',{ascending:false});
  if(error) return alert(error.message);

  let html = `<h3>Manage Properties</h3><div style="max-height:360px;overflow:auto;margin-top:10px">`;
  properties.forEach(p=>{
    html += `
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:8px">
        <img src="${p.image_url}" style="width:72px;height:56px;object-fit:cover;border-radius:8px">
        <div style="flex:1"><div style="font-weight:700">${p.title}</div><div class="muted">${p.characteristics}</div></div>
        <div><button class="btn danger" onclick="deleteProperty('${p.id}')">Delete</button></div>
      </div>
    `;
  });
  html += `</div><div style="text-align:right;margin-top:10px"><button class="btn" onclick="closeModal()">Close</button></div>`;
  showModal(html);
});

// ----------------- Initialize -----------------
loginBtn.onclick = handleLoginBtn;
if(isLoggedIn()) setLoginState(true);
loadProperties();
