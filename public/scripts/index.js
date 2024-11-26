    // ---------------------------------------------------------------- INDEX -----------------------------------------------------------------

// Ensure the script runs correctly when included in the HTML
document.addEventListener("DOMContentLoaded", () => {
    // Select DOM elements
    const authLink = document.getElementById("auth-link");
    const userMessage = document.getElementById("user-message");

    // Fetch session status from the server
    fetch("/api/session")
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then((data) => {
            if (data.loggedIn) {
                // Update the page for a logged-in user
                authLink.textContent = "Logout";
                authLink.href = "/logout";
                userMessage.textContent = `Welcome, ${data.username}`;
            } else {
                // Update the page for a logged-out user
                authLink.textContent = "Login";
                authLink.href = "/login";
                userMessage.textContent = "You are not logged in.";
            }
        })
        .catch((err) => {
            console.error("Session check failed:", err);
            userMessage.textContent = "Error checking session.";
            authLink.textContent = "Login";
            authLink.href = "/login";
        });
});