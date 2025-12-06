const SUPABASE_URL = "https://drkjmtanzqmjgpltjqcg.supabase.co";
const SUPABASE_KEY = "sb_publishable_N8SmY7U4KDsqCtuoMIQ2fA_D6rNjL4N";
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

document.getElementById("feedbackForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const message = document.getElementById("message").value;

    const { error } = await supabase.from("feedback").insert([{ name, message }]);

    const res = document.getElementById("result");

    if (error) {
        res.textContent = "Error sending feedback.";
        return;
    }

    res.textContent = "Thank you for your feedback!";
});
