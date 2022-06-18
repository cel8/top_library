
// Global variables
const inputs = document.querySelectorAll('input');
const libraryForm = document.querySelector('.library_form');
const libraryGrid = document.querySelector('.library');
const divStorage = document.querySelector('.storage');

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

libraryForm.onsubmit = (e) => {
  e.preventDefault();
  let book = getBookFrom();
  if(!library.isBookInLibrary(book.title, book.author)) {
    library.addBook(book);
    attachBook(book);
    resetBookForm();
    saveLocal();
    loadEmptyStorage();
  }
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
  img.setAttribute('class', 'icon');
  img.addEventListener('click', handler);
  li.appendChild(img);
  elemUl.appendChild(li);
}

function createBookIcons(read) {
  const div = document.createElement('div');
  div.className = 'book_icons';
  const ul = document.createElement('ul');
  const toggleReadIcon = (!read ? 'book-alert.svg' : 'book-check.svg');
  addIcon(ul, toggleReadIcon, 'unread', toggleBookRead);
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
  div.appendChild(pName);
  div.appendChild(pAuthor);
  div.appendChild(pNoPag);
  div.appendChild(createBookIcons(book.read));
  libraryGrid.appendChild(div);
}

function detachBook(bookDiv) {
  const str_name   = bookDiv.querySelector('.str_name');
  const str_author = bookDiv.querySelector('.str_author');
  if(library.isBookInLibrary(str_name.textContent, str_author.textContent)) {
    library.removeBook(str_name.textContent, str_author.textContent);
    bookDiv.remove();
    saveLocal();
    loadEmptyStorage();
  }
}

function toggleBookRead(e) {
  const bookDiv = e.target.closest('.book');
  const str_name   = bookDiv.querySelector('.str_name');
  const str_author = bookDiv.querySelector('.str_author');
  const book = library.getBook(str_name.textContent, str_author.textContent);
  if(book != undefined) {
    book.read = !book.read;
    e.target.setAttribute('src', (!book.read ? './resources/images/svg/book-alert.svg'
                                             : './resources/images/svg/book-check.svg'));
    saveLocal();
  }
}

function editBook(e) {

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
    detachBook(libraryGrid.lastChild);/* Removing the last child of the libraryGrid element. */
    libraryGrid.removeChild(libraryGrid.lastChild);
  }
}
