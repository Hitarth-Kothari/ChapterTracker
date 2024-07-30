importScripts('utils.js');

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  console.log('Tab updated:', tabId, changeInfo, tab);
  if (changeInfo.status === 'complete' && tab.url) {
    const [bookName, chapterNumber] = parseLink(tab.url);
    console.log('Parsed link:', bookName, chapterNumber);
    if (bookName && chapterNumber) {
      chrome.storage.local.get(['books', 'notificationsEnabled'], function(result) {
        const books = result.books || [];
        const notificationsEnabled = result.notificationsEnabled !== false;
        const book = books.find(b => b.bookName === bookName);

        if (!notificationsEnabled) {
          console.log('Notifications are disabled.');
          return;
        }

        if (book) {
          if (chapterNumber > book.chapterNumber) {
            chrome.notifications.create({
              type: 'basic',
              iconUrl: 'chrome_icon.png', // Relative to manifest.json
              title: 'Update Chapter',
              message: `You are on a new chapter of ${bookName}. Do you want to update the chapter number?`,
              buttons: [{ title: 'Yes' }, { title: 'No' }],
              requireInteraction: true,
            }, (notificationId) => {
              console.log('Notification created with ID:', notificationId);
              // Save the context with the notification ID
              chrome.storage.local.set({ notificationId, bookName, chapterNumber });
            });
          }
        } else {
          chrome.notifications.create({
            type: 'basic',
            iconUrl: 'chrome_icon.png', // Relative to manifest.json
            title: 'Add Book to Directory',
            message: `Do you want to add ${bookName} (Chapter ${chapterNumber}) to the directory?`,
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
      const bookIndex = books.findIndex(b => b.bookName === result.bookName);
      if (bookIndex !== -1) {
        books[bookIndex].chapterNumber = result.chapterNumber;
        console.log('Chapter number updated:', books[bookIndex]);
      } else {
        books.push({ bookName: result.bookName, chapterNumber: result.chapterNumber });
        console.log('Book added:', { bookName: result.bookName, chapterNumber: result.chapterNumber });
      }
      chrome.storage.local.set({ books }, () => {
        console.log('Books updated in storage:', books);
      });
      chrome.notifications.clear(notificationId, () => {
        console.log('Notification cleared:', notificationId);
      });
    } else {
      chrome.notifications.clear(notificationId, () => {
        console.log('Notification cleared:', notificationId);
      });
    }
  });
});
