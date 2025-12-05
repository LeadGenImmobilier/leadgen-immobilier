// --- SUPABASE SETUP ---
const SUPABASE_URL = "https://drkjmtanzqmjgpltjqcg.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_N8SmY7U4KDsqCtuoMIQ2fA_D6rNjL4N";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- SELECTORS (same on all pages) ---
const loginBtn = document.getElementById("loginBtn");
const adminPanel = document.getElementById("adminPanel");
const modalWrap = document.getElementById("modalWrap");
const modalContent = document.getElementById("modalContent");

// --- SHOW LOGIN MODAL ---
if (loginBtn) {
  loginBtn.addEventListener("click", () => {
    showLoginModal();
  });
}

function showLoginModal() {
  modalContent.innerHTML = `
    <h3>Admin Login</h3>
    <input id="adminUser" type="text" placeholder="Username" />
    <input id="adminPass" type="password" placeholder="Password" />
    <button id="submitLogin" class="btn">Login</button>
  `;
  
  modalWrap.style.display = "flex";

  document.getElementById("submitLogin").addEventListener("click", loginAdmin);
}

// --- CLOSE MODAL WHEN CLICKING OUTSIDE ---
modalWrap.addEventListener("click", (e) => {
  if (e.target === modalWrap) {
    modalWrap.style.display = "none";
  }
});

// --- ADMIN LOGIN LOGIC ---
async function loginAdmin() {
  const user = document.getElementById("adminUser").value.trim();
  const pass = document.getElementById("adminPass").value.trim();

  if (!user || !pass) {
    alert("Enter username and password");
    return;
  }

  // Username and password are stored in Supabase table "admins"
  const { data, error } = await supabase
    .from("admins")
    .select("*")
    .eq("username", user)
    .eq("password", pass)
    .single();

  if (error || !data) {
    alert("Incorrect login");
    return;
  }

  // Save admin session in browser
  localStorage.setItem("admin", "logged_in");

  modalWrap.style.display = "none";
  showAdminPanel();
}

// --- SHOW ADMIN PANEL IF LOGGED IN ---
function showAdminPanel() {
  if (localStorage.getItem("admin") === "logged_in") {
    adminPanel.style.display = "block";
  }
}

// --- AUTO SHOW ADMIN PANEL ON PAGE LOAD ---
showAdminPanel();

