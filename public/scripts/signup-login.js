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