document.addEventListener("DOMContentLoaded", () => {
  fetchTrendingAnimes();
});

function fetchTrendingAnimes() {
  $.ajax({
    url: "https://graphql.anilist.co",
    type: "POST",
    contentType: "application/json",
    data: JSON.stringify({
      query: `
    query {
      Page(page: 1, perPage: 1) {
        media(sort: POPULARITY_DESC, type: ANIME) {
          id
          title {
            romaji
            english
            native
          }
            synonyms
          description
          bannerImage
          coverImage {
            extraLarge
          }
          rankings {
            rank
            type
            context
            year
            season
          }
          stats {
            scoreDistribution {
              score
              amount
            }
          }
          trailer {
            id
          }
          format
          episodes
          duration
          status
          startDate {
            year
            month
            day
          }
          endDate {
            year
            month
            day
          }
        nextAiringEpisode {
            timeUntilAiring
            episode
            }
        rankings {
            rank
            allTime
            context
        }
          season
          seasonYear
          averageScore
          meanScore
          popularity
          favourites
          studios(isMain : true) {
            edges {
              node {
                name
              }
            }
          }
          source
          hashtag
          genres
        }
      }
    }

  `,
    }),
    success: function (result) {
      const anime = result.data.Page.media[0];
      const scoreDistribution = anime.stats.scoreDistribution;
      displayAnimeDetails(anime);
      fetchCharacterDetails(anime.id);
      fetchRelationDetails(anime.id);
      fetchRecommendationDetails(anime.id);
      fetchTagDetails(anime.id);
      fetchProducers(anime.id);
      displayScoreDistribution(scoreDistribution);
      displayAiringInfo(anime);
    },
    error: function (error) {
      console.error(error);
    },
  });
}

function displayAiringInfo(anime) {
  const airingEpElement = document.getElementById("airing-ep");
  const airingTimeElement = document.getElementById("airing-time");
  const firstInfoElement = document.querySelector(".info-item:first-child");

  if (anime.nextAiringEpisode) {
    const airingTime = anime.nextAiringEpisode.timeUntilAiring;
    const airingEpisode = anime.nextAiringEpisode.episode;

    let remainingSeconds = airingTime;
    const days = Math.floor(remainingSeconds / (24 * 3600));
    remainingSeconds %= 24 * 3600;
    const hours = Math.floor(remainingSeconds / 3600);
    remainingSeconds %= 3600;
    const mins = Math.floor(remainingSeconds / 60);

    airingEpElement.textContent = airingEpisode;
    airingTimeElement.textContent = `${days}d ${hours}h ${mins}m`;
    airingEpElement.style.display = "inline";
    airingTimeElement.style.display = "inline";
  } else {
    airingEpElement.style.display = "none";
    airingTimeElement.style.display = "none";
    firstInfoElement.style.display = "none";
  }
}

function fetchRelationDetails(animeId) {
  $.ajax({
    url: "https://graphql.anilist.co",
    type: "POST",
    contentType: "application/json",
    data: JSON.stringify({
      query: `
    query ($id: Int) {
      Media(id: $id) {
        relations {
          edges {
            node {
              title {
                romaji
                english
                native
              }
              coverImage {
                extraLarge
              }
              source
              status
              format
            }
          }
        }
      }
    }
  `,
      variables: {
        id: animeId,
      },
    }),
    success: function (result) {
      console.log("Fetched relation details successfully");
      const relations = result.data.Media.relations.edges;
      displayRelationDetails(relations);
    },
    error: function (error) {
      console.error(error);
    },
  });
}

