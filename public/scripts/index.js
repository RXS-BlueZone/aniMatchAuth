const CORS_PROXY = "https://cors-anywhere.herokuapp.com/";
let floatingTextList = [];

function fetchTrendingAnimes() {
  $.ajax({
    url: "https://graphql.anilist.co",
    type: "POST",
    contentType: "application/json",
    data: JSON.stringify({
      query: `
          query {
            Page(page: 1, perPage: 10) {
              media(sort: TRENDING_DESC, type: ANIME) {
                id
                title {
                  romaji
                  english
                  native
                }
                description
                popularity
                averageScore
                coverImage {
                  extraLarge
                }
              }
            }
          }
        `,
    }),
    success: function (result) {
      const animeList = result.data.Page.media;
      const container = document.getElementById("anime-list");
      container.innerHTML = "";
      animeList.forEach((anime) => {
        const title =
          anime.title.english ||
          anime.title.romaji ||
          anime.title.native ||
          "No Title Available";
        const animeItem = document.createElement("div");
        animeItem.className = "anime-item";
        animeItem.innerHTML = `
            <img src="${anime.coverImage.extraLarge}" alt="${title}">
            <h3>${title}</h3>
          `;
        container.appendChild(animeItem);
        floatingTextList.push(title);
      });
      addTextToMarquee();
    },
    error: function (error) {
      console.error(error);
    },
  });
}

function fetchNewReleases() {
  $.ajax({
    url: "https://graphql.anilist.co",
    type: "POST",
    contentType: "application/json",
    data: JSON.stringify({
      query: `
          query {
            Page(page: 1, perPage: 10) {
              media(sort: START_DATE_DESC, type: ANIME) {
                id
                title {
                  romaji
                  english
                  native
                }
                description
                popularity
                averageScore
                coverImage {
                  extraLarge
                }
              }
            }
          }
        `,
    }),
    success: function (result) {
      const animeList = result.data.Page.media;
      const container = document.getElementById("new-releases-list");
      container.innerHTML = "";
      animeList.forEach((anime) => {
        const title =
          anime.title.english ||
          anime.title.romaji ||
          anime.title.native ||
          "No Title Available";
        const animeItem = document.createElement("div");
        animeItem.className = "anime-item";
        animeItem.innerHTML = `
            <img src="${anime.coverImage.extraLarge}" alt="${title}">
            <h3>${title}</h3>
          `;
        container.appendChild(animeItem);
        floatingTextList.push(title);
      });
      addTextToMarquee();
    },
    error: function (error) {
      console.error(error);
    },
  });
}

function fetchTopRatedMovies() {
  $.ajax({
    url: "https://graphql.anilist.co",
    type: "POST",
    contentType: "application/json",
    data: JSON.stringify({
      query: `
          query {
            Page(page: 1, perPage: 15) {
              media(sort: SCORE_DESC, format: MOVIE, type: ANIME) {
                id
                title {
                  romaji
                  english
                  native
                }
                description
                popularity
                averageScore
                coverImage {
                  extraLarge
                }
              }
            }
          }
        `,
    }),
    success: function (result) {
      const movieList = result.data.Page.media;
      const container = document.getElementById("top-rated-movies");
      container.innerHTML = "";
      movieList.forEach((movie) => {
        const title =
          movie.title.english ||
          movie.title.romaji ||
          movie.title.native ||
          "No Title Available";
        const movieItem = document.createElement("div");
        movieItem.className = "anime-item";
        movieItem.innerHTML = `
            <img src="${movie.coverImage.extraLarge}" alt="${title}">
            <h3>${title}</h3>
            <span>${movie.averageScore}</span>
          `;
        container.appendChild(movieItem);
        floatingTextList.push(title);
      });
      addTextToMarquee();
      initializeCarousel();
    },
    error: function (error) {
      console.error(error);
    },
  });
}

function initializeCarousel() {
  const track = document.querySelector(".carousel-track");
  const nextButton = document.querySelector(".carousel-control.next");
  const prevButton = document.querySelector(".carousel-control.prev");
  let currentIndex = 0;

  const updateCarousel = () => {
    const itemWidth = track.querySelector(".anime-item").offsetWidth + 30; // Include gap
    const visibleItems = Math.floor(track.offsetWidth / itemWidth);
    const maxIndex = Math.ceil(track.children.length / visibleItems) - 1;
    track.style.transform = `translateX(-${currentIndex * itemWidth}px)`;
    prevButton.disabled = currentIndex === 0;
    prevButton.style.cursor = prevButton.disabled ? "not-allowed" : "pointer";
    nextButton.disabled = currentIndex >= maxIndex;
    nextButton.style.cursor = nextButton.disabled ? "not-allowed" : "pointer";
  };

  nextButton.addEventListener("click", () => {
    const itemWidth = track.querySelector(".anime-item").offsetWidth + 30; // Include gap
    const visibleItems = Math.floor(track.offsetWidth / itemWidth);
    currentIndex = Math.min(
      currentIndex + visibleItems,
      Math.ceil(track.children.length / visibleItems) - 1
    );
    updateCarousel();
  });

  prevButton.addEventListener("click", () => {
    const itemWidth = track.querySelector(".anime-item").offsetWidth + 30; // Include gap
    const visibleItems = Math.floor(track.offsetWidth / itemWidth);
    currentIndex = Math.max(currentIndex - visibleItems, 0);
    updateCarousel();
  });

  // Initialize the carousel
  updateCarousel();
}

// Floating text
function addTextToMarquee() {
  const marquee = document.querySelector("marquee");
  let marqueeText = "";
  floatingTextList.forEach((text) => {
    marqueeText += text + " / ";
  });
  marqueeText.repeat(10);
  marquee.textContent = marqueeText;
}

// Call the functions to fetch trending animes and new releases
fetchTrendingAnimes();
fetchNewReleases();
fetchTopRatedMovies();
