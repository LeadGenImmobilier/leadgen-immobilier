// Init Supabase
const supabaseClient = supabase.createClient(
    "https://drkjmtanzqmjgpltjqcg.supabase.co",
    "sb_publishable_N8SmY7U4KDsqCtuoMIQ2fA_D6rNjL4N"
);

// Extract ID from URL
const urlParams = new URLSearchParams(window.location.search);
const propertyId = urlParams.get("id");

async function loadProperty() {
    const { data, error } = await supabaseClient
        .from("properties")
        .select("*")
        .eq("id", propertyId)
        .single();

    if (error || !data) {
        document.body.innerHTML = "<h2>Error loading property.</h2>";
        return;
    }

    // Fill page
    document.getElementById("mainImage").src = data.image_url;
    document.getElementById("title").textContent = data.title;
    document.getElementById("price").textContent = `${data.price} MAD`;
    document.getElementById("description").textContent = data.description;

    // Create gallery
    const gallery = document.getElementById("gallery");
    if (data.gallery && data.gallery.length > 0) {
        gallery.innerHTML = data.gallery
            .map(img => `<img src="${img}" class="gallery-item">`)
            .join("");
    }

    // WhatsApp + Call
    const phone = data.phone || "+212600000000";
    document.getElementById("whatsappBtn").href = `https://wa.me/${phone}`;
    document.getElementById("callBtn").href = `tel:${phone}`;
}

loadProperty();
