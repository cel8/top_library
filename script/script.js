
// Global variables
const inputs = document.querySelectorAll('input');
const libraryForm = document.querySelector('.library_form');
const libraryGrid = document.querySelector('.library');

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
    this.library = [];
  }
  addBook(book) {
    this.library.push(book);
  }
  removeBook(title, author) {
    this.library = this.library.filter((b) => !((title === b.title) && (author === b.author)));
  }
  getBook(title, author) {
    return this.library.find((b) => (title === b.title) && (author === b.author));
  }
  isBookInLibrary(title, author) {
    return this.library.some((b) => (title === b.title) && (author === b.author));
  }
}

let library = new Library();

// Events
window.addEventListener('load', () => {
  // initialize();
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
  let book = getBook();
  if(!library.isBookInLibrary(book.title, book.author)) {
    library.addBook(book);
    attachBook(book);
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

function getBook() {
  const title  = document.getElementById('title');
  const author = document.getElementById('author');
  const pages  = document.getElementById('pages');
  const read   = document.getElementById('read');
  return new Book(title.value, author.value, pages.value, read.checked);
}

function createBookIcons(read) {
  const div = document.createElement('div');
  div.className = 'book_icons';
  const ul = document.createElement('ul');
  const liRead = document.createElement('li');
  const imgRead = document.createElement('img');
  imgRead.setAttribute('src', (!read ? './resources/images/svg/book-alert.svg'
                                     : './resources/images/svg/book-check.svg'));
  imgRead.setAttribute('alt', 'unread');
  imgRead.setAttribute('class', 'icon');
  imgRead.addEventListener('click', toggleBookRead);
  liRead.appendChild(imgRead);
  const liCancel = document.createElement('li');
  const imgCancel = document.createElement('img');
  imgCancel.setAttribute('src', './resources/images/svg/book-cancel.svg');
  imgCancel.setAttribute('alt', 'cancel');
  imgCancel.setAttribute('class', 'icon');
  imgCancel.addEventListener('click', detachBook);
  liCancel.appendChild(imgCancel);
  ul.appendChild(liRead);
  ul.appendChild(liCancel);
  div.appendChild(ul);
  return div;
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

function detachBook(e) {
  const bookDiv = e.target.closest('.book');
  const str_name   = bookDiv.querySelector('.str_name');
  const str_author = bookDiv.querySelector('.str_author');
  if(library.isBookInLibrary(str_name.textContent, str_author.textContent)) {
    library.removeBook(str_name.textContent, str_author.textContent);
    bookDiv.remove();
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
  }

}