function displayAnimeDetails(anime) {
  const title =
    anime.title.english ||
    anime.title.romaji ||
    anime.title.native ||
    "No Title Available";
  const description = anime.description || "No Description Available";
  const bannerImage = anime.bannerImage || "";
  const coverImage = anime.coverImage.extraLarge || "";
  const averageScore = anime.averageScore || "N/A";
  const meanScore = anime.meanScore || "N/A";
  const popularity = anime.popularity || "N/A";
  const favourites = anime.favourites || "N/A";
  const format = anime.format || "N/A";
  const episodes = anime.episodes || "N/A";
  const duration = anime.duration || "N/A";
  const status = anime.status || "N/A";
  const startDate = anime.startDate
    ? `${anime.startDate.year}-${anime.startDate.month}-${anime.startDate.day}`
    : "N/A";
  const endDate = anime.endDate
    ? `${anime.endDate.year}-${anime.endDate.month}-${anime.endDate.day}`
    : "N/A";
  const season = anime.season || "N/A";
  const seasonYear = anime.seasonYear || "N/A";
  const source = anime.source || "N/A";

  let rankingInfoList = [];

  if (anime.rankings && anime.rankings.length > 0) {
    const filteredRankings = anime.rankings.filter(
      (ranking) =>
        (ranking.type === "RATED" &&
          ranking.context === "highest rated all time") ||
        (ranking.type === "POPULAR" &&
          ranking.context === "most popular all time")
    );

    if (filteredRankings.length > 0) {
      filteredRankings.forEach((ranking) => {
        //Use forEach for cleaner code. map is for creating a new array.
        const rank =
          ranking.rank !== null && !isNaN(ranking.rank) ? ranking.rank : "N/A";
        const year =
          ranking.year !== null && !isNaN(ranking.year) ? ranking.year : "N/A";
        const season =
          ranking.season !== null && !isNaN(ranking.season)
            ? ranking.season
            : "N/A"; // Added season check
        rankingInfoList.push({
          type: ranking.type || "N/A", //Handle null or undefined type
          context: ranking.context || "N/A", //Handle null or undefined context
          rank: rank,
          year: year,
          season: season,
        });
      });
    } else {
      rankingInfoList.push({
        type: "N/A",
        context: "N/A",
        rank: "N/A",
        year: "N/A",
        season: "N/A",
      });
    }
  }

  const hashtags = anime.hashtag || "N/A";
  const genres = anime.genres ? anime.genres.join("<br>") : "N/A";
  const synonyms = anime.synonyms ? anime.synonyms.join("<br>") : "N/A";
  const mainStudio = anime.studios.edges
    .map((edge) => edge.node.name)
    .join("<br>");
  const scoreDistribution = anime.stats.scoreDistribution
    .map((score) => `${score.score}: ${score.amount}`)
    .join(", ");
  const trailerSrc = anime.trailer ? anime.trailer.id : "";

  const formattedStartDate = formatDate(anime.startDate);
  const formattedEndDate = formatDate(anime.endDate);

  document.title = `${anime.title.romaji} (${anime.title.english}) - AniMatch`;
  document.getElementById("banner-img").src = bannerImage;
  document.getElementById("cover-img").src = coverImage;
  document.getElementById("anime-title").textContent = title;
  document.getElementById("anime-description").innerHTML = description;

  if (rankingInfoList.length > 1) {
    // Check if at least two elements exist.
    document.getElementById("rank-alltime").textContent =
      rankingInfoList[0].rank;
    document.getElementById("rank-context").textContent =
      rankingInfoList[0].context;
    document.getElementById("popularity-alltime").textContent =
      rankingInfoList[1].rank;
    document.getElementById("popularity-context").textContent =
      rankingInfoList[1].context;
  } else if (rankingInfoList.length === 1) {
    document.getElementById("rank-alltime").textContent =
      rankingInfoList[0].rank;
    document.getElementById("rank-context").textContent =
      rankingInfoList[0].context;
    document.getElementById("popularity-alltime").textContent = "N/A"; // Or handle appropriately.
    document.getElementById("popularity-context").textContent = "N/A"; // Or handle appropriately.
  } else {
    document.getElementById("rank-alltime").textContent = "N/A";
    document.getElementById("rank-context").textContent = "N/A";
    document.getElementById("popularity-alltime").textContent = "N/A";
    document.getElementById("popularity-context").textContent = "N/A";
  }

  document.getElementById("format").textContent = format
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
  document.getElementById("ep-count").textContent = episodes;
  document.getElementById("ep-duration").textContent = duration + " mins";
  document.getElementById("status").textContent = status
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
  document.getElementById("start-date").textContent = formattedStartDate;
  document.getElementById("end-date").textContent = formattedEndDate;
  document.getElementById("season").textContent =
    season.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase()) +
    " " +
    seasonYear;
  document.getElementById("average-score").textContent = averageScore + "%";
  document.getElementById("mean-score").textContent = meanScore + "%";
  document.getElementById("popularity").textContent = popularity;
  document.getElementById("favorites").textContent = favourites;
  document.getElementById("studios").innerHTML = mainStudio;
  document.getElementById("source").textContent = source
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
  document.getElementById("hashtag").textContent = hashtags;
  document.getElementById("genres").innerHTML = genres;
  document.getElementById("romaji-title").textContent = anime.title.romaji;
  document.getElementById("english-title").textContent = title;
  document.getElementById("native-title").textContent = anime.title.native;
  document.getElementById("synonyms").innerHTML = synonyms;

  var tag = document.createElement("script");
  tag.src = "https://www.youtube.com/player_api";
  var firstScriptTag = document.getElementsByTagName("script")[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

  if (trailerSrc) {
    var player;
    window.onYouTubeIframeAPIReady = function () {
      const videoId = anime.trailer ? anime.trailer.id : "";

      if (videoId) {
        new YT.Player("ytplayer", {
          height: "280",
          width: "500",
          videoId: videoId,
          events: {
            onReady: onPlayerReady,
            onStateChange: onPlayerStateChange,
          },
        });
      } else {
        console.log("No video ID found.");
      }
    };
  } else {
    document.getElementById("ytplayer").style.display = "none";
    document.querySelector(".trailer").innerHTML =
      "<p>No trailer available.</p>";
  }
}

