// ----------------- Public Supabase reader (no admin on site) -----------------

// Replace these with your project's values (already provided)
const SUPABASE_URL = 'https://drkjmtanzqmjgpltjqcg.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_N8SmY7U4KDsqCtuoMIQ2fA_D6rNjL4N';

export const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Create a client (use a different variable name to avoid clobbering the global)
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM elements expected in your pages
const propsGrid = document.getElementById('propsGrid');       // properties grid container
const teamGrid = document.getElementById('teamGrid');         // team members grid container
const contactInfoEl = document.getElementById('contactInfo'); // contact info card container
const adminPanel = document.getElementById('adminPanel');     // will be hidden (no admin on site)
const modalWrap = document.getElementById('modalWrap');       // optional modal if used on page
const modalContent = document.getElementById('modalContent'); // optional modal content

// Small helpers
function safeText(s = '') { return String(s ?? '').trim(); }
function sanitizeUrl(u){ if(!u) return ''; return u.split(' ').join('%20'); }
function formatCurrency(v){ if(v === null || v === undefined || v === '') return '—'; return Number(v).toLocaleString('en-US', { style:'currency', currency:'USD' }); }

// Optional modal helpers (used only if you want small previews)
function showModal(html){
  if(!modalWrap || !modalContent) return;
  modalContent.innerHTML = html;
  modalWrap.style.display = 'flex';
}
function closeModal(){
  if(!modalWrap || !modalContent) return;
  modalWrap.style.display = 'none';
  modalContent.innerHTML = '';
}
if(modalWrap) modalWrap.addEventListener('click', (e)=>{ if(e.target === modalWrap) closeModal(); });

// Hide admin panel on public site
if(adminPanel) adminPanel.style.display = 'none';

// ----------------- Load Properties -----------------
async function loadProperties(){
  if(!propsGrid) return;
  try{
    const { data: properties, error } = await supabaseClient
      .from('properties')
      .select('id, title, description, price, value, characteristics, image_url, created_at')
      .order('created_at', { ascending: false });

    if(error){ console.error('loadProperties error:', error); propsGrid.innerHTML = '<div class="muted">Failed to load properties.</div>'; return; }
    propsGrid.innerHTML = '';

    if(!properties || properties.length === 0){
      propsGrid.innerHTML = '<div class="muted">No properties available.</div>';
      return;
    }

    properties.forEach(p=>{
      const img = sanitizeUrl(p.image_url) || 'https://images.unsplash.com/photo-1560185127-6c1b9e2f0c44?auto=format&fit=crop&w=900&q=60';
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <img src="${img}" alt="${safeText(p.title)}">
        <div style="margin-top:10px">
          <div class="meta">
            <div class="name">${safeText(p.title)}</div>
            <div class="price">${formatCurrency(p.price)}</div>
          </div>
          <div class="muted" style="margin-top:6px">${safeText(p.characteristics)}</div>
          ${p.description ? `<p style="margin-top:8px">${safeText(p.description)}</p>` : ''}
          <div style="margin-top:8px;display:flex;justify-content:space-between;align-items:center">
            <div class="muted">Value: <strong>${formatCurrency(p.value)}</strong></div>
            <button class="btn" onclick="showPropertyDetails(${p.id})">View</button>
          </div>
        </div>
      `;
      propsGrid.appendChild(card);
    });

  }catch(err){
    console.error('Unexpected error loading properties:', err);
    propsGrid.innerHTML = '<div class="muted">Unexpected error loading properties.</div>';
  }
}

// small handler to show property details in modal (optional)
window.showPropertyDetails = async function(propId){
  try{
    const { data, error } = await supabaseClient.from('properties').select('*').eq('id', propId).single();
    if(error) { console.error(error); return; }
    const p = data;
    const img = sanitizeUrl(p.image_url) || '';
    showModal(`
      <h3 style="margin-top:0">${safeText(p.title)}</h3>
      ${img ? `<img src="${img}" style="width:100%;height:240px;object-fit:cover;border-radius:8px">` : ''}
      <p class="muted">${safeText(p.characteristics)}</p>
      ${p.description ? `<p>${safeText(p.description)}</p>` : ''}
      <p><strong>Price:</strong> ${formatCurrency(p.price)} &nbsp; <strong>Value:</strong> ${formatCurrency(p.value)}</p>
      <div style="text-align:right;margin-top:10px"><button class="btn" onclick="closeModal()">Close</button></div>
    `);
  }catch(e){
    console.error('showPropertyDetails', e);
  }
};

// ----------------- Load Team Members -----------------
async function loadTeamMembers(){
  if(!teamGrid) return;
  try{
    const { data: members, error } = await supabaseClient.from('team_members').select('id, name, role, image_url');
    if(error){ console.error('loadTeamMembers error:', error); teamGrid.innerHTML = '<div class="muted">Failed to load team.</div>'; return; }
    teamGrid.innerHTML = '';

    if(!members || members.length === 0){ teamGrid.innerHTML = '<div class="muted">No team members listed.</div>'; return; }

    members.forEach(m=>{
      const img = sanitizeUrl(m.image_url) || 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=crop&w=900&q=60';
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <img src="${img}" alt="${safeText(m.name)}">
        <div style="margin-top:10px">
          <div class="name">${safeText(m.name)}</div>
          <div class="muted">${safeText(m.role)}</div>
        </div>
      `;
      teamGrid.appendChild(card);
    });
  }catch(err){
    console.error('Unexpected error loading team members:', err);
    teamGrid.innerHTML = '<div class="muted">Unexpected error loading team members.</div>';
  }
}

