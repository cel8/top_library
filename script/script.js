
// Global variables
const inputs = document.querySelectorAll('input');
const libraryForm = document.querySelector('.library_form');
const libraryGrid = document.querySelector('.library');
const divStorage = document.querySelector('.storage');
const btnCancel = document.querySelector('.cancel');
const btnToggleForm = document.querySelector('.toggle_library_form');
const icons = document.querySelectorAll('.icon');
let editBookDiv = null;
let openForm = false;

const patterns = {
  title:  /^[A-zÀ-ž0-9\s'.,\-&#*():;?\/\\]{1,200}$/i,
  author: /^[A-zÀ-ž]{1,50}[A-zÀ-ž0-9\s'.\-]{0,50}$/i,
  pages:  /^(?!(0))[0-9]{1,10}$/
}

const alerts = {
  title:  `Title of the book (max 200 characters)`,
  author: `Author of the book (max 50 characters)`,
  pages:  `Pages of the book (max 10 digits)`
}

// Data structure
class Book {
  constructor(title = 'Unknown', author = 'Unknown', nPages = 0, read = false) {
    this.title = title;
    this.author = author;
    this.nPages = nPages;
    this.read = read;
  }
}

class Library {
  constructor() {
    this.books = [];
  }
  addBook(book) {
    this.books.push(book);
  }
  removeBook(title, author) {
    this.books = this.books.filter((b) => !((title === b.title) && (author === b.author)));
  }
  editBook(title, author, book) {
    const index = this.books.findIndex((b) => (title === b.title) && (author === b.author));
    if(-1 != index) {
      this.books[index].title  = book.title;
      this.books[index].author = book.author;
      this.books[index].nPages = book.nPages;
      this.books[index].read   = book.read;
    }
  }
  getBook(title, author) {
    return this.books.find((b) => (title === b.title) && (author === b.author));
  }
  isBookInLibrary(title, author) {
    return this.books.some((b) => (title === b.title) && (author === b.author));
  }
}

let library = undefined;

// Events
window.addEventListener('load', () => {
  library = new Library();
  restoreLocal();
  library.books.forEach(book => {
    attachBook(book);
  });
  loadEmptyStorage();
});

inputs.forEach((input) => {
  input.addEventListener('keyup', (e) => {
    if(undefined != e.target.attributes.name) {
      validate(e.target, patterns[e.target.attributes.name.value]);
    }
  });
});

libraryForm.addEventListener('invalid', (e) => {
  e.preventDefault();
}, true);

btnCancel.addEventListener('click', (e) => {
  resetBookForm();
  resetEditBook();
});

btnToggleForm.addEventListener('click', (e) => {
  const storageText = document.querySelector('.storage_text');
  const content = document.querySelector('.content');
  const sideContainer = document.querySelector('.side_visible_container');
  if(!openForm) {
    libraryForm.style.display = 'flex';
    storageText.style.display = 'block';
    btnToggleForm.textContent = 'Close';
    sideContainer.style.flexDirection = 'column';
    sideContainer.style.alignItems = 'stretch';
    content.style.gridTemplateColumns = '13.5rem 2fr';
    openForm = true;
  } else {
    libraryForm.style.display = 'none';
    storageText.style.display = 'none';
    btnToggleForm.innerHTML = 'A<br>d<br>d<br> <br>n<br>e<br>w<br> <br>b<br>o<br>o<br>k';
    sideContainer.style.flexDirection = 'column-reverse';
    sideContainer.style.alignItems = 'center';
    content.style.gridTemplateColumns = '0fr 2fr';
    openForm = false;
  }
});

libraryForm.onsubmit = (e) => {
  e.preventDefault();
  let book = getBookFrom();
  if(editBookDiv != null) {
    const borrowed = borrowBook(editBookDiv);    
    if(!library.isBookInLibrary(book.title, book.author) || 
        isBookEditable(book, borrowed)) {
      library.editBook(borrowed.title, borrowed.author, book);
      updateBook(borrowed, book);
    }
  } else {
    if(!library.isBookInLibrary(book.title, book.author)) {
      library.addBook(book);
      attachBook(book);
    }
  }
  saveLocal();
  loadEmptyStorage();
  resetBookForm();
  resetEditBook();
};

// Internal functions
function addCustomValidationText(fieldName, valid = false) {
  const field = document.querySelector(`div[data-key="${fieldName}"]`);
  field.textContent = !valid ? alerts[fieldName] : '';
}

function validate(field, regex) {
  if(regex.test(field.value)) {
    field.setCustomValidity('');
    addCustomValidationText(field.name, true);
  } else {
    field.setCustomValidity('invalid');
    addCustomValidationText(field.name);
  }
}

function getBookFrom() {
  const title  = document.getElementById('title');
  const author = document.getElementById('author');
  const pages  = document.getElementById('pages');
  const read   = document.getElementById('read');
  return new Book(title.value, author.value, pages.value, read.checked);
}

function loadBookForm() {
  const title  = document.getElementById('title');
  const author = document.getElementById('author');
  const pages  = document.getElementById('pages');
  const read   = document.getElementById('read');
  const book = borrowBook(editBookDiv);
  if(book != undefined) {
    title.value = book.title;
    author.value = book.author;
    pages.value = book.nPages;
    read.checked = book.read;
  } else {
    editBookDiv = null;
  }
}

function resetBookForm() {
  const title  = document.getElementById('title');
  const author = document.getElementById('author');
  const pages  = document.getElementById('pages');
  const read   = document.getElementById('read');
  title.value = '';
  author.value = '';
  pages.value = '';
  read.checked = false;
}

function addIcon(elemUl, iconName, altName, handler) {
  const svgName = './resources/images/svg/' + iconName;
  const li = document.createElement('li');
  const img = document.createElement('img');
  img.setAttribute('src', svgName);
  img.setAttribute('alt', altName);
  img.setAttribute('class', altName + ' icon');
  img.addEventListener('click', handler);
  li.appendChild(img);
  elemUl.appendChild(li);
}

function createBookIcons(read) {
  const div = document.createElement('div');
  div.className = 'book_icons';
  const ul = document.createElement('ul');
  const toggleReadIcon = (!read ? 'book-alert.svg' : 'book-check.svg');
  addIcon(ul, toggleReadIcon, 'readFlag', toggleBookRead);
  addIcon(ul, 'book-edit.svg', 'edit', editBook);
  addIcon(ul, 'book-cancel.svg', 'cancel', removeBook);
  div.appendChild(ul);
  return div;
}

function removeBook(e) {
  const bookDiv = e.target.closest('.book');
  detachBook(bookDiv);
}

function attachBook(book) {
  const div = document.createElement('div');
  div.className = 'book';
  const pName   = document.createElement('p');
  pName.textContent = book.title;
  pName.className = 'str_name';
  const pAuthor = document.createElement('p');
  pAuthor.textContent = book.author;
  pAuthor.className = 'str_author';
  const pNoPag  = document.createElement('p');
  pNoPag.textContent = book.nPages;
  pNoPag.className = 'str_pages';
  div.appendChild(pName);
  div.appendChild(pAuthor);
  div.appendChild(pNoPag);
  div.appendChild(createBookIcons(book.read));
  libraryGrid.appendChild(div);
}

function detachBook(bookDiv) {
  const book = borrowBook(bookDiv);
  if(book != undefined) {
    library.removeBook(book.title, book.author);
    bookDiv.remove();
    saveLocal();
    loadEmptyStorage();
  }
}

function toggleBookRead(e) {
  const bookDiv = e.target.closest('.book');
  const book = borrowBook(bookDiv);
  if(book != undefined) {
    book.read = !book.read;
    const iconName = (!book.read ? 'book-alert.svg' : 'book-check.svg');
    const svgName = './resources/images/svg/' + iconName;
    e.target.setAttribute('src', svgName);
    saveLocal();
  }
}

function editBook(e) {
  const bookDiv = e.target.closest('.book');
  if(editBookDiv != null) {
    let book = getBookFrom();
    const borrowed = borrowBook(editBookDiv);
    if(!library.isBookInLibrary(book.title, book.author) || 
        isBookEditable(book, borrowed)) {
      library.editBook(borrowed.title, borrowed.author, book);
      updateBook(borrowed, book);
      saveLocal();
      loadEmptyStorage();
    }
    resetEditBook();
    resetBookForm();
  } else {
    editBookDiv = bookDiv;
    setEditBook();
    loadBookForm();
  }
}

// Editable book when primary key does not change, but secondary fields do
function isBookEditable(bookA, bookB) {
  return (((bookA.title === bookB.title) && (bookA.author === bookB.author)) &&
          ((bookA.nPages !== bookB.nPages) || (bookA.read !== bookB.read)));
}

function borrowBook(bookDiv) {
  const str_name   = bookDiv.querySelector('.str_name');
  const str_author = bookDiv.querySelector('.str_author');
  const book = library.getBook(str_name.textContent, str_author.textContent);
  return book;
}

function updateBook(borrowed, newBook) {
  const pName = editBookDiv.querySelector('.str_name');
  pName.textContent = newBook.title;
  const pAuthor = editBookDiv.querySelector('.str_author');
  pAuthor.textContent = newBook.author;
  const pNoPag = editBookDiv.querySelector('.str_pages');
  pNoPag.textContent = newBook.nPages;
  if(borrowed.read != newBook.read) {
    const toggleReadIcon = (!newBook.read ? 'book-alert.svg' : 'book-check.svg');
    const svgName = './resources/images/svg/' + toggleReadIcon;
    const imgToggleReadIcon = editBookDiv.querySelector('.readFlag');
    imgToggleReadIcon.setAttribute('src', svgName);
  }
}

function setEditBook() {
  const iconName = 'book-lock.svg';
  const svgName = './resources/images/svg/' + iconName;
  const imgEdit = editBookDiv.querySelector('.edit');
  imgEdit.setAttribute('src', svgName);
}

function resetEditBook() {
  if(editBookDiv != null) {
    const iconName = 'book-edit.svg';
    const svgName = './resources/images/svg/' + iconName;
    const imgEdit = editBookDiv.querySelector('.edit');
    imgEdit.setAttribute('src', svgName);
    editBookDiv = null;
  }
}

function saveLocal() {
  localStorage.setItem('library', JSON.stringify(library.books));
}

function restoreLocal() {
  const books = JSON.parse(localStorage.getItem('library'));
  if(books) {
    library.books = books.map((book) => new Book(book.title, book.author, book.nPages, book.read));
  } else {
    library.books = [];
  }
}

function loadEmptyStorage() {
  const div = divStorage.querySelector('div');
  const img = divStorage.querySelector('img');
  const emptyLibrary = (library && library.books.length > 0);
  const icon = emptyLibrary ? 'delete.svg' : 'delete-empty.svg';
  div.textContent = emptyLibrary ? 'Delete local storage' : 'Empty local storage';
  const svgName = './resources/images/svg/' + icon;
  img.setAttribute('src', svgName);
  img.setAttribute('alt', 'storage');
  img.setAttribute('class', 'icon');
  if(emptyLibrary) img.addEventListener('click', emptyLocal);
}

function emptyLocal() {
  localStorage.setItem('library', null);
  while(libraryGrid.lastChild) {
    /* Removing the last child of the libraryGrid element. */
    detachBook(libraryGrid.lastChild);
    libraryGrid.removeChild(libraryGrid.lastChild);
  }
}

icons.forEach(i => {
  i.setAttribute("draggable", false);
});