function onPlayerReady(event) {
  console.log("Player ready");
}

function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.ENDED) {
    console.log("Video ended");
  } else if (event.data === YT.PlayerState.ERROR) {
    console.error("YouTube Player Error:", event);
  }
}

function onPlayerError(event) {
  let errorMessage;
  switch (event.data) {
    case 2:
      errorMessage =
        "The request contains an invalid parameter value. For example, this error occurs if you specify a video ID that does not have any content associated with it.";
      break;
    case 5:
      errorMessage =
        "The requested content cannot be played in an HTML5 player or another error related to the HTML5 player has occurred.";
      break;
    case 100:
      errorMessage =
        "The video requested was not found. This error occurs when a video is removed (for any reason) or if a video is set to private.";
      break;
    case 101: //This is the most common error when the video is unavailable.
      errorMessage =
        "The owner of the requested video does not allow it to be played in embedded players.";
      break;
    default:
      errorMessage = "An unknown error occurred.";
  }
  showError(errorMessage);
}

function showError(message) {
  const errorMessage = document.getElementById("error-message");
  errorMessage.textContent = message;
  errorMessage.style.display = "block";
  const playerContainer = document.getElementById("ytplayer");
  playerContainer.style.display = "none"; // Hide the player container if there is an error
}

function fetchCharacterDetails(animeId) {
  $.ajax({
    url: "https://graphql.anilist.co",
    type: "POST",
    contentType: "application/json",
    data: JSON.stringify({
      query: `
    query ($id: Int) {
      Media(id: $id) {
        characters(sort: FAVOURITES_DESC, page: 1, perPage: 6) {
          edges {
            role
            node {
              name {
                full
              }
              image {
                large
              }
            }
            voiceActors(language: JAPANESE) {
              name {
                full
              }
              languageV2
              image {
                large
              }
            }
          }
        }
      }
    }
  `,
      variables: {
        id: animeId,
      },
    }),
    success: function (result) {
      const characters = result.data.Media.characters.edges;

      const sortedCharacters = characters.sort((a, b) => {
        if (a.role === "MAIN" && b.role !== "MAIN") return -1;
        if (a.role !== "MAIN" && b.role === "MAIN") return 1;
        return b.node.favourites - a.node.favourites;
      });

      displayCharacterDetails(sortedCharacters);
    },
    error: function (error) {
      console.error(error);
    },
  });
}

