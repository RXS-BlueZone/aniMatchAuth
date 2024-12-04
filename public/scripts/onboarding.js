document.addEventListener("DOMContentLoaded", () => {
    // ---------------------------------------------------------------- ONBOARDING -----------------------------------------------------------------

    const genreList = []; // Stores selected genres

    // Onboarding completion check
    function checkOnboardingCompletion() {
        const currentPath = window.location.pathname;

        // Skip redirection if the user is already on the onboarding page
        if (currentPath === "/onboarding") {
            fetchGenres(); // Fetch genres to display for user
            updateButtonState(); // Initialize button state
            return;
        }

        fetch("/api/session") // Backend endpoint to check session and onboarding status
            .then((response) => response.json())
            .then((data) => {
                if (data.loggedIn && data.genresCompleted) {
                    // Redirect to the homepage if onboarding is already complete
                    window.location.href = "/index";
                } else {
                    // Allow user to continue with onboarding
                    fetchGenres();
                    updateButtonState();
                }
            })
            .catch((err) => {
                console.error("Error checking onboarding status:", err);
                alert("An error occurred while checking your session. Please try again.");
            });
    }

    // Update the button state based on the number of selected genres
    function updateButtonState() {
        const doneButton = document.getElementById("done");
        if (genreList.length < 3) {
            doneButton.classList.add("disabled");
            doneButton.disabled = true;
        } else {
            doneButton.classList.remove("disabled");
            doneButton.disabled = false;
        }
    }

    // Fetch genres from AniList API
    function fetchGenres() {
        $.ajax({
            url: "https://graphql.anilist.co",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({
                query: `
                    query {
                        GenreCollection
                    }
                `,
            }),
            success: function (result) {
                const genres = result.data.GenreCollection;
                const container = document.getElementById("genre-list");
                container.innerHTML = ""; // Clear the genre list container
                genres.forEach((genre) => {
                    const genreCard = document.createElement("div");
                    genreCard.className = "genre-card";
                    genreCard.innerText = genre;

                    // Toggle selection on click
                    genreCard.onclick = function () {
                        genreCard.classList.toggle("selected");
                        if (genreList.includes(genre)) {
                            genreList.splice(genreList.indexOf(genre), 1);
                        } else {
                            genreList.push(genre);
                        }
                        updateButtonState();
                    };

                    container.appendChild(genreCard);
                });
            },
            error: function (error) {
                console.error("Error fetching genres:", error);
            },
        });
    }

    // Handle the "Done" button click
    document.getElementById("done").onclick = function () {
        if (genreList.length >= 3) {
            // Save the selected genres via the backend
            $.ajax({
                url: "/api/save-genres", // Backend endpoint for saving genres
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify({ genres: genreList }),
                success: function () {
                    // Redirect to recommendations page after successfully saving genres
                    const referrer = document.referrer;
                    if (referrer.includes("/recommendations")) {
                        window.location.href = "/recommendations";
                    } else {
                        window.location.href = "/index";
                    }
                },
                error: function (error) {
                    console.error("Error saving genres:", error);
                    alert("Failed to save genres. Please try again.");
                },
            });
        } else {
            alert("Please select at least three genres.");
        }
    };

    // Run onboarding completion check on page load
    checkOnboardingCompletion();
});
