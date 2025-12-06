const SUPABASE_URL = "https://drkjmtanzqmjgpltjqcg.supabase.co";
const SUPABASE_KEY = "sb_publishable_N8SmY7U4KDsqCtuoMIQ2fA_D6rNjL4N";
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

async function loadProperties() {
    const list = document.getElementById("propertiesList");

    const { data, error } = await supabase.from("properties").select("*").order("created_at", { ascending: false });

    if (error) {
        list.innerHTML = "<p>Error loading properties.</p>";
        return;
    }

    list.innerHTML = data.map(p => `
        <div class="card">
            <img src="${p.image_url}" alt="">
            <div class="card-info">
                <h3>${p.title}</h3>
                <p>${p.description}</p>
                <p><strong>Price:</strong> ${p.price} MAD</p>
            </div>
        </div>
    `).join("");
}

loadProperties();
