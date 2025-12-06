const SUPABASE_URL = "https://drkjmtanzqmjgpltjqcg.supabase.co";
const SUPABASE_KEY = "sb_publishable_N8SmY7U4KDsqCtuoMIQ2fA_D6rNjL4N";
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

async function loadContact() {
    const container = document.getElementById("contactList");

    const { data, error } = await supabase.from("contact_info").select("*");

    if (error) {
        container.innerHTML = "<p>Error loading contact info.</p>";
        return;
    }

    container.innerHTML = data.map(c => `
        <div class="card">
            <div class="card-info">
                <h3>${c.label}</h3>
                <p>${c.value}</p>
            </div>
        </div>
    `).join("");
}

loadContact();
