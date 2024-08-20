importScripts('storageHandler.js');
importScripts('parser.js');

chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'update') {
    const previousVersion = details.previousVersion;
    const currentVersion = chrome.runtime.getManifest().version;
    console.log(`Updating from version ${previousVersion} to ${currentVersion}`);

    if (previousVersion < '1.1.0') {
      try {
        const books = await getLocalData('books') || [];
        const migratedBooks = books.map((book) => ({
          ...book,
          mainLink:
            book.mainLink ||
            `https://asuracomic.net/series/${book.bookName
              .replace(/\s+/g, '-')
              .toLowerCase()}/chapter/${book.chapterNumber}`,
        }));
        await setLocalData('books', migratedBooks);
        console.log('Data migration completed.');
      } catch (error) {
        console.error('Error during data migration:', error);
      }
    }
  }
});

chrome.runtime.onStartup.addListener(async () => {
  try {
    const books = await getLocalData('books') || [];
    if (books.length === 0) {
      await pullDataFromCloud();
    } else {
      const shouldSyncResult = await shouldSync();
      if (shouldSyncResult) {
        await syncDataToCloud();
      }
    }
  } catch (error) {
    console.error('Error during startup:', error);
  }
});

let notificationsDisabledLogged = false;

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  try {
    const notificationsEnabled = (await getLocalData('notificationsEnabled')) !== false;
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
        const bookIndex = books.findIndex((b) => b.bookName === bookName);

        if (bookIndex !== -1) {
          books.splice(bookIndex, 1);
          books.unshift({ bookName, chapterNumber, mainLink });
          bookIndex == 0;
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
              const lastNotification = (await getLocalData('notificationData')) || {
                bookName: null,
                chapterNumber: null,
              };
              if (lastNotification.bookName !== bookName || lastNotification.chapterNumber !== chapterNumber) {
                chrome.notifications.create(
                  {
                    type: 'basic',
                    iconUrl: 'icons/icon.png',
                    title: 'Update Chapter',
                    message: `You are on a new chapter of ${bookName}. Do you want to update the chapter number?`,
                    buttons: [{ title: 'Yes' }, { title: 'No' }],
                    requireInteraction: true,
                  },
                  async (notificationId) => {
                    console.log('Notification created with ID:', notificationId);
                    await setLocalData('notificationData', { notificationId, bookName, chapterNumber });
                  }
                );
              } else {
                console.log('Notification not created because it matches the last notification.');
              }
            }
          }
        } else {
          const lastNotification = (await getLocalData('notificationData')) || {
            bookName: null,
            chapterNumber: null,
          };
          if (lastNotification.bookName !== bookName || lastNotification.chapterNumber !== chapterNumber) {
            chrome.notifications.create(
              {
                type: 'basic',
                iconUrl: 'icons/icon.png',
                title: 'Add Book to Directory',
                message: `Do you want to add ${bookName} (Chapter ${chapterNumber}) to the directory?`,
                buttons: [{ title: 'Yes' }, { title: 'No' }],
                requireInteraction: true,
              },
              async (notificationId) => {
                console.log('Notification created with ID:', notificationId);
                await setLocalData('notificationData', { notificationId, bookName, chapterNumber, mainLink });
              }
            );
          } else {
            console.log('Notification not created because it matches the last notification.');
          }
        }
      }
    }
  } catch (error) {
    console.error('Error during tab update:', error);
  }
});

chrome.notifications.onButtonClicked.addListener(async (notificationId, buttonIndex) => {
  try {
    console.log('Notification button clicked:', notificationId, buttonIndex);
    const { notificationId: savedNotificationId, bookName, chapterNumber, mainLink } =
      (await getLocalData('notificationData')) || {};
    if (notificationId === savedNotificationId && buttonIndex === 0) {
      let books = await getLocalData('books') || [];
      const bookIndex = books.findIndex((b) => b.bookName === bookName);
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
  } catch (error) {
    console.error('Error handling notification click:', error);
  }
});
