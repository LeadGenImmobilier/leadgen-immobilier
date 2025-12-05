// ----------------- Data storage -----------------
const STORAGE_KEYS = {PROPS:'lg_props', ADMIN:'lg_admin'};

const adminPanel = document.getElementById('adminPanel');
const loginBtn = document.getElementById('loginBtn');
const modalWrap = document.getElementById('modalWrap');
const modalContent = document.getElementById('modalContent');

function getProps(){
  try{return JSON.parse(localStorage.getItem(STORAGE_KEYS.PROPS)||'[]');}catch(e){return [];}
}
function saveProps(list){localStorage.setItem(STORAGE_KEYS.PROPS,JSON.stringify(list));}
function getAdmin(){
  try{return JSON.parse(localStorage.getItem(STORAGE_KEYS.ADMIN)||'null');}catch(e){return null;}
}
function saveAdmin(obj){localStorage.setItem(STORAGE_KEYS.ADMIN,JSON.stringify(obj));}

// ----------------- Modal -----------------
function showModal(html){ modalContent.innerHTML=html; modalWrap.style.display='flex'; }
function closeModal(){ modalWrap.style.display='none'; modalContent.innerHTML=''; }
modalWrap.addEventListener('click',e=>{if(e.target===modalWrap) closeModal();})

// ----------------- Admin auth -----------------
loginBtn.addEventListener('click',()=>{
  const admin=getAdmin();
  if(!admin){
    showModal(`<h3>Setup admin account</h3>
      <label>Password (choose strong)</label>
      <input id="initPwd" type="text" placeholder="admin password">
      <div style="margin-top:10px;text-align:right"><button class="btn" onclick="createAdmin()">Create</button></div>`);
  } else {
    showModal(`<h3>Admin login</h3>
      <label>Password</label>
      <input id="loginPwd" type="password" placeholder="password">
      <div style="margin-top:10px;text-align:right"><button class="btn" onclick="doLogin()">Login</button></div>`);
  }
});

window.createAdmin=()=>{
  const pwd=document.getElementById('initPwd').value.trim();
  if(!pwd){alert('Enter password'); return;}
  saveAdmin({password:pwd});
  alert('Admin created');
  closeModal();
  loginStateChanged(true);
}

window.doLogin=()=>{
  const pwd=document.getElementById('loginPwd').value;
  const admin=getAdmin();
  if(admin && pwd===admin.password){closeModal(); loginStateChanged(true);}
  else alert('Wrong password');
}

function isLoggedIn(){return sessionStorage.getItem('lg_logged')==='1';}
function loginStateChanged(logged){
  if(logged){
    sessionStorage.setItem('lg_logged','1');
    adminPanel.style.display='block';
    loginBtn.textContent='Logout';
    loginBtn.onclick=()=>{ sessionStorage.removeItem('lg_logged'); loginBtn.textContent='Admin'; adminPanel.style.display='none'; }
  } else { adminPanel.style.display='none'; }
}

// auto-check session
if(isLoggedIn()) loginStateChanged(true); else adminPanel.style.display='none';