function displayCharacterDetails(characters) {
  const characterItems = Array.from(
    document.querySelectorAll(".character-item")
  );

  characters.forEach((characterEdge, index) => {
    if (index < characterItems.length) {
      const characterItem = characterItems[index];
      const character = characterEdge.node;
      const role = characterEdge.role;
      const characterName = character.name.full;
      const characterImage = character.image.large;
      const voiceActor = characterEdge.voiceActors[0];

      characterItem.querySelector(".character-img").src = characterImage;
      characterItem.querySelector(".character-img").alt = characterName;
      characterItem.querySelector(".character-name").textContent =
        characterName;
      characterItem.querySelector(".character-role").textContent = role
        .toLowerCase()
        .replace(/\b\w/g, (char) => char.toUpperCase());

      if (voiceActor) {
        const vaImage = characterItem.querySelector(".va-img");
        const vaName = characterItem.querySelector(".va-name");
        const vaNationality = characterItem.querySelector(".va-nationality");

        vaImage.src = voiceActor.image.large;
        vaImage.alt = voiceActor.name.full;
        vaName.textContent = voiceActor.name.full;
        vaNationality.textContent = voiceActor.languageV2;
      }
    }
  });
}

function displayRelationDetails(relations) {
  const relationContainer = document.querySelector(".relations-wrapper"); // Corrected selector
  relationContainer.innerHTML = ""; // Clear previous content

  if (!relations || relations.length === 0) {
    console.log("No relations found");
    relationContainer.innerHTML = "<p>No relations found for this anime.</p>";
    return;
  }

  for (const relationEdge of relations) {
    const relation = relationEdge.node;
    const title =
      relation.title.english ||
      relation.title.romaji ||
      relation.title.native ||
      "No Title Available";
    const coverImage = relation.coverImage.extraLarge || "";
    const status = relation.status || "N/A";
    const format = relation.format || "N/A";

    const relationItem = `
      <div class="relations-item">
        <img src="${coverImage}" alt="${title}" class="relation-img" />
        <div class="relation-details">
          <div>
            <p>Source</p>
            <p class="relation-title">${title}</p>
          </div>
          <div>
            <p class="relation-format">${format
              .toLowerCase()
              .replace(/\b\w/g, (char) => char.toUpperCase())}</p>
            <p>•</p>
            <p class="relation-status">${status
              .toLowerCase()
              .replace(/\b\w/g, (char) => char.toUpperCase())}</p>
          </div>
        </div>
      </div>
    `;
    relationContainer.innerHTML += relationItem;
  }
}

function fetchRecommendationDetails(animeId) {
  $.ajax({
    url: "https://graphql.anilist.co",
    type: "POST",
    contentType: "application/json",
    data: JSON.stringify({
      query: `
    query ($id: Int) {
      Media(id: $id) {
        recommendations(page: 1, perPage: 7) {
          edges {
            node {
              mediaRecommendation {
                title {
                  romaji
                  english
                  native
                }
                coverImage {
                  extraLarge
                }
              }
            }
          }
        }
      }
    }
  `,
      variables: {
        id: animeId,
      },
    }),
    success: function (result) {
      const recommendations = result.data.Media.recommendations.edges;
      displayRecommendationDetails(recommendations);
    },
    error: function (error) {
      console.error(error);
    },
  });
}

