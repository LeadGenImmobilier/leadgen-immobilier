// Initialize Supabase
const supabaseClient = supabase.createClient(
  "https://drkjmtanzqmjgpltjqcg.supabase.co",
  "YOUR_ANON_KEY_HERE"
);

// Get ID from URL
const urlParams = new URLSearchParams(window.location.search);
const propertyId = urlParams.get("id");

const container = document.getElementById("detailsContainer");

async function loadProperty() {
  if (!propertyId) {
    container.innerHTML = "<p>Property ID missing.</p>";
    return;
  }

  const { data, error } = await supabaseClient
    .from("properties")
    .select("*")
    .eq("id", propertyId)
    .single();

  if (error) {
    container.innerHTML = "<p>Error loading property.</p>";
    return;
  }

  container.innerHTML = `
    <div class="details-page">
      <img class="main-image" src="${data.image_url}" alt="">

      <h2>${data.title}</h2>
      <p><strong>Price:</strong> ${data.price} MAD</p>
      <p>${data.description}</p>

      <h3>Gallery</h3>
      <div class="gallery">
        ${(data.gallery || []).map(img => `
          <img src="${img}" class="gallery-img">
        `).join('')}
      </div>
    </div>
  `;
}

loadProperty();