// ----------------- Properties -----------------
function escapeHtml(str=''){return String(str).replace(/[&<>"]/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[s]);}
function sanitize(url){return url?url.split(' ').join('%20'):'https://images.unsplash.com/photo-1560185127-6c1b9e2f0c44?auto=format&fit=crop&w=900&q=60';}
function formatPrice(v){return (v||v===0)?v.toLocaleString('en-US',{style:'currency',currency:'USD'}):'—';}

function renderProperties(){
  const grid=document.getElementById('propsGrid');
  if(!grid) return;
  grid.innerHTML='';
  const list=getProps();
  if(!list.length){grid.innerHTML='<div class="muted">No properties yet.</div>'; return;}
  list.forEach((p,idx)=>{
    const el=document.createElement('div');
    el.className='card';
    el.innerHTML=`
      <img src="${sanitize(p.image)}" alt="${escapeHtml(p.name)}">
      <div style="margin-top:10px">
        <div class="meta"><div class="name">${escapeHtml(p.name)}</div><div class="price">${formatPrice(p.price)}</div></div>
        <div class="muted" style="margin-top:6px">${escapeHtml(p.characteristics||'—')}</div>
        <div style="margin-top:8px;display:flex;justify-content:space-between;align-items:center">
          <div class="muted">Actual: <strong>${formatPrice(p.actualValue)}</strong></div>
          <button class="btn" onclick="openDetails(${idx})">View</button>
        </div>
      </div>
    `;
    grid.appendChild(el);
  });
}

function openDetails(idx){
  const p=getProps()[idx];
  showModal(`<h3>${escapeHtml(p.name)}</h3>
    <img src="${sanitize(p.image)}" style="width:100%;height:240px;object-fit:cover;border-radius:8px">
    <p class="muted">${escapeHtml(p.characteristics)}</p>
    <p><strong>Price:</strong> ${formatPrice(p.price)} &nbsp; <strong>Actual:</strong> ${formatPrice(p.actualValue)}</p>
    <div style="text-align:right;margin-top:10px">
    <button class="btn" onclick="closeModal()">Close</button>
    ${isLoggedIn()?`<button class="btn danger" onclick="deleteProp(${idx})">Delete</button>`:''}
    </div>`);
}

// ----------------- Admin actions -----------------
document.getElementById('openAdd')?.addEventListener('click',()=>{
  if(!isLoggedIn()){alert('Login first'); return;}
  showModal(`<h3>Add Property</h3>
    <label>Name</label><input id="propName" type="text" placeholder="3BR Apartment">
    <label>Image URL</label><input id="propImage" type="text">
    <label>Characteristics</label><input id="propChars" type="text" placeholder="3 beds, 2 baths">
    <div class="row"><div class="small"><label>Price</label><input id="propPrice" type="number"></div><div class="small"><label>Actual</label><input id="propActual" type="number"></div></div>
    <div style="text-align:right;margin-top:10px"><button class="btn" onclick="addProperty()">Add</button> <button class="btn danger" onclick="closeModal()">Cancel</button></div>`);
});

window.addProperty=()=>{
  const name=document.getElementById('propName').value.trim();
  const image=document.getElementById('propImage').value.trim();
  const characteristics=document.getElementById('propChars').value.trim();
  const price=Number(document.getElementById('propPrice').value||0);
  const actualValue=Number(document.getElementById('propActual').value||0);
  if(!name){alert('Name required'); return;}
  const list=getProps(); list.unshift({name,image,characteristics,price,actualValue,created:Date.now()});
  saveProps(list); closeModal(); renderProperties();
}

document.getElementById('openManage')?.addEventListener('click',()=>{
  if(!isLoggedIn()){alert('Login first'); return;}
  const list=getProps();
  let html='<h3>Manage Properties</h3>';
  if(!list.length) html+='<div class="muted">No properties</div>';
  html+='<div style="max-height:360px;overflow:auto;margin-top:10px">';
  list.forEach((p,idx)=>{
    html+=`<div style="display:flex;gap:8px;align-items:center;margin-bottom:8px">
      <img src="${sanitize(p.image)}" style="width:72px;height:56px;object-fit:cover;border-radius:8px">
      <div style="flex:1"><div style="font-weight:700">${escapeHtml(p.name)}</div><div class="muted">${escapeHtml(p.characteristics)}</div></div>
      <div><button class="btn danger" onclick="deleteProp(${idx})">Delete</button></div></div>`;
  });
  html+='</div><div style="text-align:right;margin-top:10px"><button class="btn" onclick="closeModal()">Close</button></div>';
  showModal(html);
});

window.deleteProp=(idx)=>{
  if(!isLoggedIn()){alert('Login first'); return;}
  if(!confirm('Delete this property?')) return;
  const list=getProps(); list.splice(idx,1); saveProps(list); closeModal(); renderProperties();
}

// ----------------- Feedback -----------------
document.getElementById('feedbackForm')?.addEventListener('submit',e=>{
  e.preventDefault();
  alert('Thanks for your feedback!');
  document.getElementById('fbname').value='';
  document.getElementById('fbmsg').value='';
});

// ----------------- Preload sample properties -----------------
(function seed(){
  if(!getProps().length){
    const sample=[
      {name:'Sunny 2BR Apartment',image:'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=900&q=60',characteristics:'2 beds, 1 bath, 85m², city center',price:120000,actualValue:115000},
      {name:'Modern Villa with Pool',image:'https://images.unsplash.com/photo-1600607684005-6f1a8bd79f98?auto=format&fit=crop&w=900&q=60',characteristics:'5 beds, 4 baths, 420m², private pool',price:550000,actualValue:530000},
      {name:'Cozy Mansion',image:'https://images.unsplash.com/photo-1505691723518-36a1fb0f3e5d?auto=format&fit=crop&w=900&q=60',characteristics:'8 beds, 6 baths, landscaped garden',price:1200000,actualValue:1185000}
    ];
    saveProps(sample);
  }
  renderProperties();
})();
