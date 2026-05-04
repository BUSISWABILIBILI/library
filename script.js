const myLibrary = [];

/**
 * Book constructor
 * @param {string} title
 * @param {string} author
 * @param {number} pages
 * @param {boolean} read
 */
function Book(title, author, pages, read) {
  this.id = crypto.randomUUID();
  this.title = title;
  this.author = author;
  this.pages = Number(pages);
  this.read = Boolean(read);
}

Book.prototype.toggleRead = function () {
  this.read = !this.read;
};

function addBookToLibrary(title, author, pages, read) {
  const book = new Book(title, author, pages, read);
  myLibrary.push(book);
  return book;
}

function removeBookById(id) {
  const index = myLibrary.findIndex((b) => b.id === id);
  if (index !== -1) myLibrary.splice(index, 1);
}

const libraryGrid = document.getElementById("library-grid");
const emptyState = document.getElementById("empty-state");
const bookCount = document.getElementById("book-count");

/**
 * Build a single book card element
 * @param {Book} book
 * @returns {HTMLElement}
 */

function createBookCard(book) {
  const card = document.createElement("article");
  card.classList.add("book-card");
  if (book.read) card.classList.add("read");
  card.dataset.id = book.id;

  card.innerHTML = `
    <div class="book-title">${escapeHtml(book.title)}</div>
    <div class="book-author">${escapeHtml(book.author)}</div>
    <div class="book-meta">
      <span>${book.pages.toLocaleString()} pages</span>
    </div>
    <span class="read-badge ${book.read ? "read" : "unread"}">
      ${book.read ? "Read" : "Unread"}
    </span>
    <div class="card-actions">
      <button class="btn-toggle" data-id="${book.id}">
        Mark ${book.read ? "Unread" : "Read"}
      </button>
      <button class="btn-remove" data-id="${book.id}">Remove</button>
    </div>
  `;

  return card;
}

/** Render/refresh the full library display */
function displayLibrary() {
  libraryGrid.innerHTML = "";

  if (myLibrary.length === 0) {
    emptyState.style.display = "flex";
    bookCount.textContent = "0 books";
    return;
  }

  emptyState.style.display = "none";
  bookCount.textContent = `${myLibrary.length} book${myLibrary.length !== 1 ? "s" : ""}`;

  myLibrary.forEach((book) => {
    libraryGrid.appendChild(createBookCard(book));
  });
}

/** Simple HTML escape to prevent XSS */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ── Event Delegation: card buttons ───────────────────────────────────

libraryGrid.addEventListener("click", (e) => {
  const id = e.target.dataset.id;
  if (!id) return;

  if (e.target.classList.contains("btn-toggle")) {
    const book = myLibrary.find((b) => b.id === id);
    if (book) {
      book.toggleRead();
      displayLibrary();
    }
  }

  if (e.target.classList.contains("btn-remove")) {
    removeBookById(id);
    displayLibrary();
  }
});

// ── Dialog / Form ─────────────────────────────────────────────────────

const dialog = document.getElementById("book-dialog");
const form = document.getElementById("book-form");
const newBookBtn = document.getElementById("new-book-btn");
const cancelBtn = document.getElementById("cancel-btn");
const closeBtn = document.getElementById("dialog-close");

function openDialog() {
  form.reset();
  clearValidation();
  dialog.showModal();
}

function closeDialog() {
  dialog.close();
}

newBookBtn.addEventListener("click", openDialog);
cancelBtn.addEventListener("click", closeDialog);
closeBtn.addEventListener("click", closeDialog);

// Close on backdrop click
dialog.addEventListener("click", (e) => {
  if (e.target === dialog) closeDialog();
});

// ── Form Submission ───────────────────────────────────────────────────

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const titleInput = document.getElementById("title");
  const authorInput = document.getElementById("author");
  const pagesInput = document.getElementById("pages");
  const readInput = document.getElementById("read");

  let valid = true;

  [titleInput, authorInput, pagesInput].forEach((input) => {
    if (!input.value.trim()) {
      input.classList.add("invalid");
      valid = false;
    } else {
      input.classList.remove("invalid");
    }
  });

  if (!valid) return;

  addBookToLibrary(
    titleInput.value.trim(),
    authorInput.value.trim(),
    pagesInput.value,
    readInput.checked,
  );

  displayLibrary();
  closeDialog();
});

function clearValidation() {
  document.querySelectorAll(".field input").forEach((input) => {
    input.classList.remove("invalid");
  });
}

displayLibrary();
