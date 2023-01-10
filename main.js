const BASE_URL = "https://webdev.alphacamp.io";
const INDEX_URL = BASE_URL + "/api/movies/";
const POSTER_URL = BASE_URL + "/posters/";
const MOVIE_PER_PAGE = 12;

const dataPanel = document.querySelector("#data-panel");
const searchInput = document.querySelector("#search-input");
const searchForm = document.querySelector("#search-form");
const paginator = document.querySelector("#paginator");
const displayMode = document.querySelector("#display-mode");
const cardButton = document.querySelector("#card-button");
const listButton = document.querySelector("#list-button");

let mode = "card"; // 當前模式: card
let currentPage = 1; // 當前頁面: 1

let filteredMovies = [];
const movies = [];

function renderMovieList(data) {
  if (mode === "list") {
    listButton.classList.add("active-mode");
    cardButton.classList.remove("active-mode");
    let rawHTML = `<ul class="list-group list-group-flush ">`;
    data.forEach((item) => {
      rawHTML += `
       <li class="list-group-item d-flex align-items-center">${item.title}
        <div class="col-md-2 ms-auto">
          <button class="btn btn-primary btn-show-movie " data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">More</button>
          <button class="btn btn-info btn-add-favorite" data-id="${item.id}"> + </button>
        </div>
      </li>
      `;
    });
    rawHTML += `</ul>`;
    dataPanel.innerHTML = rawHTML;
  } else if (mode === "card") {
    cardButton.classList.add("active-mode");
    listButton.classList.remove("active-mode");
    let rawHTML = "";
    data.forEach((item) => {
      rawHTML += `
      <div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img
              src="${POSTER_URL}${item.image}"
              class="card-img-top" alt="Movie-poster">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal"
                data-bs-target="#movie-modal" data-id=${item.id}>More</button>
              <button class="btn btn-info btn-add-favorite" data-id=${item.id}>+</button>
            </div>
          </div>
        </div>
      </div>
    `;
    });
    dataPanel.innerHTML = rawHTML;
  }
}

function showMovieModal(id) {
  const modalTitle = document.querySelector("#movie-modal-title");
  const modalImage = document.querySelector("#movie-modal-image");
  const modalDate = document.querySelector("#movie-modal-date");
  const modalDescription = document.querySelector("#movie-modal-description");

  axios
    .get(INDEX_URL + id)
    .then((response) => {
      const data = response.data.results;
      modalTitle.innerText = data.title;
      modalDate.innerText = "release date : " + data.release_date;
      modalDescription.innerText = data.description;
      modalImage.innerHTML = `<img src='${POSTER_URL + data.image
        }' class='img-fluid' alt='Movie Poster'>`;
    })
    .catch(function (error) {
      console.log(error);
    });
}

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem("favoriteMovies")) || [];
  const movie = movies.find((movie) => movie.id === id);
  if (list.some((movie) => movie.id === id)) {
    return alert("此電影已經在收藏清單中");
  }
  list.push(movie);
  localStorage.setItem("favoriteMovies", JSON.stringify(list));
}

function getMoviesByPage(page) {
  const data = filteredMovies.length ? filteredMovies : movies;
  const startIndex = (page - 1) * MOVIE_PER_PAGE;
  return data.slice(startIndex, startIndex + MOVIE_PER_PAGE);
}

function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIE_PER_PAGE);
  let rawHTML = "";
  for (let page = 1; page <= numberOfPages; page++) {
    if (page === currentPage) {
      rawHTML += `<li class="page-item active"><a class="page-link" data-page='${page}' href="#">${page}</a></li>`;
    } else {
      rawHTML += `<li class="page-item"><a class="page-link" data-page='${page}' href="#">${page}</a></li>`;
    }
  }
  paginator.innerHTML = rawHTML;
}

dataPanel.addEventListener("click", function onPanelClicked(event) {
  if (event.target.matches(".btn-show-movie")) {
    showMovieModal(Number(event.target.dataset.id));
  } else if (event.target.matches(".btn-add-favorite")) {
    addToFavorite(Number(event.target.dataset.id));
  }
});

paginator.addEventListener("click", function onPaginatorClicked(event) {
  if (event.target.tagName !== "A") return;
  currentPage = Number(event.target.dataset.page);
  const paginatorClass = document.querySelector("#paginator .active");
  paginatorClass.classList.remove("active");
  event.target.parentElement.classList.add("active");
  renderMovieList(getMoviesByPage(currentPage));
});

searchForm.addEventListener("submit", function onSearchFormSubmitted(event) {
  event.preventDefault();
  const keyword = searchInput.value.trim().toLowerCase();

  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  );

  if (filteredMovies.length === 0) {
    return alert(`您輸入的關鍵字${keyword} 沒有符合條件的電影`);
  }
  currentPage = 1;
  renderPaginator(filteredMovies.length);
  renderMovieList(getMoviesByPage(currentPage));
});

displayMode.addEventListener("click", function onModeClicked(event) {
  if (event.target.matches("#card-button")) {
    mode = "card";
    renderMovieList(getMoviesByPage(currentPage));
  } else if (event.target.matches("#list-button")) {
    mode = "list";
    renderMovieList(getMoviesByPage(currentPage));
  }
});

axios
  .get(INDEX_URL)
  .then((response) => {
    movies.push(...response.data.results);
    renderPaginator(movies.length);
    renderMovieList(getMoviesByPage(currentPage));
  })
  .catch((error) => console.log(error));
