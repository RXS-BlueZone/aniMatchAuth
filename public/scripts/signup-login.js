// signup-login.js
document.addEventListener("DOMContentLoaded", () => {


// ---------------------------------------------------------------- SIGNUP -----------------------------------------------------------------
document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("form");

    form.addEventListener("submit", async function (e) {
        e.preventDefault(); // Prevent the default form submission

        // Get form data
        const user_username = document.getElementById("user_username").value;
        const user_email = document.getElementById("user_email").value;
        const user_password = document.getElementById("user_password").value;

        // Create a JSON object from the form data
        const formData = {
            user_username,
            user_email,
            user_password
        };

        // Send the data via AJAX (fetch API)
        try {
            const response = await fetch("http://localhost:3000/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                // Show success alert
                alert("Signup successful! Redirecting to login...");
                // Navigate to the login page
                window.location.href = "/login";
            } else {
                // Show error alert
                const errorText = await response.text();
                alert(errorText);
            }
        } catch (error) {
            console.error("Error:", error);
            alert("There was an error submitting the form.");
        }
    });
});


const animeImage = document.getElementById('anime-img');

const imageSources = ['styles/assets/k1.png', 'styles/assets/k2.png']; 

let currentImageIndex = 0;

animeImage.addEventListener('click', () => {
    currentImageIndex = (currentImageIndex + 1) % imageSources.length;

    animeImage.src = imageSources[currentImageIndex];
});

// Sign uP Error Message
const signupForm = document.getElementById('signupForm');

signupForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent form from submitting traditionally
    console.log("Signup form submitted!"); // Debugging

    // Clear previous error messages
    document.querySelectorAll('.error-message').forEach(el => {
        el.textContent = '';
        el.style.display = 'none';
    });

    const formData = new FormData(signupForm);
    const payload = Object.fromEntries(formData.entries());

    try {
        const response = await fetch(signupForm.action, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        const result = await response.json();
        console.log(result); // Debugging: Check server response

        if (response.ok) {
            if (result.redirect) {
                window.location.href = result.redirect; // Redirect on success
            }
        } else {
            // Display specific error messages under the corresponding fields
            if (result.field === 'username') {
                const usernameError = document.getElementById('usernameError');
                usernameError.textContent = result.error;
                usernameError.style.display = 'block';
            } else if (result.field === 'email') {
                const emailError = document.getElementById('emailError');
                emailError.textContent = result.error;
                emailError.style.display = 'block';
            } else if (result.field === 'password') {
                const passwordError = document.getElementById('passwordError');
                passwordError.textContent = result.error;
                passwordError.style.display = 'block';
            } else if (result.field === 'terms') {
                const termsError = document.getElementById('termsError');
                termsError.textContent = result.error;
                termsError.style.display = 'block';
            } else {
                alert('An unexpected error occurred. Please try again.');
            }
        }
    } catch (err) {
        console.error('Error during signup:', err);
        alert('An unexpected error occurred. Please try again later.');
    }
});










// ---------------------------------------------------------------- LOGIN -----------------------------------------------------------------
document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("form");

    form.addEventListener("submit", async function (e) {
        e.preventDefault(); // Prevent the default form submission

        // Get form data
        const user_email = document.getElementById("user_email").value;
        const user_password = document.getElementById("user_password").value;

        const formData = { user_email, user_password };

        // Send login data via AJAX (fetch API)
        try {
            const response = await fetch("http://localhost:3000/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                // If login is successful, redirect to /index
                window.location.href = "/index";
            } else {
                // Handle login errors
                const errorText = await response.text();
                alert(errorText); // Display the error message
            }
        } catch (error) {
            console.error("Error:", error);
            alert("There was an error logging in.");
        }
    });
});


    document.addEventListener("DOMContentLoaded", () => {
        fetch("/api/session")
            .then((response) => response.json())
            .then((data) => {
                if (data.loggedIn) {
                    // Redirect to the homepage if already logged in
                    window.location.href = "/index";
                }
            })
            .catch((err) => console.error("Session check failed:", err));
    });




});


//------------------------------------------------------ERRORS----------------------------------------------------

// Login Error Message
const loginForm = document.getElementById('loginForm');
const errorMessage = document.getElementById('errorMessage');

loginForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent default form submission

    const formData = new FormData(loginForm);
    const payload = Object.fromEntries(formData.entries());

    try {
        const response = await fetch(loginForm.action, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (response.ok) {
            if (result.redirect) {
                window.location.href = result.redirect; // Redirect if needed
            }
        } else {
            errorMessage.textContent = result.error;
            errorMessage.style.display = 'block';
        }
    } catch (err) {
        errorMessage.textContent = 'An unexpected error occurred.';
        errorMessage.style.display = 'block';
    }
});




