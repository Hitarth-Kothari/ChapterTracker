// Helper function to get the size of a JSON object
function getObjectSize(obj) {
    return new Blob([JSON.stringify(obj)]).size;
  }
  
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
    console.log('Starting syncDataToCloud');
    const books = await getLocalData('books') || [];
    console.log('Books retrieved from local storage:', books);
  
    if (books.length > 0) {
      await clearSyncData();
      console.log('Sync storage cleared.');
  
      const chunkSize = 100; // Adjust this based on your needs and data size constraints
      let chunkIndex = 0;
  
      for (let i = 0; i < books.length; i += chunkSize) {
        let chunk = books.slice(i, i + chunkSize);
        console.log(`Initial chunk [${i}, ${i + chunkSize}]:`, chunk);
  
        while (getObjectSize(chunk) > chrome.storage.sync.QUOTA_BYTES_PER_ITEM) {
          chunkSize -= 1;
          chunk = books.slice(i, i + chunkSize);
          console.log(`Adjusted chunk size to ${chunkSize}. New chunk:`, chunk);
        }
  
        const chunkKey = `books_chunk_${chunkIndex}`;
        await setSyncData(chunkKey, chunk);
        console.log(`Chunk stored with key ${chunkKey}:`, chunk);
        chunkIndex++;
      }
  
      const now = Date.now();
      await setSyncData('lastSyncTime', now);
      await setSyncData('chunkCount', chunkIndex);
      console.log('Data synced to the cloud:', books);
      console.log('Sync complete. Last sync time:', now, 'Number of chunks:', chunkIndex);
    } else {
      console.log('Local storage is empty. Sync aborted.');
    }
  }
  
  async function pullDataFromCloud() {
    console.log('Starting pullDataFromCloud');
    const chunkCount = await getSyncData('chunkCount') || 0;
    console.log('Number of chunks to retrieve:', chunkCount);
  
    let books = [];
  
    for (let i = 0; i < chunkCount; i++) {
      const chunkKey = `books_chunk_${i}`;
      const chunk = await getSyncData(chunkKey);
      if (chunk) {
        books = books.concat(chunk);
        console.log(`Chunk retrieved with key ${chunkKey}:`, chunk);
      } else {
        console.log(`No chunk found with key ${chunkKey}`);
      }
    }
  
    await setLocalData('books', books);
    console.log('Data pulled from the cloud and saved locally:', books);
  }
  
  async function shouldSync() {
    console.log('Checking if sync is needed');
    const lastSyncTime = await getSyncData('lastSyncTime');
    if (!lastSyncTime) {
      console.log('No last sync time found, sync is needed.');
      return true;
    }
  
    const twelveHoursInMillis = 12 * 60 * 60 * 1000;
    const now = Date.now();
    const syncNeeded = (now - lastSyncTime) > twelveHoursInMillis;
    console.log('Last sync time:', lastSyncTime, 'Current time:', now, 'Sync needed:', syncNeeded);
    return syncNeeded;
  }
  