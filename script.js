// ----------------- DOM elements -----------------
const adminPanel = document.getElementById('adminPanel');
const loginBtn = document.getElementById('loginBtn');
const modalWrap = document.getElementById('modalWrap');
const modalContent = document.getElementById('modalContent');
const propsGrid = document.getElementById('propsGrid');
const teamGrid = document.getElementById('teamGrid');
const contactSection = document.getElementById('contact');

// ----------------- Utility functions -----------------
function showModal(html){
  modalContent.innerHTML = html;
  modalWrap.style.display = 'flex';
}
function closeModal(){
  modalWrap.style.display = 'none';
  modalContent.innerHTML = '';
}
modalWrap.addEventListener('click', (e) => { if(e.target === modalWrap) closeModal(); });

function isLoggedIn(){ return sessionStorage.getItem('lg_logged') === '1'; }
function loginStateChanged(logged){
  if(logged){
    sessionStorage.setItem('lg_logged','1');
    adminPanel.style.display='block';
    loginBtn.textContent='Logout';
    loginBtn.onclick = () => { sessionStorage.removeItem('lg_logged'); loginStateChanged(false); };
  } else {
    sessionStorage.removeItem('lg_logged');
    adminPanel.style.display='none';
    loginBtn.textContent='Admin';
    loginBtn.onclick = showLoginModal;
  }
}

// ----------------- Admin Login -----------------
function showLoginModal(){
  showModal(`
    <h3>Admin Login</h3>
    <label>Password</label>
    <input id="loginPwd" type="password" placeholder="Enter password">
    <div style="margin-top:10px;text-align:right">
      <button class="btn" onclick="doLogin()">Login</button>
    </div>
  `);
}

function doLogin(){
  const pwd = document.getElementById('loginPwd').value;
  const demoPwd = 'admin123'; // Demo password
  if(pwd === demoPwd){
    closeModal();
    loginStateChanged(true);
  } else alert('Wrong password');
}

// Initial check
if(isLoggedIn()) loginStateChanged(true);
else adminPanel.style.display='none';
loginBtn.onclick = showLoginModal;

// ----------------- Demo storage -----------------
const STORAGE_KEYS = {PROPS:'lg_props', TEAM:'lg_team', CONTACT:'lg_contact'};

function getProps(){ return JSON.parse(localStorage.getItem(STORAGE_KEYS.PROPS) || '[]'); }
function saveProps(list){ localStorage.setItem(STORAGE_KEYS.PROPS, JSON.stringify(list)); }

function getTeam(){ return JSON.parse(localStorage.getItem(STORAGE_KEYS.TEAM) || '[]'); }
function saveTeam(list){ localStorage.setItem(STORAGE_KEYS.TEAM, JSON.stringify(list)); }

function getContact(){ 
  const c = localStorage.getItem(STORAGE_KEYS.CONTACT); 
  return c ? JSON.parse(c) : {phone:'+212600000000', whatsapp:'212600000000', email:'contact@leadgen-immobilier.com'}; 
}
function saveContact(obj){ localStorage.setItem(STORAGE_KEYS.CONTACT, JSON.stringify(obj)); }

// ----------------- Render Properties -----------------
function renderProperties(){
  const list = getProps();
  propsGrid.innerHTML = '';
  if(!list.length) propsGrid.innerHTML='<div class="muted">No properties yet (admin: click Admin & add)</div>';
  list.forEach((p, idx)=>{
    const el = document.createElement('div');
    el.className='card';
    el.innerHTML = `
      <img src="${p.image||'https://images.unsplash.com/photo-1560185127-6c1b9e2f0c44?auto=format&fit=crop&w=900&q=60'}" alt="${p.name}">
      <div style="margin-top:10px">
        <div class="meta"><div class="name">${p.name}</div><div class="price">$${p.price}</div></div>
        <div class="muted" style="margin-top:6px">${p.characteristics}</div>
        ${isLoggedIn()?`<div style="margin-top:6px;text-align:right"><button class="btn danger" onclick="deleteProp(${idx})">Delete</button></div>`:''}
      </div>
    `;
    propsGrid.appendChild(el);
  })
}

function addPropertyModal(){
  if(!isLoggedIn()){ alert('Login first'); return; }
  showModal(`
    <h3>Add Property</h3>
    <label>Name</label><input id="propName" type="text">
    <label>Image URL</label><input id="propImage" type="text">
    <label>Characteristics</label><input id="propChars" type="text">
    <label>Price</label><input id="propPrice" type="number">
    <label>Actual Value</label><input id="propActual" type="number">
    <div style="margin-top:10px;text-align:right">
      <button class="btn" onclick="addProperty()">Add</button>
      <button class="btn danger" onclick="closeModal()">Cancel</button>
    </div>
  `)
}

