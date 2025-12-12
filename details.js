// Initialize Supabase
const supabaseClient = window.supabase.createClient(
  "YOUR_SUPABASE_URL",
  "YOUR_SUPABASE_ANON_KEY"
);

// Read ID from the URL
const params = new URLSearchParams(window.location.search);
const id = params.get("id");

async function loadProperty() {
  const section = document.getElementById("detailsSection");

  const { data, error } = await supabaseClient
    .from("properties")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    section.innerHTML = "<h2>Property not found.</h2>";
    return;
  }

  section.innerHTML = `
    <h2>${data.title}</h2>

    <img src="${data.image_url}" class="hero-img">

    <p><strong>Description:</strong> ${data.description}</p>
    <p><strong>Price:</strong> ${data.price} MAD</p>
    <p><strong>Location:</strong> ${data.location}</p>

    <hr>

    <h3>More Photos</h3>

    <div class="gallery">
      ${data.images?.map(img => `<img src="${img}" class="gallery-img">`).join("") || "No photos"}
    </div>
  `;
}

loadProperty();
