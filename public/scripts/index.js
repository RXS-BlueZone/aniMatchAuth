// ---------------------------------------------------------------- INDEX -----------------------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {
    initializeAuth();
    fetchAnimeDataBatch();
});

// Global variables
const floatingTextList = [];
const CACHE_TTL = 600000; // Cache Time-to-Live in milliseconds (10 minutes)
const CACHE_KEYS = {
    trending: "cacheTrendingAnimes",
    newReleases: "cacheNewReleases",
    topRated: "cacheTopRatedMovies",
};

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

// Fetch anime data in a single batch request
function fetchAnimeDataBatch() {
    const cachedTrending = checkCache(CACHE_KEYS.trending);
    const cachedNewReleases = checkCache(CACHE_KEYS.newReleases);
    const cachedTopRated = checkCache(CACHE_KEYS.topRated);

    if (cachedTrending && cachedNewReleases && cachedTopRated) {
        displayAnimeData(cachedTrending, "anime-list");
        displayAnimeData(cachedNewReleases, "new-releases-list");
        displayAnimeData(cachedTopRated, "top-rated-movies");
        initializeCarousel(); // Reinitialize carousel even with cached data
        return;
    }

    const query = `
        query {
            trending: Page(page: 1, perPage: 10) {
                media(sort: TRENDING_DESC, type: ANIME) {
                    id
                    title {
                        romaji
                        english
                        native
                    }
                    averageScore
                    coverImage {
                        extraLarge
                    }
                }
            }
            newReleases: Page(page: 1, perPage: 10) {
                media(sort: START_DATE_DESC, type: ANIME) {
                    id
                    title {
                        romaji
                        english
                        native
                    }
                    averageScore
                    coverImage {
                        extraLarge
                    }
                }
            }
            topRated: Page(page: 1, perPage: 15) {
                media(sort: SCORE_DESC, format: MOVIE, type: ANIME) {
                    id
                    title {
                        romaji
                        english
                        native
                    }
                    averageScore
                    coverImage {
                        extraLarge
                    }
                }
            }
        }
    `;

    fetch("https://graphql.anilist.co", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
    })
        .then((response) => response.json())
        .then((data) => {
            saveCache(CACHE_KEYS.trending, data.data.trending.media);
            saveCache(CACHE_KEYS.newReleases, data.data.newReleases.media);
            saveCache(CACHE_KEYS.topRated, data.data.topRated.media);

            displayAnimeData(data.data.trending.media, "anime-list");
            displayAnimeData(data.data.newReleases.media, "new-releases-list");
            displayAnimeData(data.data.topRated.media, "top-rated-movies");

            initializeCarousel(); // Reinitialize carousel after fetching data
        })
        .catch((error) => console.error("Error fetching anime data:", error));
}

// Display anime data
function displayAnimeData(animeList, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";

    animeList.forEach((anime) => {
        const title = anime.title.english || anime.title.romaji || anime.title.native || "No Title Available";
        const isTopRated = containerId === "top-rated-movies"; // Check if this is the top-rated movies container
        const animeItem = document.createElement("div");
        animeItem.className = "anime-item";
        animeItem.innerHTML = `
<a href="/anime-details?id=${anime.id}" class="anime-link ${isTopRated ? "top-rated-link" : ""}" style="text-decoration: none;">
    <img src="${anime.coverImage.extraLarge}" alt="${title}">
    <h3>${title}</h3>
</a>
        `;
        container.appendChild(animeItem);
        floatingTextList.push(title);
    });

    if (containerId === "anime-list") addTextToMarquee();
}


// Initialize carousel for top-rated movies
function initializeCarousel() {
    const track = document.querySelector(".carousel-track");
    const nextButton = document.querySelector(".carousel-control.next");
    const prevButton = document.querySelector(".carousel-control.prev");
    let currentIndex = 0;

    const updateCarousel = () => {
        const itemWidth = track.querySelector(".anime-item").offsetWidth + 30; // Include gap
        const visibleItems = Math.floor(track.offsetWidth / itemWidth);
        const totalItems = Math.min(track.children.length, 11); // Ensure a maximum of 15 items
        const maxIndex = Math.ceil(totalItems / visibleItems) - 1;

        track.style.transform = `translateX(-${currentIndex * itemWidth}px)`;
        prevButton.disabled = currentIndex === 0;
        nextButton.disabled = currentIndex >= maxIndex;
    };

    nextButton.addEventListener("click", () => {
        currentIndex = Math.min(currentIndex + 1);
        updateCarousel();
    });

    prevButton.addEventListener("click", () => {
        currentIndex = Math.max(currentIndex - 1, 0);
        updateCarousel();
    });

    updateCarousel();
}

// Add text to marquee
function addTextToMarquee() {
    const marquee = document.querySelector("marquee");
    let marqueeText = "";
    floatingTextList.forEach((text) => {
      marqueeText += text + " / ";
    });
    marqueeText.repeat(10);
    marquee.textContent = marqueeText;
  }

// Cache utilities
function saveCache(key, data) {
    localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
}

function checkCache(key) {
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > CACHE_TTL) {
        localStorage.removeItem(key);
        return null;
    }
    return data;
}
