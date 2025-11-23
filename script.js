const form = document.getElementById('leadForm');
const successMessage = document.getElementById('successMessage');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;

    const data = { name, email, phone };

    // Your Google Script URL
    const url = "https://script.google.com/macros/s/AKfycbw_ikWlywp2O_OkPIWeWiYouuO5I_6Pe06p37dPamxvFGhAkDp17T5LPfu49WIWy5c/exec";

    await fetch(url, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    successMessage.style.display = 'block';
    form.reset();
});
