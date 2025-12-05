// ----------------- Supabase setup -----------------
const SUPABASE_URL = 'https://drkjmtanzqmjgpltjqcg.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_N8SmY7U4KDsqCtuoMIQ2fA_D6rNjL4N';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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
    loginBtn.onclick = () => { sessionStorage.removeItem('lg_logged'); loginStateChanged(false); }
  } else {
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
    <input id="loginPwd" type="password" placeholder="password">
    <div style="margin-top:10px;text-align:right">
      <button class="btn" onclick="doLogin()">Login</button>
    </div>
  `);
}

function doLogin(){
  const pwd = document.getElementById('loginPwd').value;
  // demo local password check
  if(pwd === 'admin123'){ 
    closeModal(); 
    loginStateChanged(true); 
  } else alert('Wrong password');
}

loginBtn.addEventListener('click', showLoginModal);
if(isLoggedIn()) loginStateChanged(true);

// ----------------- Properties -----------------
async function loadProperties(){
  const { data, error } = await supabase.from('properties').select('*').order('created_at',{ascending:false});
  if(error) return console.error(error);

  propsGrid.innerHTML = '';
  data.forEach(p => {
    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `
      <img src="${p.image_url}" alt="${p.title}">
      <div style="margin-top:10px">
        <div class="meta"><div class="name">${p.title}</div><div class="price">$${p.price}</div></div>
        <div class="muted" style="margin-top:6px">${p.characteristics}</div>
        <div style="margin-top:8px; display:flex; justify-content:space-between; align-items:center">
          <div class="muted">Value: <strong>$${p.value}</strong></div>
          ${isLoggedIn()?`<button class="btn danger" onclick="deleteProperty(${p.id})">Delete</button>`:''}
        </div>
      </div>
    `;
    propsGrid.appendChild(div);
  });
}

async function deleteProperty(id){
  if(!confirm('Delete this property?')) return;
  const { error } = await supabase.from('properties').delete().eq('id', id);
  if(error) return alert('Error: '+error.message);
  loadProperties();
}

document.getElementById('openAdd').addEventListener('click', ()=>{
  if(!isLoggedIn()){ alert('Login as admin first'); return }
  showModal(`
    <h3>Add Property</h3>
    <label>Title</label><input id="propTitle" type="text">
    <label>Image URL</label><input id="propImage" type="text">
    <label>Characteristics</label><input id="propChars" type="text">
    <label>Price</label><input id="propPrice" type="number">
    <label>Value</label><input id="propValue" type="number">
    <div style="margin-top:10px;text-align:right">
      <button class="btn" onclick="addProperty()">Add</button>
      <button class="btn danger" onclick="closeModal()">Cancel</button>
    </div>
  `)
})

async function addProperty(){
  const title = document.getElementById('propTitle').value;
  const image_url = document.getElementById('propImage').value;
  const characteristics = document.getElementById('propChars').value;
  const price = Number(document.getElementById('propPrice').value);
  const value = Number(document.getElementById('propValue').value);

  const { error } = await supabase.from('properties').insert([{title,image_url,characteristics,price,value}]);
  if(error) return alert('Error: '+error.message);
  closeModal();
  loadProperties();
}

// ----------------- Team -----------------
async function loadTeam(){
  const { data, error } = await supabase.from('team').select('*');
  if(error) return console.error(error);

  teamGrid.innerHTML = '';
  data.forEach(member => {
    const div = document.createElement('div');
    div.className='card';
    div.innerHTML = `
      <img src="${member.image_url}" alt="${member.name}">
      <div style="margin-top:10px">
        <div class="name">${member.name}</div>
        <div class="muted">${member.role}</div>
        ${isLoggedIn()?`<button class="btn" onclick="editTeam(${member.id})">Edit</button>`:''}
      </div>
    `;
    teamGrid.appendChild(div);
  })
}

async function editTeam(id){
  const { data } = await supabase.from('team').select('*').eq('id', id).single();
  showModal(`
    <h3>Edit Team Member</h3>
    <label>Name</label><input id="teamName" type="text" value="${data.name}">
    <label>Role</label><input id="teamRole" type="text" value="${data.role}">
    <label>Image URL</label><input id="teamImage" type="text" value="${data.image_url}">
    <div style="margin-top:10px;text-align:right">
      <button class="btn" onclick="saveTeam(${id})">Save</button>
      <button class="btn danger" onclick="closeModal()">Cancel</button>
    </div>
  `)
}

async function saveTeam(id){
  const name = document.getElementById('teamName').value;
  const role = document.getElementById('teamRole').value;
  const image_url = document.getElementById('teamImage').value;

  const { error } = await supabase.from('team').update({name,role,image_url}).eq('id',id);
  if(error) return alert('Error: '+error.message);
  closeModal();
  loadTeam();
}

// ----------------- Contact -----------------
async function loadContact(){
  const { data } = await supabase.from('contact').select('*').single();
  if(!data) return;

  contactSection.innerHTML = `
    <h2 style="color:var(--primary)">Contact Us</h2>
    <p class="muted">Reach out to LeadGen Immobilier</p>
    <div style="display:flex;gap:16px;flex-wrap:wrap;margin-top:12px">
      <div class="card" style="flex:1;min-width:260px">
        <h3 style="margin:0 0 8px">Direct</h3>
        <div class="muted">Phone: <a href="tel:${data.phone}">${data.phone}</a></div>
        <div class="muted">WhatsApp: <a href="https://wa.me/${data.whatsapp}" target="_blank">Chat on WhatsApp</a></div>
        <div class="muted">Email: <a href="mailto:${data.email}">${data.email}</a></div>
        ${isLoggedIn()?`<button class="btn" onclick="editContact()">Edit</button>`:''}
      </div>
    </div>
  `;
}

async function editContact(){
  const { data } = await supabase.from('contact').select('*').single();
  showModal(`
    <h3>Edit Contact Info</h3>
    <label>Phone</label><input id="contactPhone" type="text" value="${data.phone}">
    <label>WhatsApp</label><input id="contactWhatsapp" type="text" value="${data.whatsapp}">
    <label>Email</label><input id="contactEmail" type="text" value="${data.email}">
    <div style="margin-top:10px;text-align:right">
      <button class="btn" onclick="saveContact()">Save</button>
      <button class="btn danger" onclick="closeModal()">Cancel</button>
    </div>
  `)
}

async function saveContact(){
  const phone = document.getElementById('contactPhone').value;
  const whatsapp = document.getElementById('contactWhatsapp').value;
  const email = document.getElementById('contactEmail').value;

  const { error } = await supabase.from('contact').update({phone,whatsapp,email}).eq('id',1);
  if(error) return alert('Error: '+error.message);
  closeModal();
  loadContact();
}

// ----------------- Feedback -----------------
document.getElementById('feedbackForm').addEventListener('submit', async (e)=>{
  e.preventDefault();
  const name = document.getElementById('fbname').value;
  const message = document.getElementById('fbmsg').value;
  if(!name||!message) return alert('Fill all fields');
  const { error } = await supabase.from('feedback').insert([{name,message}]);
  if(error) return alert('Error: '+error.message);
  alert('Thanks for your feedback!');
  document.getElementById('fbname').value='';
  document.getElementById('fbmsg').value='';
});

// ----------------- Initial load -----------------
loadProperties();
loadTeam();
loadContact();
