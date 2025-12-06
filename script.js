// ----------------- Public Supabase reader (NO ADMIN on site) -----------------

/*
  IMPORTANT:
  - Supabase CDN MUST be loaded BEFORE this file
  - This script assumes <script src="script.js" defer></script>
*/

// ✅ Supabase project credentials
const SUPABASE_URL = "https://drkjmtanzqmjgpltjqcg.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_N8SmY7U4KDsqCtuoMIQ2fA_D6rNjL4N";

// ✅ Create client safely and globally
window.supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

// ----------------- DOM elements (optional per page) -----------------
const propsGrid = document.getElementById("propsGrid");
const teamGrid = document.getElementById("teamGrid");
const contactInfoEl = document.getElementById("contactInfo");
const adminPanel = document.getElementById("adminPanel");
const modalWrap = document.getElementById("modalWrap");
const modalContent = document.getElementById("modalContent");

// ----------------- Small helpers -----------------
const safeText = (s = "") => String(s ?? "").trim();
const sanitizeUrl = (u) => u ? u.replace(/ /g, "%20") : "";
const formatCurrency = (v) =>
  v === null || v === undefined || v === ""
    ? "—"
    : Number(v).toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
      });

// ----------------- Modal helpers -----------------
function showModal(html) {
  if (!modalWrap || !modalContent) return;
  modalContent.innerHTML = html;
  modalWrap.style.display = "flex";
}

function closeModal() {
  if (!modalWrap || !modalContent) return;
  modalWrap.style.display = "none";
  modalContent.innerHTML = "";
}

if (modalWrap) {
  modalWrap.addEventListener("click", (e) => {
    if (e.target === modalWrap) closeModal();
  });
}

// ----------------- Hide admin panel (public site) -----------------
if (adminPanel) adminPanel.style.display = "none";

// ----------------- Load Properties -----------------
async function loadProperties() {
  if (!propsGrid) return;

  try {
    const { data, error } = await window.supabaseClient
      .from("properties")
      .select("id, title, description, price, value, characteristics, image_url, created_at")
      .order("created_at", { ascending: false });

    if (error) throw error;

    if (!data || data.length === 0) {
      propsGrid.innerHTML = `<div class="muted">No properties available.</div>`;
      return;
    }

    propsGrid.innerHTML = "";

    data.forEach((p) => {
      const img =
        sanitizeUrl(p.image_url) ||
        "https://images.unsplash.com/photo-1560185127-6c1b9e2f0c44?auto=format&fit=crop&w=900&q=60";

      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <img src="${img}" alt="${safeText(p.title)}">
        <div style="margin-top:10px">
          <div class="meta">
            <div class="name">${safeText(p.title)}</div>
            <div class="price">${formatCurrency(p.price)}</div>
          </div>
          <div class="muted" style="margin-top:6px">${safeText(p.characteristics)}</div>
          ${p.description ? `<p style="margin-top:8px">${safeText(p.description)}</p>` : ""}
          <div style="margin-top:8px;text-align:right">
            <button class="btn" onclick="showPropertyDetails('${p.id}')">View</button>
          </div>
        </div>
      `;
      propsGrid.appendChild(card);
    });
  } catch (err) {
    console.error("loadProperties error:", err);
    propsGrid.innerHTML = `<div class="muted">Failed to load properties.</div>`;
  }
}

// ----------------- Property modal -----------------
window.showPropertyDetails = async (id) => {
  try {
    const { data, error } = await window.supabaseClient
      .from("properties")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    const img = sanitizeUrl(data.image_url || "");

    showModal(`
      <h3>${safeText(data.title)}</h3>
      ${img ? `<img src="${img}" style="width:100%;height:240px;object-fit:cover;border-radius:8px">` : ""}
      <p class="muted">${safeText(data.characteristics)}</p>
      <p>${safeText(data.description)}</p>
      <p><strong>Price:</strong> ${formatCurrency(data.price)}</p>
      <div style="text-align:right;margin-top:10px">
        <button class="btn" onclick="closeModal()">Close</button>
      </div>
    `);
  } catch (e) {
    console.error("showPropertyDetails error:", e);
  }
};

// ----------------- Load Team Members -----------------
async function loadTeamMembers() {
  if (!teamGrid) return;

  try {
    const { data, error } = await window.supabaseClient
      .from("team_members")
      .select("name, role, image_url");

    if (error) throw error;

    if (!data || data.length === 0) {
      teamGrid.innerHTML = `<div class="muted">No team members listed.</div>`;
      return;
    }

    teamGrid.innerHTML = "";

    data.forEach((m) => {
      const img =
        sanitizeUrl(m.image_url) ||
        "https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=crop&w=900&q=60";

      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <img src="${img}">
        <div style="margin-top:10px">
          <div class="name">${safeText(m.name)}</div>
          <div class="muted">${safeText(m.role)}</div>
        </div>
      `;
      teamGrid.appendChild(card);
    });
  } catch (err) {
    console.error("loadTeamMembers error:", err);
  }
}

// ----------------- Load Contact Info -----------------
async function loadContactInfo() {
  if (!contactInfoEl) return;

  try {
    const { data, error } = await window.supabaseClient
      .from("contact_info")
      .select("type, label, value");

    if (error) throw error;

    contactInfoEl.innerHTML = data
      .map(
        (c) => `
      <div class="card">
        <div class="card-info">
          <h3>${safeText(c.label)}</h3>
          <p>${safeText(c.value)}</p>
        </div>
      </div>
    `
      )
      .join("");
  } catch (err) {
    console.error("loadContactInfo error:", err);
  }
}

// ----------------- Feedback form -----------------
const feedbackForm = document.getElementById("feedbackForm");
if (feedbackForm) {
  feedbackForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("fbname")?.value.trim();
    const message = document.getElementById("fbmsg")?.value.trim();

    if (!name || !message) {
      alert("Please fill both fields.");
      return;
    }

    const { error } = await window.supabaseClient
      .from("feedback")
      .insert([{ name, message }]);

    if (error) {
      console.error("Feedback error:", error);
      alert("Error sending feedback.");
      return;
    }

    alert("Thank you for your feedback!");
    feedbackForm.reset();
  });
}

// ----------------- Init -----------------
document.addEventListener("DOMContentLoaded", () => {
  loadProperties();
  loadTeamMembers();
  loadContactInfo();
  console.log("✅ Supabase ready");
});
