const form = document.getElementById('leadForm');
const successMessage = document.getElementById('successMessage');

form.addEventListener('submit', function(e) {
    e.preventDefault();

    // Simulate form submission
    successMessage.style.display = 'block';
    form.reset();
});
