// ----------------- Supabase Setup -----------------
const SUPABASE_URL = 'https://drkjmtanzqmjgpltjqcg.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_N8SmY7U4KDsqCtuoMIQ2fA_D6rNjL4N';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ----------------- DOM Elements -----------------
const loginBtn = document.getElementById('loginBtn');
const adminPanel = document.getElementById('adminPanel');
const modalWrap = document.getElementById('modalWrap');
const modalContent = document.getElementById('modalContent');
const openAddBtn = document.getElementById('openAdd');
const openManageBtn = document.getElementById('openManage');
let propsGrid = document.getElementById('propsGrid'); // optional if used

// ----------------- Helper Functions -----------------
function escapeHtml(str = '') {
  return String(str).replace(/[&<>"]/g, s => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;'
  }[s]));
}

function sanitize(url) {
  if (!url) return '';
  return url.split(' ').join('%20');
}

function formatPrice(v) {
  if (v === undefined || v === null) return '—';
  return typeof v === 'number'
    ? v.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
    : v;
}

// ----------------- Load Properties -----------------
async function loadProperties() {
  if (!propsGrid) return; // skip if no propsGrid on page
  try {
    const { data: properties, error } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) return console.error(error);

    propsGrid.innerHTML = '';
    if (properties.length === 0) {
      propsGrid.innerHTML = '<div class="muted">No properties yet.</div>';
    }

    properties.forEach(p => {
      propsGrid.innerHTML += `
        <div class="card">
          <img src="${sanitize(p.image_url)}" alt="${escapeHtml(p.title)}">
          <h3>${escapeHtml(p.title)}</h3>
          <p>${escapeHtml(p.characterestics)}</p>
          <p>Price: ${formatPrice(p.price)}</p>
          <p>Value: ${formatPrice(p.value)}</p>
        </div>
      `;
    });
  } catch (e) {
    console.error(e);
  }
}

// ----------------- Admin Login -----------------
loginBtn.addEventListener('click', async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    await supabase.auth.signOut();
    loginBtn.textContent = 'Admin';
    adminPanel.style.display = 'none';
    alert('Logged out');
    return;
  }

  // Show modal
  modalContent.innerHTML = `
    <h3>Admin Login</h3>
    <label>Email</label>
    <input id="adminEmailModal" type="email" placeholder="Email">
    <label>Password</label>
    <input id="adminPasswordModal" type="password" placeholder="Password">
    <div style="margin-top:10px; text-align:right">
      <button class="btn" id="loginSubmitBtn">Login</button>
    </div>
  `;
  modalWrap.style.display = 'flex';

  document.getElementById('loginSubmitBtn').onclick = adminLoginModal;
});

async function adminLoginModal() {
  const email = document.getElementById('adminEmailModal').value;
  const password = document.getElementById('adminPasswordModal').value;
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    alert('Login failed: ' + error.message);
    return;
  }

  alert('Logged in!');
  modalWrap.style.display = 'none';
  loginBtn.textContent = 'Logout';
  adminPanel.style.display = 'block';
  loadProperties();
}

// Close modal when clicking backdrop
modalWrap.addEventListener('click', e => {
  if (e.target === modalWrap) modalWrap.style.display = 'none';
});

// ----------------- Admin Buttons (placeholders) -----------------
if (openAddBtn) {
  openAddBtn.addEventListener('click', () => {
    alert('Add property functionality will be implemented here.');
  });
}

if (openManageBtn) {
  openManageBtn.addEventListener('click', () => {
    alert('Manage properties functionality will be implemented here.');
  });
}

// ----------------- Load properties on page load -----------------
document.addEventListener('DOMContentLoaded', loadProperties);
