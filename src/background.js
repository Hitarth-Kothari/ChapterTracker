importScripts('storageHandler.js');
importScripts('parser.js');

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
    const [bookName, chapterNumber] = parseLink(tab.url);
    console.log('Parsed link:', bookName, chapterNumber);
    if (bookName && chapterNumber) {
      const result = await getLocalData('books');
      const books = result || [];

      const book = books.find(b => b.bookName === bookName);

      if (book) {
        if (chapterNumber > book.chapterNumber) {
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
          setLocalData('notificationData', { notificationId, bookName, chapterNumber });
        });
      }
    }
  }
});

chrome.notifications.onButtonClicked.addListener(async (notificationId, buttonIndex) => {
  console.log('Notification button clicked:', notificationId, buttonIndex);
  const { notificationId: savedNotificationId, bookName, chapterNumber } = await getLocalData('notificationData');
  if (notificationId === savedNotificationId && buttonIndex === 0) {
    const books = await getLocalData('books') || [];
    const bookIndex = books.findIndex(b => b.bookName === bookName);
    if (bookIndex !== -1) {
      books[bookIndex].chapterNumber = chapterNumber;
      console.log('Chapter number updated:', books[bookIndex]);
    } else {
      books.push({ bookName, chapterNumber });
      console.log('Book added:', { bookName, chapterNumber });
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

async function syncDataToCloud() {
  const books = await getLocalData('books') || [];
  if (books.length > 0) {
    await clearSyncData();
    await setSyncData('books', books);
    const now = Date.now();
    await setSyncData('lastSyncTime', now);
    console.log('Data synced to the cloud:', books);
  } else {
    console.log('Local storage is empty. Sync aborted.');
  }
}

async function pullDataFromCloud() {
  const books = await getSyncData('books') || [];
  await setLocalData('books', books);
  console.log('Data pulled from the cloud and saved locally:', books);
}

async function shouldSync() {
  const lastSyncTime = await getSyncData('lastSyncTime');
  if (!lastSyncTime) {
    return true;
  }
  const twelveHoursInMillis = 12 * 60 * 60 * 1000;
  const now = Date.now();
  return (now - lastSyncTime) > twelveHoursInMillis;
}
