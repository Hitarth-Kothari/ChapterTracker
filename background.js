chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    console.log('Tab updated:', tabId, changeInfo, tab);
    if (changeInfo.status === 'complete' && tab.url) {
      const [bookName, chapterNumber] = parseLink(tab.url);
      console.log('Parsed link:', bookName, chapterNumber);
      if (bookName && chapterNumber) {
        chrome.storage.local.get(['books'], function(result) {
          const books = result.books || [];
          const book = books.find(b => b.bookName === bookName);
          console.log('Books from storage:', books);
          if (book && chapterNumber > book.chapterNumber) {
            console.log('New chapter detected:', bookName, chapterNumber);
            chrome.notifications.create({
              type: 'basic',
              iconUrl: 'chrome_icon.png', // Relative to manifest.json
              title: 'New Chapter Detected',
              message: `You are on a new chapter of ${bookName}. Do you want to update it?`,
              buttons: [{ title: 'Yes' }, { title: 'No' }],
              requireInteraction: true,
            }, (notificationId) => {
              console.log('Notification created with ID:', notificationId);
              // Save the context with the notification ID
              chrome.storage.local.set({ notificationId, bookName, chapterNumber });
            });
          }
        });
      }
    }
  });
  
  chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
    console.log('Notification button clicked:', notificationId, buttonIndex);
    chrome.storage.local.get(['notificationId', 'bookName', 'chapterNumber', 'books'], function(result) {
      if (notificationId === result.notificationId && buttonIndex === 0) {
        const books = result.books || [];
        const updatedBooks = books.map(b => {
          if (b.bookName === result.bookName) {
            return { bookName: b.bookName, chapterNumber: result.chapterNumber };
          }
          return b;
        });
        chrome.storage.local.set({ books: updatedBooks }, () => {
          console.log('Books updated in storage:', updatedBooks);
        });
        chrome.notifications.clear(notificationId, () => {
          console.log('Notification cleared:', notificationId);
        });
      }
    });
  });
  
  function parseLink(link) {
    try {
      const url = new URL(link);
      const parts = url.pathname.split('/');
      const chapterNumber = parseInt(parts.pop(), 10);
      let bookNameParts = parts.slice(2, -1).join(' ').split('-');
      bookNameParts.pop();
      const bookName = bookNameParts.join(' ');
      const capitalizedBookName = bookName.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  
      return [capitalizedBookName, chapterNumber];
    } catch (error) {
      console.error('Error parsing link:', error);
      return [null, null];
    }
  }
  