const spinner = document.getElementById("spinner");
const nextBtn = document.getElementById("next");
const prevBtn = document.getElementById("previous");
const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const clearBtn = document.getElementById("clear-btn");
const pageStatus = document.getElementById("page-status");
const table = document.querySelector("table");
const tableBody = document.querySelector("tbody");
const btnsParent = document.getElementById("navbar-btns");
const navbarBtns = btnsParent.children;
const url = "https://64a65266096b3f0fcc7f9186.mockapi.io/api/v1/books/";

let allBooks = [];
let activePage = 1;
let itemsPerPage = 5;
let filteredBooks = [];

const navButtons = [
  {
    id: "all",
    name: "All Books",
    bg: "secondary",
  },
  {
    id: "favorites",
    name: "My Favorites",
    bg: "success",
  },
  {
    id: "archive",
    name: "Archived",
    bg: "warning",
  },
  {
    id: "reading",
    name: "Reading",
    bg: "info",
  },
  {
    id: "finished",
    name: "Finished",
    bg: "dark",
  },
  {
    id: "wish-list",
    name: "Wish List",
    bg: "danger",
  },
];

for (let btn of navButtons) {
  btnsParent.innerHTML += `<button id="${btn.id}" type="button" class="btn btn-${btn.bg}">
    ${btn.name}
  </button>`;
}

pageStatus.innerHTML = "Loading...";

clearBtn.style.display = "none";

window.addEventListener("DOMContentLoaded", async () => {
  const resp = await axios.get(url);

  filteredBooks = resp.data;

  allBooks = resp.data;

  setTimeout(() => {
    spinner.style.display = "none";
    displayAllBooks(filteredBooks);
  }, 1000);
});

// (async () => {
//   const resp = await axios.get(url);

//   filteredBooks = resp.data;
//   allBooks = resp.data;

//   setTimeout(() => {
//     spinner.style.display = "none";
//     displayAllBooks(filteredBooks);
//   }, 1000);
// })();

function displayAllBooks(books) {
  const totalPages = Math.ceil(books.length / itemsPerPage);

  if (totalPages <= 1) {
    nextBtn.parentElement.classList.add("disabled");
    prevBtn.parentElement.classList.add("disabled");
  } else {
    nextBtn.parentElement.classList.remove("disabled");
    prevBtn.parentElement.classList.remove("disabled");
  }

  pageStatus.innerHTML = "PAGE " + activePage + "/" + totalPages;

  const startIndex = (activePage - 1) * itemsPerPage;
  const endIndex = activePage * itemsPerPage;

  const slicedBooks = books.slice(startIndex, endIndex);

  tableBody.innerHTML = "";

  if (slicedBooks.length) {
    slicedBooks.forEach((book) => {
      const { img, title, author, year, id, favorite, archived } = book;

      const row = `<tr>
      <td>${id}</td>
      <td><img src="${img}" width="50" height="50" alt=""></td>
      <td>${title}</td>
      <td>${author.length ? author : "<strong>N/A</strong>"}</td>
      <td>${year ?? "<strong>N/A</strong>"}</td>
      <td class="d-flex align-items-center justify-content-around">
        <i onclick="handleIconsClick('${id}', 'heart', event)" class="fa fa-heart fs-5 ${
        favorite ? "text-success" : "text-danger"
      }"></i>
        <i onclick="handleIconsClick('${id}', 'archive', event)" class="fa fa-archive fs-5 ${
        archived ? "text-success" : "text-warning"
      }"></i>
      </td>
    </tr>`;

      tableBody.innerHTML += row;
    });

    // const favIcons = document.querySelectorAll("tr td i:first-child");
    // const archIcons = document.querySelectorAll("tr td i:last-child");

    // slicedBooks.forEach((book, index) => {
    //   generateClickEvents(book, index);
    // });

    // function generateClickEvents(book, index) {
    //   favIcons[index].addEventListener("click", () => {
    //     console.log("favIcons", book, index);
    //   });

    //   archIcons[index].addEventListener("click", () => {
    //     console.log("archIcons", book, index);
    //   });
    // }

    // console.log(favIcons, archIcons);
  } else {
    tableBody.innerHTML = `<tr>
    <td colspan="6" class="text-center">No Data Found</td>
  </tr>`;
  }
}

const handleIconsClick = (id, icon, e) => {
  if (e.target.className.includes("text-success")) {
    e.target.classList.remove("text-success");
    icon === "heart"
      ? e.target.classList.add("text-danger")
      : e.target.classList.add("text-warning");
  } else {
    e.target.classList.add("text-success");
    icon === "heart"
      ? e.target.classList.remove("text-danger")
      : e.target.classList.remove("text-warning");
  }

  const selectedBook = allBooks.find((book) => book.id == id);

  if (icon === "heart") {
    selectedBook.favorite = !selectedBook.favorite;
  }

  if (icon === "archive") {
    selectedBook.archived = !selectedBook.archived;
  }

  const newUrl = url + id;

  fetch(newUrl, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(selectedBook),
  })
    .then((res) => res.json())
    .then((data) => console.log(data))
    .catch((error) => console.log(error));
};

nextBtn.addEventListener("click", () => {
  if (activePage < filteredBooks.length / itemsPerPage) {
    activePage++;
    displayAllBooks(filteredBooks);
  }
});

prevBtn.addEventListener("click", () => {
  if (activePage > 1) {
    activePage--;
    displayAllBooks(filteredBooks);
  }
});

searchBtn.addEventListener("click", () => {
  if (searchInput.value.length) {
    clearBtn.style.display = "block";

    filteredBooks = filteredBooks.filter((book) => {
      return book.title.toLowerCase().includes(searchInput.value.toLowerCase());
    });

    displayAllBooks(filteredBooks);
  }
});

clearBtn.addEventListener("click", () => {
  searchInput.value = "";
  clearBtn.style.display = "none";
  displayAllBooks(allBooks);
});

for (let btn of navbarBtns) {
  btn.addEventListener("click", (e) => {
    if (e.target.id === "all") displayAllBooks(allBooks);

    if (e.target.id === "favorites")
      displayAllBooks(allBooks.filter((book) => book.favorite));

    if (e.target.id === "archive")
      displayAllBooks(allBooks.filter((book) => book.archived));

    if (e.target.id === "reading")
      displayAllBooks(allBooks.filter((book) => book.currently_reading));

    if (e.target.id === "finished")
      displayAllBooks(allBooks.filter((book) => book.finished_reading));

    if (e.target.id === "wish-list")
      displayAllBooks(allBooks.filter((book) => book.want_to_read));
  });
}
