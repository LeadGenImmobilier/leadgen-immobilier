// INIT SUPABASE
const SUPABASE_URL = "https://drkjmtanzqmjgpltjqcg.supabase.co";
const SUPABASE_KEY = "sb_publishable_N8SmY7U4KDsqCtuoMIQ2fA_D6rNjL4N";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);


// SHOW ADMIN POPUP
document.getElementById("adminBtn").onclick = () => {
    document.getElementById("adminPopup").style.display = "flex";
};

document.getElementById("closePopup").onclick = () => {
    document.getElementById("adminPopup").style.display = "none";
};


// ADMIN LOGIN
async function adminLogin() {
    const email = document.getElementById("adminEmail").value;
    const password = document.getElementById("adminPassword").value;

    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        alert("Login failed: " + error.message);
    } else {
        alert("Admin logged in!");
        window.location.href = "admin.html";
    }
}


// ADD PROPERTY
async function addProperty() {
    const title = document.getElementById("p_title").value;
    const description = document.getElementById("p_description").value;
    const price = document.getElementById("p_price").value;
    const value = document.getElementById("p_value").value;
    const characterestics = document.getElementById("p_characterestics").value;
    const image_url = document.getElementById("p_image_url").value;

    const { data, error } = await supabaseClient
        .from("properties")
        .insert([
            {
                title,
                description,
                price,
                value,
                characterestics,
                image_url,
                owner_id: "admin",
                created_at: new Date()
            }
        ]);

    if (error) alert(error.message);
    else alert("Property added successfully!");
}


// FETCH PROPERTIES
async function loadProperties() {
    const list = document.getElementById("propertiesList");
    if (!list) return;

    const { data, error } = await supabaseClient
        .from("properties")
        .select("*");

    if (error) {
        console.log("Fetch error:", error);
        return;
    }

    list.innerHTML = "";

    data.forEach(p => {
        list.innerHTML += `
            <div class="property-card">
                <img src="${p.image_url}">
                <h3>${p.title}</h3>
                <p>${p.description}</p>
                <p><b>Price:</b> ${p.price}</p>
                <p><b>Size:</b> ${p.value}</p>
                <p><b>Details:</b> ${p.characterestics}</p>
                <button onclick="deleteProperty(${p.id})">Delete</button>
            </div>
        `;
    });
}


// DELETE PROPERTY
async function deleteProperty(id) {
    const { error } = await supabaseClient
        .from("properties")
        .delete()
        .eq("id", id);

    if (error) alert("Delete failed: " + error.message);
    else {
        alert("Deleted!");
        loadProperties();
    }
}


// ON PAGE LOAD
window.onload = () => {
    if (document.getElementById("propertiesList")) {
        loadProperties();
    }
};