function displayRecommendationDetails(recommendations) {
  const recommendationContainer = document.querySelector(".recommendations");
  recommendationContainer.innerHTML = ""; // Clear previous content

  if (!recommendations || recommendations.length === 0) {
    console.log("No recommendations found");
    recommendationContainer.innerHTML =
      "<p>No recommendations found for this anime.</p>";
    return;
  }

  for (const recommendationEdge of recommendations) {
    const recommendation = recommendationEdge.node.mediaRecommendation;
    const title =
      recommendation.title.english ||
      recommendation.title.romaji ||
      recommendation.title.native ||
      "No Title Available";
    const coverImage = recommendation.coverImage.extraLarge || "";

    const recommendationItem = `
      <div class="recommendation-item">
        <img src="${coverImage}" alt="${title}" class="recommendation-img" />
        <p class="recommendation-title">${title}</p>
      </div>
    `;
    recommendationContainer.innerHTML += recommendationItem;
  }
}

function fetchTagDetails(animeId) {
  $.ajax({
    url: "https://graphql.anilist.co",
    type: "POST",
    contentType: "application/json",
    data: JSON.stringify({
      query: `
    query ($id: Int) {
      Media(id: $id, type: ANIME) {
        tags {
          name
          description
          isMediaSpoiler
        }
      }
    }
  `,
      variables: {
        id: animeId,
      },
    }),
    success: function (result) {
      const tags = result.data.Media.tags;
      displayTagDetails(tags);
    },
    error: function (error) {
      console.error(error);
    },
  });
}

function displayTagDetails(tags) {
  const tagContainer = document.querySelector(".tags");
  tagContainer.innerHTML = ""; // Clear previous content

  if (!tags || tags.length === 0) {
    console.log("No tags found");
    tagContainer.innerHTML = "<p>No tags found for this anime.</p>";
    return;
  }

  for (const tag of tags) {
    const tagName = tag.name || "N/A";
    const tagDescription = tag.description || "No Description Available";
    const isSpoiler = tag.isMediaSpoiler || false;

    const tagItem = `
      <div class="tag-item ${isSpoiler ? "spoiler" : ""}">
        <div class="tags-desc">
          <p class="tag">${tagName}</p>
          <span class="tag-info">${tagDescription}</span>
        </div>
      </div>
    `;
    tagContainer.innerHTML += tagItem;
  }
}

function fetchProducers(animeId) {
  $.ajax({
    url: "https://graphql.anilist.co",
    type: "POST",
    contentType: "application/json",
    data: JSON.stringify({
      query: `
    query ($id: Int) {
      Media(id: $id, type: ANIME) {
        studios(isMain : false) {
            edges {
              node {
                name
              }
            }
          }
      }
    }
  `,
      variables: {
        id: animeId,
      },
    }),
    success: function (result) {
      const producers = result.data.Media.studios.edges.map(
        (edge) => edge.node
      );
      displayProducers(producers);
    },
    error: function (error) {
      console.error(error);
    },
  });
}

function displayProducers(producers) {
  const producerElement = producers
    .map((producer) => (producer.name ? producer.name : "N/A"))
    .join("<br>");
  document.getElementById("producers").innerHTML = producerElement;
}

