importScripts('storageHandler.js');
importScripts('parser.js');

chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'update') {
    const previousVersion = details.previousVersion;
    const currentVersion = chrome.runtime.getManifest().version;
    console.log(`Updating from version ${previousVersion} to ${currentVersion}`);

    // Perform migration if necessary
    if (previousVersion < '1.1.0') {
      const books = await getLocalData('books') || [];
      const migratedBooks = books.map(book => {
        // Perform any necessary data transformations
        return {
          ...book,
          // Add mainLink if it doesn't exist
          mainLink: book.mainLink || `https://asuracomic.net/series/${book.bookName.replace(/\s+/g, '-').toLowerCase()}/chapter/${book.chapterNumber}`
        };
      });
      await setLocalData('books', migratedBooks);
      console.log('Data migration completed.');
    }
  }
});

chrome.runtime.onStartup.addListener(async () => {
  const books = await getLocalData('books') || [];
  if (books.length === 0) {
    await pullDataFromCloud();
  } else {
    const shouldSyncResult = await shouldSync();
    if (shouldSyncResult) {
      await syncDataToCloud();
    }
  }
});

let notificationsDisabledLogged = false;

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  const notificationsEnabled = await getLocalData('notificationsEnabled') !== false;
  if (!notificationsEnabled) {
    if (!notificationsDisabledLogged) {
      console.log('Notifications are disabled.');
      notificationsDisabledLogged = true;
    }
    return;
  }

  notificationsDisabledLogged = false;

  if (changeInfo.status === 'complete' && tab.url) {
    const [bookName, chapterNumber, mainLink] = parseLink(tab.url);
    console.log('Parsed link:', bookName, chapterNumber, mainLink);
    if (bookName && chapterNumber && mainLink) {
      let books = await getLocalData('books') || [];
      const bookIndex = books.findIndex(b => b.bookName === bookName);

      if (bookIndex !== -1) {
        const book = books[bookIndex];
        if (mainLink !== book.mainLink) {
          books[bookIndex].mainLink = mainLink;
          await setLocalData('books', books);
          console.log('Main link updated:', mainLink);
        }

        if (chapterNumber > book.chapterNumber) {
          if (chapterNumber - book.chapterNumber <= 3) {
            books[bookIndex].chapterNumber = chapterNumber;
            console.log('Chapter number updated automatically:', chapterNumber);
            await setLocalData('books', books);
          } else {
            chrome.notifications.create({
              type: 'basic',
              iconUrl: 'icons/icon.png',
              title: 'Update Chapter',
              message: `You are on a new chapter of ${bookName}. Do you want to update the chapter number?`,
              buttons: [{ title: 'Yes' }, { title: 'No' }],
              requireInteraction: true,
            }, (notificationId) => {
              console.log('Notification created with ID:', notificationId);
              setLocalData('notificationData', { notificationId, bookName, chapterNumber });
            });
          }
        }
      } else {
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icons/icon.png',
          title: 'Add Book to Directory',
          message: `Do you want to add ${bookName} (Chapter ${chapterNumber}) to the directory?`,
          buttons: [{ title: 'Yes' }, { title: 'No' }],
          requireInteraction: true,
        }, (notificationId) => {
          console.log('Notification created with ID:', notificationId);
          setLocalData('notificationData', { notificationId, bookName, chapterNumber, mainLink });
        });
      }
    }
  }
});

chrome.notifications.onButtonClicked.addListener(async (notificationId, buttonIndex) => {
  console.log('Notification button clicked:', notificationId, buttonIndex);
  const { notificationId: savedNotificationId, bookName, chapterNumber, mainLink } = await getLocalData('notificationData');
  if (notificationId === savedNotificationId && buttonIndex === 0) {
    let books = await getLocalData('books') || [];
    const bookIndex = books.findIndex(b => b.bookName === bookName);
    if (bookIndex !== -1) {
      books[bookIndex].chapterNumber = chapterNumber;
      books[bookIndex].mainLink = mainLink;
      console.log('Chapter number updated:', books[bookIndex]);
    } else {
      books.push({ bookName, chapterNumber, mainLink });
      console.log('Book added:', { bookName, chapterNumber, mainLink });
    }
    await setLocalData('books', books);
    console.log('Books updated in storage:', books);
    chrome.notifications.clear(notificationId, () => {
      console.log('Notification cleared:', notificationId);
    });
  } else {
    chrome.notifications.clear(notificationId, () => {
      console.log('Notification cleared:', notificationId);
    });
  }
});