function addProperty(){
  const name = document.getElementById('propName').value.trim();
  const image = document.getElementById('propImage').value.trim();
  const characteristics = document.getElementById('propChars').value.trim();
  const price = Number(document.getElementById('propPrice').value);
  const actualValue = Number(document.getElementById('propActual').value);
  if(!name){ alert('Name required'); return; }
  const list = getProps();
  list.unshift({name,image,characteristics,price,actualValue});
  saveProps(list); closeModal(); renderProperties();
}

function deleteProp(idx){
  if(!isLoggedIn()){ alert('Login first'); return; }
  if(!confirm('Delete this property?')) return;
  const list = getProps(); list.splice(idx,1); saveProps(list); renderProperties();
}

// ----------------- Team -----------------
function renderTeam(){
  const list = getTeam();
  teamGrid.innerHTML = '';
  list.forEach((member, idx)=>{
    const el = document.createElement('div');
    el.className='card';
    el.innerHTML = `
      <img src="${member.image||'https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=crop&w=900&q=60'}" alt="${member.name}">
      <div style="margin-top:10px">
        <div class="name">${member.name}</div>
        <div class="muted">${member.role}</div>
        ${isLoggedIn()?`<button class="btn" onclick="editTeam(${idx})">Edit</button>`:''}
      </div>
    `;
    teamGrid.appendChild(el);
  })
}

function editTeam(idx){
  const member = getTeam()[idx];
  showModal(`
    <h3>Edit Team Member</h3>
    <label>Name</label><input id="teamName" type="text" value="${member.name}">
    <label>Role</label><input id="teamRole" type="text" value="${member.role}">
    <label>Image URL</label><input id="teamImage" type="text" value="${member.image}">
    <div style="margin-top:10px;text-align:right">
      <button class="btn" onclick="saveTeam(${idx})">Save</button>
      <button class="btn danger" onclick="closeModal()">Cancel</button>
    </div>
  `)
}

function saveTeam(idx){
  const list = getTeam();
  list[idx] = {
    name: document.getElementById('teamName').value,
    role: document.getElementById('teamRole').value,
    image: document.getElementById('teamImage').value
  };
  saveTeam(list); closeModal(); renderTeam();
}

// ----------------- Contact -----------------
function renderContact(){
  const c = getContact();
  contactSection.innerHTML = `
    <h2 style="color:var(--primary)">Contact Us</h2>
    <p class="muted">Reach out to LeadGen Immobilier</p>
    <div style="display:flex;gap:16px;flex-wrap:wrap;margin-top:12px">
      <div class="card" style="flex:1;min-width:260px">
        <h3 style="margin:0 0 8px">Direct</h3>
        <div class="muted">Phone: <a href="tel:${c.phone}">${c.phone}</a></div>
        <div class="muted">WhatsApp: <a href="https://wa.me/${c.whatsapp}" target="_blank">Chat on WhatsApp</a></div>
        <div class="muted">Email: <a href="mailto:${c.email}">${c.email}</a></div>
        ${isLoggedIn()?`<button class="btn" onclick="editContact()">Edit</button>`:''}
      </div>
    </div>
  `;
}

function editContact(){
  const c = getContact();
  showModal(`
    <h3>Edit Contact Info</h3>
    <label>Phone</label><input id="contactPhone" type="text" value="${c.phone}">
    <label>WhatsApp</label><input id="contactWhatsapp" type="text" value="${c.whatsapp}">
    <label>Email</label><input id="contactEmail" type="text" value="${c.email}">
    <div style="margin-top:10px;text-align:right">
      <button class="btn" onclick="saveContact()">Save</button>
      <button class="btn danger" onclick="closeModal()">Cancel</button>
    </div>
  `)
}

function saveContact(){
  const c = {
    phone: document.getElementById('contactPhone').value,
    whatsapp: document.getElementById('contactWhatsapp').value,
    email: document.getElementById('contactEmail').value
  };
  saveContact(c); closeModal(); renderContact();
}

// ----------------- Initial load -----------------
renderProperties();
renderTeam();
renderContact();

// Link Admin panel buttons
document.getElementById('openAdd').addEventListener('click', addPropertyModal);
document.getElementById('openManage').addEventListener('click', () => {
  if(!isLoggedIn()){ alert('Login first'); return; }
  alert('Manage button clicked - you can extend this for property management');
});