function displayScoreDistribution(scoreDistribution) {
  const container = document.querySelector(".scores");
  const containerHeight = container.clientHeight;

  // Find the maximum amount dynamically
  let maxAmount = 0;
  for (const score in scoreDistribution) {
    maxAmount = Math.max(maxAmount, scoreDistribution[score].amount);
  }

  for (const score in scoreDistribution) {
    const scoreData = scoreDistribution[score];
    //Improved selector, uses data.score directly as ID
    const selector = `.score-item .score-span[id="${scoreData.score}"]`;
    const scoreSpan = document.querySelector(selector);
    const scoreCountSpan =
      scoreSpan.parentElement.querySelector(".score-count");
    const scoreCateg = scoreSpan.parentElement.querySelector(".score-categ"); // Get score-count from parent

    if (!scoreSpan || !scoreCountSpan || !scoreCateg) {
      console.error("Score span or score count span not found."); // Skip to the next iteration if elements are not found
    }

    //Set score count
    scoreCountSpan.textContent = scoreData.amount;
    scoreCateg.textContent = scoreData.score;

    let percentage;
    if (maxAmount === 0) {
      percentage = 0;
    } else {
      percentage = scoreData.amount / maxAmount;
    }

    let height;
    if (scoreData.amount < maxAmount * 0.2) {
      height = "15"; //Minimum height
    } else {
      height = percentage * containerHeight;
    }
    scoreSpan.style.height = `${height}px`;
  }
}
function displayRelationDetails(relations) {
  console.log("displayRelationDetails called with relations:", relations);
  const relationContainer = document.querySelector(".relations-wrapper");
  relationContainer.innerHTML = "";
  console.log("Cleared previous content in relation container");

  if (!relations || relations.length === 0) {
    console.log("No relations found");
    relationContainer.innerHTML = "<p>No relations found for this anime.</p>";
    return;
  }

  for (const relationEdge of relations) {
    const relation = relationEdge.node;
    const title =
      relation.title.english ||
      relation.title.romaji ||
      relation.title.native ||
      "No Title Available";
    const coverImage = relation.coverImage.extraLarge || "";
    const status = relation.status || "N/A";
    const format = relation.format || "N/A";

    console.log(
      `Title: ${title}, Cover Image: ${coverImage}, Status: ${status}, Format: ${format}`
    );

    const relationItem = `
      <div class="relations-item">
        <img src="${coverImage}" alt="${title}" class="relation-img" />
        <div class="relation-details">
          <div>
            <p>Source</p>  <!-- Added source -->
            <p class="relation-title">${title}</p>
          </div>
          <div>
            <p class="relation-format">${format
              .toLowerCase()
              .replace(/\b\w/g, (char) => char.toUpperCase())}</p>
            <p>•</p>
            <p class="relation-status">${status
              .toLowerCase()
              .replace(/\b\w/g, (char) => char.toUpperCase())}</p>
          </div>
        </div>
      </div>
    `;
    relationContainer.innerHTML += relationItem; //More efficient than appendChild in a loop
  }

  console.log("Finished processing all relations");
}

function fetchRelationDetails(animeId) {
  console.log("fetchRelationDetails called with animeId:", animeId);
  $.ajax({
    url: "https://graphql.anilist.co",
    type: "POST",
    contentType: "application/json",
    data: JSON.stringify({
      query: `
        query ($id: Int) {
          Media(id: $id) {
            relations {
              edges {
                node {
                  title {
                    romaji
                    english
                    native
                  }
                  coverImage {
                    extraLarge
                  }
                  status
                  format
                }
              }
            }
          }
        }
      `,
      variables: {
        id: animeId,
      },
    }),
    success: function (result) {
      console.log("Fetched relation details successfully");
      const relations = result.data.Media.relations.edges;
      displayRelationDetails(relations);
    },
    error: function (error) {
      console.error("Error fetching relation details:", error);
    },
  });
}

function formatDate(dateObject) {
  if (!dateObject || !dateObject.year || !dateObject.month || !dateObject.day) {
    return "N/A"; // Handle missing or incomplete date data gracefully
  }

  const year = parseInt(dateObject.year, 10);
  const month = parseInt(dateObject.month, 10) - 1; //Months are 0-indexed in JavaScript Date
  const day = parseInt(dateObject.day, 10);

  //Validate the date components.  This prevents crashes from bad data.
  if (
    isNaN(year) ||
    isNaN(month) ||
    isNaN(day) ||
    month < 0 ||
    month > 11 ||
    day < 1 ||
    day > 31
  ) {
    return "N/A";
  }

  const date = new Date(year, month, day);

  //Check if the created date is valid.  This catches invalid date combinations (like Feb 30th).
  if (isNaN(date.getTime())) {
    return "N/A";
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}
