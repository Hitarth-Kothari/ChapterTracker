document.addEventListener('DOMContentLoaded', async function() {
  const saveButton = document.getElementById('save');
  const linkInput = document.getElementById('link-input');
  const booksList = document.getElementById('books-list');
  const toggleInputs = document.getElementById('toggle-inputs');
  const inputContainer = document.getElementById('input-container');
  const customCheckbox = document.getElementById('custom-checkbox');
  const toggleNotifications = document.getElementById('toggle-notifications');
  const notificationsCheckbox = document.getElementById('notifications-checkbox');
  const searchBar = document.getElementById('search-bar');

  // Load notification setting
  const notificationsEnabled = await getLocalData('notificationsEnabled') !== false;
  toggleNotifications.checked = notificationsEnabled;
  notificationsCheckbox.classList.toggle('bg-green-500', notificationsEnabled);
  notificationsCheckbox.classList.toggle('bg-gray-600', !notificationsEnabled);

  // Toggle input fields visibility and checkbox style
  toggleInputs.addEventListener('change', function() {
    inputContainer.classList.toggle('hidden', !this.checked);
    customCheckbox.classList.toggle('bg-green-500', this.checked);
    customCheckbox.classList.toggle('bg-gray-600', !this.checked);
  });

  // Toggle notifications
  toggleNotifications.addEventListener('change', function() {
    const enabled = this.checked;
    setLocalData('notificationsEnabled', enabled);
    notificationsCheckbox.classList.toggle('bg-green-500', enabled);
    notificationsCheckbox.classList.toggle('bg-gray-600', !enabled);
  });

  // Load saved books from local storage first, then fall back to sync storage if empty
  let books = await getLocalData('books') || [];
  console.log(books);
  if (books.length === 0) {
    await pullDataFromCloud();
    books = await getLocalData('books') || [];
  }
  books.forEach(book => addBookToDOM(book));

  // Save book
  saveButton.addEventListener('click', async function() {
    const link = linkInput.value.trim();
    if (link) {
      const [bookName, chapterNumber, mainLink] = parseLink(link);
      if (bookName && chapterNumber && mainLink) {
        let books = await getLocalData('books') || [];
        const existingBookIndex = books.findIndex(b => b.bookName === bookName);
        if (existingBookIndex !== -1) {
          // Update existing book
          books[existingBookIndex].chapterNumber = chapterNumber;
          books[existingBookIndex].mainLink = mainLink;
        } else {
          // Add new book
          books.push({ bookName, chapterNumber, mainLink });
        }
        await setLocalData('books', books);
        addBookToDOM({ bookName, chapterNumber, mainLink });
        linkInput.value = '';
      }
    }
  });

  // Add book to DOM
  function addBookToDOM(book) {
    const bookItem = document.createElement('div');
    bookItem.className = 'flex justify-between items-center bg-gray-800 text-white p-1 mb-1 border border-gray-600 rounded-lg shadow relative';

    const textElement = document.createElement('span');
    textElement.textContent = `${book.bookName}`;
    textElement.className = 'cursor-pointer';
    textElement.addEventListener('click', function() {
      window.open(book.mainLink, '_blank');
    });

    const numberInputContainer = document.createElement('div');
    numberInputContainer.className = 'flex items-center';

    const numberInput = document.createElement('input');
    numberInput.type = 'number';
    numberInput.value = book.chapterNumber;
    numberInput.className = 'bg-gray-800 border border-gray-600 flex items-center text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-1 w-16 mr-2';
    numberInput.addEventListener('change', async function() {
      const newChapterNumber = numberInput.value;
      let books = await getLocalData('books') || [];
      const updatedBooks = books.map(b => {
        if (b.bookName === book.bookName) {
          return { bookName: b.bookName, chapterNumber: newChapterNumber, mainLink: b.mainLink };
        }
        return b;
      });
      await setLocalData('books', updatedBooks);
    });

    const deleteStrip = document.createElement('div');
    deleteStrip.className = 'absolute top-0 right-0 h-full w-2 bg-red-600 hover:bg-red-700 cursor-pointer rounded-r-2xl';
    deleteStrip.addEventListener('click', async function(event) {
      event.stopPropagation();  // Prevent any other click event
      let books = await getLocalData('books') || [];
      const newBooks = books.filter(b => b.bookName !== book.bookName || b.chapterNumber !== book.chapterNumber);
      await setLocalData('books', newBooks);
      booksList.removeChild(bookItem);
    });

    numberInputContainer.appendChild(numberInput);
    bookItem.appendChild(textElement);
    bookItem.appendChild(numberInputContainer);
    bookItem.appendChild(deleteStrip);

    booksList.appendChild(bookItem);
  }

  searchBar.addEventListener('input', async function() {
    const query = this.value.trim().toLowerCase();
    let books = await getLocalData('books') || [];
    const filteredBooks = books.filter(book => book.bookName.toLowerCase().includes(query));
    booksList.innerHTML = '';
    filteredBooks.forEach(book => addBookToDOM(book));
  });
});
