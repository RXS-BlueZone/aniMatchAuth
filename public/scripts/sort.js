const API_URL = "https://graphql.anilist.co";
let currentPage = 1; // Track the current page for infinite scroll
let isFetching = false; // Prevent simultaneous fetches
let sortType = null; // Track the selected sort type

// Track Filter Selections
let filters = {
  genre: null,
  year: null,
  season: null,
  format: null,
};

// ** DOM Elements **
const sortDropdown = document.getElementById("sort-dropdown");
const sortedResultsSection = document.getElementById("sorted-results");
const searchBar = document.getElementById("search-bar");
const sortedGrid = document.getElementById("sorted-grid");

// ** Hide Sort Dropdown (default) **
const hideSortDropdown = () => {
  sortDropdown.hidden = true;
};

// ** Show Sort Dropdown (when triggered) **
const showSortDropdown = () => {
  sortDropdown.hidden = false;
};

// ** Fetch and Populate Genres **
const fetchGenres = async () => {
  const query = `
    query {
      GenreCollection
    }
  `;

  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });

  const data = await response.json();
  populateDropdown("genre-filter", data.data.GenreCollection, "Genres");
};


// ** Generate and Populate Years **
const fetchYears = () => {
  const currentYear = new Date().getFullYear();
  const startYear = 1960; // Start from the year anime became widely produced
  const years = [];

  for (let year = currentYear; year >= startYear; year--) {
    years.push(year);
  }

  populateDropdown("year-filter", years, "Year");
};

// ** Populate Dropdowns Helper **
function populateDropdown(dropdownId, items, defaultOption) {
  const dropdown = document.getElementById(dropdownId);
  dropdown.innerHTML = `<option value="">${defaultOption}</option>`; // Default option
  items.forEach((item) => {
    const option = document.createElement("option");
    option.value = item;
    option.textContent = item;
    dropdown.appendChild(option);
  });
}


// ** Populate Dropdowns Helper **
function populateDropdown(dropdownId, items, defaultOption) {
  const dropdown = document.getElementById(dropdownId);
  dropdown.innerHTML = `<option value="">${defaultOption}</option>`; // Default option
  items.forEach((item) => {
    const option = document.createElement("option");
    option.value = item;
    option.textContent = item;
    dropdown.appendChild(option);
  });
}

// ** Fetch Default Sections **
const fetchTrendingAnime = async () => {
  fetchAnime("trending-grid", { sort: ["TRENDING_DESC"] }, 5);
};

const fetchPopularThisSeason = async () => {
  fetchAnime("popular-season-grid", { sort: ["POPULARITY_DESC"], season: "FALL", seasonYear: 2024 }, 5);
};

const fetchUpcomingNextSeason = async () => {
  fetchAnime("upcoming-season-grid", { sort: ["POPULARITY_DESC"], season: "WINTER", seasonYear: 2025 }, 5);
};

const fetchAllTimePopular = async () => {
  fetchAnime("all-time-popular-grid", { sort: ["POPULARITY_DESC"] }, 5);
};

const fetchTop10 = async () => {
  fetchAnime("top-10-grid", { sort: ["SCORE_DESC"] }, 10, true);
};

// ** Fetch Anime Generic Function **
async function fetchAnime(gridId, params, perPage, isTop10 = false) {
  const { sort, season, seasonYear, genre, format, status } = params;
  const query = `
    query ($page: Int, $perPage: Int, $sort: [MediaSort], $season: MediaSeason, $seasonYear: Int, $genre: String, $format: MediaFormat, $status: MediaStatus) {
      Page(page: $page, perPage: $perPage) {
        media(sort: $sort, season: $season, seasonYear: $seasonYear, genre: $genre, type: ANIME, format: $format, status: $status) {
          id
          title {
            romaji
          }
          coverImage {
            large
          }
          genres
          averageScore
          popularity
          format
          episodes
          season
          seasonYear
          status
        }
      }
    }
  `;

  const variables = {
    page: currentPage,
    perPage,
    sort,
    season: season || undefined, // Include season if set
    seasonYear: seasonYear || undefined, // Include seasonYear if set
    genre: genre || undefined,
    format: format || undefined,
    status: status || undefined
  };

  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });

  const data = await response.json();
  if (isTop10) {
    renderTop10(data.data.Page.media);
  } else {
    renderAnime(data.data.Page.media, gridId);
  }
}


// ** Rendering Functions **
const renderAnime = (animeList, gridId) => {
  const grid = document.getElementById(gridId);
  grid.innerHTML = ""; // Clear existing content

  animeList.forEach((anime) => {
    const animeCard = document.createElement("div");
    animeCard.className = "anime-card";
    animeCard.innerHTML = `
      <img src="${anime.coverImage.large}" alt="${anime.title.romaji}">
      <h3>${anime.title.romaji}</h3>
    `;
    grid.appendChild(animeCard);
  });
};

