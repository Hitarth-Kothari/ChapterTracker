// Helper function to get the size of a JSON object
function getObjectSize(obj) {
  return new Blob([JSON.stringify(obj)]).size;
}

async function getLocalData(key) {
  try {
      return new Promise((resolve, reject) => {
          chrome.storage.local.get([key], function(result) {
              if (chrome.runtime.lastError) {
                  reject(chrome.runtime.lastError);
              } else {
                  resolve(result[key]);
              }
          });
      });
  } catch (error) {
      console.error('Error getting local data:', error);
  }
}

async function setLocalData(key, data) {
  try {
      return new Promise((resolve, reject) => {
          chrome.storage.local.set({ [key]: data }, function() {
              if (chrome.runtime.lastError) {
                  reject(chrome.runtime.lastError);
              } else {
                  resolve();
              }
          });
      });
  } catch (error) {
      console.error('Error setting local data:', error);
  }
}

async function getSyncData(key) {
  try {
      return new Promise((resolve, reject) => {
          chrome.storage.sync.get([key], function(result) {
              if (chrome.runtime.lastError) {
                  reject(chrome.runtime.lastError);
              } else {
                  resolve(result[key]);
              }
          });
      });
  } catch (error) {
      console.error('Error getting sync data:', error);
  }
}

async function setSyncData(key, data) {
  try {
      return new Promise((resolve, reject) => {
          chrome.storage.sync.set({ [key]: data }, function() {
              if (chrome.runtime.lastError) {
                  reject(chrome.runtime.lastError);
              } else {
                  resolve();
              }
          });
      });
  } catch (error) {
      console.error('Error setting sync data:', error);
  }
}

async function clearSyncData() {
  try {
      return new Promise((resolve, reject) => {
          chrome.storage.sync.clear(() => {
              if (chrome.runtime.lastError) {
                  reject(chrome.runtime.lastError);
              } else {
                  resolve();
              }
          });
      });
  } catch (error) {
      console.error('Error clearing sync data:', error);
  }
}

async function syncDataToCloud() {
  try {
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
  } catch (error) {
      console.error('Error during syncDataToCloud:', error);
  }
}

async function pullDataFromCloud() {
  try {
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
  } catch (error) {
      console.error('Error during pullDataFromCloud:', error);
  }
}

async function shouldSync() {
  try {
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
  } catch (error) {
      console.error('Error during shouldSync:', error);
      return false;
  }
}