// ----------------- Load Contact Info -----------------
// contact_info schema: id uuid, type text, label text, value text
async function loadContactInfo(){
  if(!contactInfoEl && !contactInfo) return; // support both id names contactInfo or contact_info
  const targetEl = contactInfoEl || document.getElementById('contact'); // fallback
  if(!targetEl) return;

  try{
    const { data, error } = await supabaseClient.from('contact_info').select('id, type, label, value');
    if(error){ console.error('loadContactInfo error:', error); targetEl.innerHTML = '<div class="muted">Failed to load contact info.</div>'; return; }
    // data might be multiple rows: we'll map by type
    const map = {};
    (data || []).forEach(row=>{
      map[row.type] = row.value;
    });

    // Common keys: phone, whatsapp, email (adjust according to your rows)
    const phone = map.phone || map.Phone || map['direct'] || map['phone'] || '';
    const whatsapp = map.whatsapp || map['WhatsApp'] || '';
    const email = map.email || map.Email || '';

    // Render similar to your previous card layout
    targetEl.innerHTML = `
      <div style="display:flex;gap:16px;flex-wrap:wrap;margin-top:12px">
        <div class="card" style="flex:1;min-width:260px">
          <h3 style="margin:0 0 8px">Direct</h3>
          ${phone ? `<div class="muted">Phone: <a href="tel:${phone}">${phone}</a></div>` : ''}
          ${whatsapp ? `<div class="muted">WhatsApp: <a href="https://wa.me/${whatsapp}" target="_blank">Chat on WhatsApp</a></div>` : ''}
          ${email ? `<div class="muted">Email: <a href="mailto:${email}">${email}</a></div>` : ''}
        </div>
      </div>
    `;
  }catch(err){
    console.error('Unexpected error loading contact info:', err);
    targetEl.innerHTML = '<div class="muted">Unexpected error loading contact info.</div>';
  }
}

// ----------------- Feedback form (optional) -----------------
const feedbackForm = document.getElementById('feedbackForm');
if(feedbackForm){
  feedbackForm.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const name = document.getElementById('fbname')?.value || '';
    const message = document.getElementById('fbmsg')?.value || '';
    if(!name || !message){
      alert('Please fill both fields.');
      return;
    }
    try{
      const { error } = await supabaseClient.from('feedback').insert([{ name, message }]);
      if(error){
        console.error('Feedback insert error:', error);
        alert('Could not send feedback (check feedback table).');
      } else {
        alert('Thanks for your feedback!');
        if(document.getElementById('fbname')) document.getElementById('fbname').value = '';
        if(document.getElementById('fbmsg')) document.getElementById('fbmsg').value = '';
      }
    }catch(err){
      console.error('Unexpected feedback error:', err);
      alert('Unexpected error sending feedback.');
    }
  });
}

// ----------------- Initialize on DOM ready -----------------
document.addEventListener('DOMContentLoaded', async ()=>{
  // Basic connectivity check (optional)
  try{
    // simple ping: request a small query to ensure keys are working
    const { error: pingErr } = await supabaseClient.from('properties').select('id').limit(1);
    if(pingErr) console.warn('Supabase ping returned an error (check keys & RLS):', pingErr.message);
  }catch(e){
    console.warn('Supabase ping failed (this may be expected if offline):', e);
  }

  // load everything
  loadProperties();
  loadTeamMembers();
  loadContactInfo();
});
