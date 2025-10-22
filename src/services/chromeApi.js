/**
 * Chrome API Service
 * Wrapper for Chrome Extension APIs
 * Handles tabs, clipboard, storage, and other Chrome features
 */

/**
 * Get current active tab information
 * @returns {Promise<object>} Tab info { url, title, id, windowId }
 * @throws {Error} If failed to get tab
 */
export const getCurrentTab = async () => {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (chrome.runtime.lastError) {
        reject(new Error(`Failed to get current tab: ${chrome.runtime.lastError.message}`));
        return;
      }

      const tab = tabs[0];
      if (!tab) {
        reject(new Error('No active tab found'));
        return;
      }

      resolve({
        url: tab.url,
        title: tab.title,
        id: tab.id,
        windowId: tab.windowId,
        favIconUrl: tab.favIconUrl,
      });
    });
  });
};

/**
 * Open URL in tab
 * @param {string} url - URL to open
 * @param {boolean} newTab - Whether to open in new tab (default: false)
 * @returns {Promise<object>} Opened tab
 * @throws {Error} If failed to open URL
 */
export const openUrl = async (url, newTab = false) => {
  return new Promise((resolve, reject) => {
    if (newTab) {
      // Open in new tab
      chrome.tabs.create({ url }, (tab) => {
        if (chrome.runtime.lastError) {
          reject(new Error(`Failed to open URL: ${chrome.runtime.lastError.message}`));
          return;
        }
        resolve(tab);
      });
    } else {
      // Open in current tab
      chrome.tabs.update({ url }, (tab) => {
        if (chrome.runtime.lastError) {
          reject(new Error(`Failed to open URL: ${chrome.runtime.lastError.message}`));
          return;
        }
        resolve(tab);
      });
    }
  });
};

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<void>}
 * @throws {Error} If failed to copy
 */
export const copyToClipboard = async (text) => {
  return new Promise((resolve, reject) => {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);

      if (success) {
        resolve();
      } else {
        reject(new Error('Failed to copy to clipboard'));
      }
    } catch (error) {
      reject(new Error(`Copy to clipboard failed: ${error.message}`));
    }
  });
};

/**
 * Set shortcut in local storage
 * @param {string} key - Storage key
 * @param {any} value - Value to store
 * @returns {Promise<void>}
 */
export const setLocalStorage = async (key, value) => {
  return new Promise((resolve, reject) => {
    try {
      const data = { [key]: value };
      chrome.storage.local.set(data, () => {
        if (chrome.runtime.lastError) {
          reject(new Error(`Failed to set storage: ${chrome.runtime.lastError.message}`));
        } else {
          resolve();
        }
      });
    } catch (error) {
      reject(new Error(`Storage error: ${error.message}`));
    }
  });
};

/**
 * Get value from local storage
 * @param {string} key - Storage key
 * @returns {Promise<any>} Stored value or null
 */
export const getLocalStorage = async (key) => {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.local.get(key, (result) => {
        if (chrome.runtime.lastError) {
          reject(new Error(`Failed to get storage: ${chrome.runtime.lastError.message}`));
        } else {
          resolve(result[key] || null);
        }
      });
    } catch (error) {
      reject(new Error(`Storage error: ${error.message}`));
    }
  });
};

/**
 * Remove value from local storage
 * @param {string} key - Storage key
 * @returns {Promise<void>}
 */
export const removeLocalStorage = async (key) => {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.local.remove(key, () => {
        if (chrome.runtime.lastError) {
          reject(new Error(`Failed to remove storage: ${chrome.runtime.lastError.message}`));
        } else {
          resolve();
        }
      });
    } catch (error) {
      reject(new Error(`Storage error: ${error.message}`));
    }
  });
};

/**
 * Clear all local storage
 * @returns {Promise<void>}
 */
export const clearLocalStorage = async () => {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.local.clear(() => {
        if (chrome.runtime.lastError) {
          reject(new Error(`Failed to clear storage: ${chrome.runtime.lastError.message}`));
        } else {
          resolve();
        }
      });
    } catch (error) {
      reject(new Error(`Storage error: ${error.message}`));
    }
  });
};

/**
 * Send message to other parts of extension
 * @param {object} message - Message to send
 * @returns {Promise<any>} Response from receiver
 */
export const sendMessage = async (message) => {
  return new Promise((resolve, reject) => {
    try {
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(`Message send failed: ${chrome.runtime.lastError.message}`));
        } else {
          resolve(response);
        }
      });
    } catch (error) {
      reject(new Error(`Message error: ${error.message}`));
    }
  });
};

/**
 * Listen for messages
 * @param {function} callback - Callback function(message, sender, sendResponse)
 * @returns {function} Listener removal function
 */
export const onMessage = (callback) => {
  chrome.runtime.onMessage.addListener(callback);

  // Return function to remove listener
  return () => {
    chrome.runtime.onMessage.removeListener(callback);
  };
};

/**
 * Get extension info
 * @returns {object} Extension manifest info
 */
export const getExtensionInfo = () => {
  const manifest = chrome.runtime.getManifest();
  return {
    name: manifest.name,
    version: manifest.version,
    description: manifest.description,
  };
};

/**
 * Open extension options page
 * @returns {Promise<void>}
 */
export const openOptionsPage = async () => {
  return new Promise((resolve, reject) => {
    try {
      chrome.runtime.openOptionsPage(() => {
        if (chrome.runtime.lastError) {
          reject(new Error(`Failed to open options: ${chrome.runtime.lastError.message}`));
        } else {
          resolve();
        }
      });
    } catch (error) {
      reject(new Error(`Options error: ${error.message}`));
    }
  });
};

/**
 * Check if running in popup context
 * @returns {boolean} True if in popup
 */
export const isPopupContext = () => {
  return (
    window.location.protocol === 'chrome-extension:' && window.location.pathname === '/popup.html'
  );
};

/**
 * Check if running in content script context
 * @returns {boolean} True if in content script
 */
export const isContentScriptContext = () => {
  return typeof chrome !== 'undefined' && chrome.extension;
};

/**
 * Check if running in background service worker context
 * @returns {boolean} True if in background
 */
export const isBackgroundContext = () => {
  return (
    typeof chrome !== 'undefined' &&
    chrome.runtime &&
    chrome.runtime.getManifest().background
  );
};

/**
 * Get all storage data (for debugging/export)
 * @returns {Promise<object>} All stored data
 */
export const getAllStorage = async () => {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.local.get(null, (result) => {
        if (chrome.runtime.lastError) {
          reject(new Error(`Failed to get all storage: ${chrome.runtime.lastError.message}`));
        } else {
          resolve(result);
        }
      });
    } catch (error) {
      reject(new Error(`Storage error: ${error.message}`));
    }
  });
};

/**
 * Log to console with extension context
 * @param {string} level - Log level: 'log', 'warn', 'error'
 * @param {string} message - Message to log
 * @param {any} data - Optional data
 */
export const log = (level = 'log', message, data) => {
  const prefix = '[URL Shortcuts]';
  if (data) {
    console[level](`${prefix} ${message}`, data);
  } else {
    console[level](`${prefix} ${message}`);
  }
};

/**
 * Check if browser supports required APIs
 * @returns {object} Support status { tabs, storage, runtime }
 */
export const checkBrowserSupport = () => {
  return {
    tabs: typeof chrome !== 'undefined' && typeof chrome.tabs !== 'undefined',
    storage: typeof chrome !== 'undefined' && typeof chrome.storage !== 'undefined',
    runtime: typeof chrome !== 'undefined' && typeof chrome.runtime !== 'undefined',
  };
};
