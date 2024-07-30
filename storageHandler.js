async function getLocalData(key) {
    return new Promise((resolve) => {
      chrome.storage.local.get([key], function(result) {
        resolve(result[key]);
      });
    });
  }
  
  async function setLocalData(key, data) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [key]: data }, function() {
        resolve();
      });
    });
  }
  
  async function getSyncData(key) {
    return new Promise((resolve) => {
      chrome.storage.sync.get([key], function(result) {
        resolve(result[key]);
      });
    });
  }
  
  async function setSyncData(key, data) {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ [key]: data }, function() {
        resolve();
      });
    });
  }
  
  async function clearSyncData() {
    return new Promise((resolve) => {
      chrome.storage.sync.clear(() => {
        resolve();
      });
    });
  }
  
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
  