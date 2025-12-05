const SUPABASE_URL = 'https://drkjmtanzqmjgpltjqcg.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_N8SmY7U4KDsqCtuoMIQ2fA_D6rNjL4N';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const loginBtn = document.getElementById('loginBtn');
const adminPanel = document.getElementById('adminPanel');
const modalWrap = document.getElementById('modalWrap');
const modalContent = document.getElementById('modalContent');
const propsGrid = document.getElementById('propsGrid');

function escapeHtml(str=''){return String(str).replace(/[&<>"]/g, s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[s]))}
function sanitize(url){ return url ? url.split(' ').join('%20') : ''; }
function formatPrice(v){ return (v || v===0) ? (typeof v==='number'?v.toLocaleString('en-US',{style:'currency',currency:'USD'}):v) : '—'; }

async function loadProperties(){
  try{
    const { data: properties, error } = await supabase.from('properties').select('*').order('created_at',{ascending:false});
    if(error) return console.error(error);
    propsGrid.innerHTML='';
    if(properties.length===0) propsGrid.innerHTML='<div class="muted">No properties yet.</div>';
    properties.forEach(p=>{
      propsGrid.innerHTML+=`
        <div class="card">
          <img src="${sanitize(p.image_url)}" alt="${escapeHtml(p.title)}">
          <h3>${escapeHtml(p.title)}</h3>
          <p>${escapeHtml(p.characteristics)}</p>
          <p>Price: ${formatPrice(p.price)}</p>
          <p>Value: ${formatPrice(p.value)}</p>
        </div>
      `;
    });
  }catch(e){ console.error(e); }
}

document.addEventListener('DOMContentLoaded', loadProperties);

loginBtn.addEventListener('click', async ()=>{
  const session = await supabase.auth.getSession();
  if(session.data?.session){
    await supabase.auth.signOut();
    loginBtn.textContent='Admin';
    adminPanel.style.display='none';
    alert('Logged out');
    return;
  }
  modalContent.innerHTML=`
    <h3>Admin login</h3>
    <label>Email</label><input id="adminEmailModal" type="email" placeholder="Email">
    <label>Password</label><input id="adminPasswordModal" type="password" placeholder="Password">
    <div style="margin-top:10px;text-align:right"><button class="btn" onclick="adminLoginModal()">Login</button></div>
  `;
  modalWrap.style.display='flex';
});

async function adminLoginModal(){
  const email = document.getElementById('adminEmailModal').value;
  const password = document.getElementById('adminPasswordModal').value;
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if(error) return alert('Login failed: '+error.message);
  alert('Logged in!');
  modalWrap.style.display='none';
  loginBtn.textContent='Logout';
  adminPanel.style.display='block';
  loadProperties();
}

modalWrap.addEventListener('click', e=>{ if(e.target===modalWrap) modalWrap.style.display='none'; });
function scrollToSection(id){ document.getElementById(id).scrollIntoView({behavior:'smooth'}); }