const renderTop10 = (animeList) => {
  const grid = document.getElementById("top-10-grid");
  grid.innerHTML = ""; // Clear existing content

  animeList.forEach((anime, index) => {
    const card = document.createElement("div");
    card.className = "top-10-card";
    const genresHTML = anime.genres.map((genre) => `<span>${genre.toLowerCase()}</span>`).join("");
    card.innerHTML = `
      <img src="${anime.coverImage.large}" alt="${anime.title.romaji}">
      <div class="top-10-content">
        <h3>#${index + 1} ${anime.title.romaji}</h3>
        <div class="tags">${genresHTML}</div>
      </div>
      <div class="top-10-stats">
        <div class="score">⭐ ${anime.averageScore}%</div>
        <div class="info">
          ${anime.format} • ${anime.episodes || "?"} episodes<br>
          ${anime.season || ""} ${anime.seasonYear || ""} • ${anime.status || "Unknown"}
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
};

// ** Event Listeners for Filters and Sorts **
document.getElementById("genre-filter").addEventListener("change", (event) => {
  filters.genre = event.target.value || null;
  updateFiltersAndFetch();
});
document.getElementById("year-filter").addEventListener("change", (event) => {
  filters.year = parseInt(event.target.value) || null;
  updateFiltersAndFetch();
});
document.getElementById("season-filter").addEventListener("change", (event) => {
  filters.season = event.target.value || null;
  updateFiltersAndFetch();
});
document.getElementById("format-filter").addEventListener("change", (event) => {
  filters.format = event.target.value || null;
  updateFiltersAndFetch();
});

document.getElementById("status-filter").addEventListener("change", (event) => {
  filters.status = event.target.value || null;
  updateFiltersAndFetch();
});

// Event listener for sort options
document.querySelectorAll(".sort-menu a").forEach((option) => {
  option.addEventListener("click", (event) => {
    event.preventDefault(); // Prevent default link behavior

    const sortType = event.target.dataset.sort;

    if (sortType === "DEFAULT") {
      // If "Default" is selected, reset the page to the default sections
      resetToDefault(); // This will reset the page to the initial state
    } else {
      // Apply sorting based on the selected sort type
      sortType = sortType || "TRENDING_DESC"; // Default to "TRENDING_DESC" if no sort type
      updateViewAllResults(sortType, filters.season, filters.year);
    }
  });
});

// ** Search Event Listener **
searchBar.addEventListener("input", (event) => {
  const searchQuery = event.target.value.trim();
  if (searchQuery) {
    showSortDropdown(); // Show sort dropdown
    fetchSearchResults(searchQuery); // Fetch and render search results
  } else {
    resetToDefault(); // Reset to default sections if search is cleared
  }
});

// ** Fetch Search Results with Filters and Sort **
const fetchSearchResults = async (searchQuery) => {
  const query = `
    query ($search: String, $page: Int, $sort: [MediaSort], $genre: String, $season: MediaSeason, $seasonYear: Int, $format: MediaFormat, $status: MediaStatus) {
      Page(page: $page, perPage: 10) {
        media(search: $search, type: ANIME, sort: $sort, genre: $genre, season: $season, seasonYear: $seasonYear, format: $format, status: $status) {
          id
          title {
            romaji
          }
          coverImage {
            large
          }
          genres
          averageScore
          popularity
          format
          episodes
          season
          seasonYear
          status
        }
      }
    }
  `;

  // Prepare variables, ensuring no unnecessary null values are passed
  const variables = {
    search: searchQuery,
    page: 1,
    sort: sortType ? [sortType] : ["TRENDING_DESC"], // Default to TRENDING_DESC if no sortType
    genre: filters.genre || undefined, // Only include if set
    season: filters.season || undefined, // Only include if set
    seasonYear: filters.year || undefined, // Only include if set
    format: filters.format || undefined, // Only include if set
    status: filters.status || undefined, // Only include if set
  };

  // Debugging: Log variables being sent to the API
  console.log("Search Query Variables:", variables);

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables }),
    });

    const data = await response.json();

    // Debugging: Log the API response
    console.log("API Response:", data);

    if (data.errors) {
      console.error("API Errors:", data.errors);
      sortedGrid.innerHTML = `<p>Error fetching search results. Please try again.</p>`;
      return;
    }

    const animeList = data.data.Page.media;
    if (!animeList || animeList.length === 0) {
      sortedGrid.innerHTML = `<p>No results found for the current search and filters.</p>`;
      return;
    }

    renderSearchResults(animeList);
  } catch (error) {
    console.error("Fetch Error:", error);
    sortedGrid.innerHTML = `<p>Error fetching search results. Please try again.</p>`;
  }
};

// ** Render Search Results with Updated Filters and Sort **
const renderSearchResults = (animeList) => {
  sortedGrid.innerHTML = ""; // Clear existing search results
  sortedResultsSection.style.display = "block"; // Show search results section
  hideAllDefaultSections(); // Hide default sections

  if (animeList.length === 0) {
    sortedGrid.innerHTML = `<p>No results found for the current search and filters.</p>`;
    return;
  }

  animeList.forEach((anime) => {
    const animeCard = document.createElement("div");
    animeCard.className = "anime-card";
    animeCard.innerHTML = `
      <img src="${anime.coverImage.large}" alt="${anime.title.romaji}">
      <h3>${anime.title.romaji}</h3>
    `;
    sortedGrid.appendChild(animeCard);
  });
};

// ** Hide All Default Sections **
const hideAllDefaultSections = () => {
  document.getElementById("trending-section").style.display = "none";
  document.getElementById("popular-season-section").style.display = "none";
  document.getElementById("upcoming-season-section").style.display = "none";
  document.getElementById("all-time-popular-section").style.display = "none";
  document.getElementById("top-10-section").style.display = "none";
};

// ** Reset to Default Sections **
const resetToDefault = () => {
  sortType = null;
  filters = { genre: null, year: null, season: null, format: null, status: null };
  sortedResultsSection.style.display = "none"; // Hide results section
  hideSortDropdown(); // Hide sort dropdown
  showDefaultSections();
};

// ** Show Default Sections **
const showDefaultSections = () => {
  document.getElementById("trending-section").style.display = "block";
  document.getElementById("popular-season-section").style.display = "block";
  document.getElementById("upcoming-season-section").style.display = "block";
  document.getElementById("all-time-popular-section").style.display = "block";
  document.getElementById("top-10-section").style.display = "block";
  fetchTrendingAnime();
  fetchPopularThisSeason();
  fetchUpcomingNextSeason();
  fetchAllTimePopular();
  fetchTop10();
};

// ** Update Filters and Fetch Anime **
const updateFiltersAndFetch = () => {
  const searchQuery = searchBar.value.trim();
  if (searchQuery) {
    fetchSearchResults(searchQuery); // Apply filters and sort to search
  } else {
    fetchAnime("sorted-grid", { ...filters, sort: [sortType] }, 10); // Apply filters and sort to default grid
  }
};

// ** Page Initialization **
document.addEventListener("DOMContentLoaded", () => {
  hideSortDropdown(); // Ensure sort dropdown is hidden on load
  fetchGenres();
  fetchYears();
  showDefaultSections();
});


// Add event listeners to "View All" links
document.querySelectorAll(".view-all").forEach((viewAllLink) => {
  viewAllLink.addEventListener("click", (event) => {
    event.preventDefault(); // Prevent default link behavior

    // Get the sort type, season, and year from data attributes
    const sortType = viewAllLink.getAttribute("data-sort");
    const season = viewAllLink.getAttribute("data-season") || null;
    const seasonYear = parseInt(viewAllLink.getAttribute("data-year")) || null;

    // Call the updateViewAllResults function with these values
    updateViewAllResults(sortType, season, seasonYear);
    showSortDropdown();
  });
});

const updateViewAllResults = (sortType, season = null, seasonYear = null) => {
  // Reset filters
  filters = { genre: null, year: null, season: null, format: null, status: null };

  // Set the appropriate filters for season and year if provided
  if (season) filters.season = season;
  if (seasonYear) filters.year = seasonYear;

  // Show the sorted results section and hide default sections
  sortedResultsSection.style.display = "block";
  hideAllDefaultSections();

  // Fetch results with the selected sort type and filters
  fetchAnime("sorted-grid", { ...filters, sort: [sortType] }, 20);
  showSortDropdown();
};


// Show Clear Filters Button
const showClearFiltersButton = () => {
  document.getElementById("clear-filters-btn").hidden = false;
};

// Hide Clear Filters Button
const hideClearFiltersButton = () => {
  document.getElementById("clear-filters-btn").hidden = true;
};

// Clear Filters Function
const clearFilters = () => {
  // Reset all filters
  filters = { genre: null, year: null, season: null, format: null, status: null};
  sortType = null;

  // Reset search bar (if needed)
  searchBar.value = "";

  // Reset the sort dropdown and hide it
  hideSortDropdown();

  // Reset the page to the default sections
  resetToDefault();

  // Hide the clear filters button once everything is cleared
  hideClearFiltersButton();
};
