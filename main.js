const API_KEY = "trilogy";
let currentPage = 1;
let currentSearchQuery = "";
let currentType = "";

const searchForm = document.getElementById("searchForm");
const titleInput = document.getElementById("movieTitle");
const typeSelect = document.getElementById("movieType");
const resultsContainer = document.getElementById("resultsContainer");
const paginationContainer = document.getElementById("paginationContainer");
const detailsContainer = document.getElementById("detailsContainer");

searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    currentPage = 1;
    currentSearchQuery = titleInput.value.trim();
    currentType = typeSelect.value;
    
    if (currentSearchQuery) {
        fetchMovies(currentSearchQuery, currentType, currentPage);
    }
});

async function fetchMovies(query, type, page) {
    resultsContainer.innerHTML = "<p>Loading...</p>";
    paginationContainer.innerHTML = "";
    detailsContainer.innerHTML = "";

    let url = `https://www.omdbapi.com/?apikey=${API_KEY}&s=${encodeURIComponent(query)}&page=${page}`;
    if (type) url += `&type=${type}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.Response === "True") {
            displayMovies(data.Search);
            setupPagination(data.totalResults, page);
        } else {
            resultsContainer.innerHTML = `<p class="error-text">Movie not found!</p>`;
        }
    } catch (error) {
        resultsContainer.innerHTML = `<p class="error-text">Error loading data.</p>`;
    }
}

function displayMovies(movies) {
    resultsContainer.innerHTML = "";
    movies.forEach(movie => {
        const card = document.createElement("div");
        card.className = "movie-item";

        const posterSrc = movie.Poster !== "N/A" ? movie.Poster : "https://via.placeholder.com/50x75?text=No+Img";

        card.innerHTML = `
            <div class="movie-info">
                <img src="${posterSrc}" alt="${movie.Title}">
                <div>
                    <h4 style="margin: 0 0 5px 0;">${movie.Title}</h4>
                    <span style="font-size: 13px; color: #555;">${movie.Type} | ${movie.Year}</span>
                </div>
            </div>
            <button onclick="getMovieDetails('${movie.imdbID}')">Details</button>
        `;
        resultsContainer.appendChild(card);
    });
}

function setupPagination(totalResults, page) {
    paginationContainer.innerHTML = "";
    const totalPages = Math.ceil(parseInt(totalResults) / 10);

    if (totalPages <= 1) return;

    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement("button");
        btn.textContent = i;
        if (i === page) btn.classList.add("active");

        btn.addEventListener("click", () => {
            currentPage = i;
            fetchMovies(currentSearchQuery, currentType, currentPage);
        });

        paginationContainer.appendChild(btn);
    }
}

async function getMovieDetails(imdbID) {
    detailsContainer.innerHTML = "<p>Loading details...</p>";

    const url = `https://www.omdbapi.com/?apikey=${API_KEY}&i=${imdbID}`;

    try {
        const response = await fetch(url);
        const movie = await response.json();

        if (movie.Response === "True") {
            const posterSrc = movie.Poster !== "N/A" ? movie.Poster : "https://via.placeholder.com/150x225?text=No+Img";
            detailsContainer.innerHTML = `
                <div class="details-content">
                    <img src="${posterSrc}" alt="${movie.Title}">
                    <div>
                        <h2 style="margin-top: 0;">${movie.Title} (${movie.Year})</h2>
                        <p><strong>Genre:</strong> ${movie.Genre}</p>
                        <p><strong>Director:</strong> ${movie.Director}</p>
                        <p><strong>Actors:</strong> ${movie.Actors}</p>
                        <p><strong>IMDb Rating:</strong> ${movie.imdbRating}</p>
                        <p><strong>Plot:</strong> ${movie.Plot}</p>
                    </div>
                </div>
            `;
            detailsContainer.scrollIntoView({ behavior: 'smooth' });
        }
    } catch (error) {
        detailsContainer.innerHTML = `<p class="error-text">Failed to load details.</p>`;
    }
}