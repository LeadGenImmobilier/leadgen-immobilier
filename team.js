const SUPABASE_URL = "https://drkjmtanzqmjgpltjqcg.supabase.co";
const SUPABASE_KEY = "sb_publishable_N8SmY7U4KDsqCtuoMIQ2fA_D6rNjL4N";
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

async function loadTeam() {
    const list = document.getElementById("teamList");

    const { data, error } = await supabase.from("team_members").select("*");

    if (error) {
        list.innerHTML = "<p>Error loading team.</p>";
        return;
    }

    list.innerHTML = data.map(t => `
        <div class="card">
            <img src="${t.image_url}" alt="">
            <div class="card-info">
                <h3>${t.name}</h3>
                <p>${t.role}</p>
            </div>
        </div>
    `).join("");
}

loadTeam();
