document.addEventListener("DOMContentLoaded", () => {
    initializeAuth();
});

// Authentication handling
function initializeAuth() {
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
                authLink.textContent = "Logout";
                authLink.href = "/logout";
                userMessage.textContent = `Welcome, ${data.username}`;
            } else {
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
}