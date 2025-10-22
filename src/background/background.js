/**
 * Background Service Worker for URL Shortcuts Chrome Extension
 * Handles:
 * - Context menu for right-click "Add to shortcuts"
 * - Global keyboard shortcuts
 * - Tab/window event listeners
 */

// Initialize context menu
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'add-to-shortcuts',
    title: 'Add to Blink',
    contexts: ['link'],
  });

  chrome.contextMenus.create({
    id: 'add-page-to-shortcuts',
    title: 'Add Page to Blink',
    contexts: ['page', 'selection'],
  });

  // Extension initialized
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'add-to-shortcuts') {
    // Right-click on link
    const url = info.linkUrl;
    const text = info.selectionText || tab.title;

    chrome.runtime.sendMessage({
      type: 'QUICK_ADD',
      url,
      title: text,
    });
  } else if (info.menuItemId === 'add-page-to-shortcuts') {
    // Right-click on page
    const url = tab.url;
    const title = tab.title;

    chrome.runtime.sendMessage({
      type: 'QUICK_ADD',
      url,
      title,
    });
  }
});

// Handle global commands
chrome.commands.onCommand.addListener((command) => {
  if (command === 'open-search') {
    // Get current tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        const currentTab = tabs[0];
        
        // Check if we can inject into this tab
        const canInject = canInjectIntoTab(currentTab.url);
        
        if (canInject) {
          // Remove overlay from any previously active tab
          if (activeOverlayTabId && activeOverlayTabId !== currentTab.id) {
            chrome.tabs.sendMessage(activeOverlayTabId, { type: 'REMOVE_OVERLAY' }).catch(() => {
              // Ignore errors
            });
          }
          
          // Try to inject search overlay into current page
          chrome.scripting.executeScript({
            target: { tabId: currentTab.id },
            files: ['search-overlay.js']
          }).then(() => {
            activeOverlayTabId = currentTab.id;
          }).catch((error) => {
            console.error('Error injecting search overlay script:', error);
            // Fallback: open search in new tab
            openSearchInNewTab();
          });
        } else {
          // Cannot inject - open search in new tab
          openSearchInNewTab();
        }
      } else {
        console.error('No active tab found');
        // Fallback: open search in new tab
        openSearchInNewTab();
      }
    });
  }
});

// Check if we can inject scripts into a tab
function canInjectIntoTab(url) {
  // Cannot inject into chrome://, chrome-extension://, or moz-extension:// pages
  const restrictedProtocols = ['chrome:', 'chrome-extension:', 'moz-extension:', 'edge:', 'about:'];
  
  for (const protocol of restrictedProtocols) {
    if (url.startsWith(protocol)) {
      return false;
    }
  }
  
  // Cannot inject into data: URLs
  if (url.startsWith('data:')) {
    return false;
  }
  
  return true;
}

// Open search in a new tab as fallback
function openSearchInNewTab() {
  try {
    const searchUrl = chrome.runtime.getURL('search.html');
    chrome.tabs.create({
      url: searchUrl,
      active: true
    }, (tab) => {
      if (chrome.runtime.lastError) {
        console.error('Error creating search tab:', chrome.runtime.lastError);
      }
    });
  } catch (error) {
    console.error('Error in openSearchInNewTab:', error);
  }
}

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GET_SHORTCUTS') {
    // Get shortcuts from chrome.storage.local
    chrome.storage.local.get(['shortcuts'], (result) => {
      sendResponse({ shortcuts: result.shortcuts || [] });
    });
    return true; // Keep the message channel open for async response
  }
  
  if (request.type === 'DELETE_SHORTCUT') {
    // Delete shortcut from storage
    chrome.storage.local.get(['shortcuts'], (result) => {
      const shortcuts = result.shortcuts || [];
      const updatedShortcuts = shortcuts.filter(s => s.id !== request.shortcutId);
      chrome.storage.local.set({ shortcuts: updatedShortcuts }, () => {
        sendResponse({ success: true });
      });
    });
    return true; // Keep the message channel open for async response
  }
  
  if (request.type === 'TRACK_ACCESS') {
    // Track shortcut access
    chrome.storage.local.get(['shortcuts'], (result) => {
      const shortcuts = result.shortcuts || [];
      const shortcut = shortcuts.find(s => s.id === request.shortcutId);
      if (shortcut) {
        shortcut.accessCount = (shortcut.accessCount || 0) + 1;
        shortcut.lastAccessed = Date.now();
        chrome.storage.local.set({ shortcuts }, () => {
          sendResponse({ success: true });
        });
      } else {
        console.error('Shortcut not found for tracking:', request.shortcutId);
        sendResponse({ success: false, error: 'Shortcut not found' });
      }
    });
    return true; // Keep the message channel open for async response
  }
});

// Listen for shortcut updates from popup/dashboard to sync with storage
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'SHORTCUT_UPDATED') {
    // Sync shortcuts to chrome.storage.local when they're updated
    chrome.storage.local.set({ shortcuts: request.shortcuts }, () => {
      console.log('Shortcuts synced to storage:', request.shortcuts.length);
    });
  }
  
  if (request.type === 'OPEN_DASHBOARD') {
    // Open dashboard in new tab
    chrome.tabs.create({
      url: chrome.runtime.getURL('dashboard.html'),
      active: true
    });
    sendResponse({ success: true });
  }
  
  if (request.type === 'REMOVE_OVERLAY') {
    // Remove overlay from current tab
    if (activeOverlayTabId) {
      chrome.tabs.sendMessage(activeOverlayTabId, { type: 'REMOVE_OVERLAY' }).catch(() => {
        // Ignore errors
      });
      activeOverlayTabId = null;
    }
    sendResponse({ success: true });
  }
});

// Omnibox integration
chrome.omnibox.setDefaultSuggestion({
  description: 'Search URL shortcuts - press space to see favorites'
});

// Handle omnibox input changes
chrome.omnibox.onInputChanged.addListener((text, suggest) => {
  console.log('Omnibox input changed:', text);
  
  // Get shortcuts from storage
  chrome.storage.local.get(['shortcuts'], (result) => {
    const shortcuts = result.shortcuts || [];
    console.log('Found shortcuts for omnibox:', shortcuts.length);
    
    if (text.trim() === '') {
      // Show top 10 favorites when no text
      const favorites = getFavorites(shortcuts, 10);
      const suggestions = favorites.map(shortcut => ({
        content: shortcut.url,
        description: formatOmniboxSuggestion(shortcut)
      }));
      suggest(suggestions);
    } else {
      // Search shortcuts based on text
      const searchResults = searchShortcuts(shortcuts, text);
      const suggestions = searchResults.slice(0, 10).map(shortcut => ({
        content: shortcut.url,
        description: formatOmniboxSuggestion(shortcut)
      }));
      suggest(suggestions);
    }
  });
});

// Handle omnibox selection
chrome.omnibox.onInputEntered.addListener((text, disposition) => {
  console.log('Omnibox input entered:', text, disposition);
  
  // If text is a URL, navigate to it
  if (text.startsWith('http://') || text.startsWith('https://')) {
    chrome.tabs.create({ url: text });
  } else {
    // Search for shortcut and navigate to first result
    chrome.storage.local.get(['shortcuts'], (result) => {
      const shortcuts = result.shortcuts || [];
      const searchResults = searchShortcuts(shortcuts, text);
      
      if (searchResults.length > 0) {
        const shortcut = searchResults[0];
        console.log('Navigating to shortcut:', shortcut.alias, shortcut.url);
        
        // Update access count
        updateAccessCount(shortcut.id);
        
        // Navigate based on disposition
        if (disposition === 'currentTab') {
          chrome.tabs.update({ url: shortcut.url });
        } else if (disposition === 'newForegroundTab') {
          chrome.tabs.create({ url: shortcut.url });
        } else if (disposition === 'newBackgroundTab') {
          chrome.tabs.create({ url: shortcut.url, active: false });
        }
      }
    });
  }
});

// Helper function to get favorites (most accessed shortcuts)
function getFavorites(shortcuts, limit = 10) {
  return shortcuts
    .sort((a, b) => {
      // Sort by access count, then by last accessed date
      const aScore = (a.accessCount || 0) + (a.lastAccessedAt ? 1 : 0);
      const bScore = (b.accessCount || 0) + (b.lastAccessedAt ? 1 : 0);
      return bScore - aScore;
    })
    .slice(0, limit);
}

// Helper function to search shortcuts
function searchShortcuts(shortcuts, query) {
  const lowerQuery = query.toLowerCase();
  
  return shortcuts
    .map(shortcut => {
      let score = 0;
      const alias = (shortcut.alias || '').toLowerCase();
      const url = (shortcut.url || '').toLowerCase();
      const tags = (shortcut.tags || []).join(' ').toLowerCase();
      const folder = (shortcut.folder || '').toLowerCase();
      
      // Exact alias match (highest priority)
      if (alias === lowerQuery) {
        score = 1000;
      }
      // Partial alias match
      else if (alias.includes(lowerQuery)) {
        score = 800;
      }
      // Tag match
      else if (tags.includes(lowerQuery)) {
        score = 600;
      }
      // URL match
      else if (url.includes(lowerQuery)) {
        score = 400;
      }
      // Folder match
      else if (folder.includes(lowerQuery)) {
        score = 200;
      }
      
      return { ...shortcut, score };
    })
    .filter(shortcut => shortcut.score > 0)
    .sort((a, b) => b.score - a.score);
}

// Helper function to format omnibox suggestion
function formatOmniboxSuggestion(shortcut) {
  const alias = shortcut.folder ? `${shortcut.folder}/${shortcut.alias}` : shortcut.alias;
  const url = shortcut.url.length > 50 ? shortcut.url.substring(0, 47) + '...' : shortcut.url;
  const accessCount = shortcut.accessCount || 0;
  
  return `${alias} - ${url} (${accessCount} uses)`;
}

// Helper function to update access count
function updateAccessCount(shortcutId) {
  chrome.storage.local.get(['shortcuts'], (result) => {
    const shortcuts = result.shortcuts || [];
    const updatedShortcuts = shortcuts.map(shortcut => {
      if (shortcut.id === shortcutId) {
        return {
          ...shortcut,
          accessCount: (shortcut.accessCount || 0) + 1,
          lastAccessedAt: new Date().toISOString()
        };
      }
      return shortcut;
    });
    
    chrome.storage.local.set({ shortcuts: updatedShortcuts }, () => {
      console.log('Updated access count for shortcut:', shortcutId);
    });
  });
}

// Track active overlay tab
let activeOverlayTabId = null;

// Listen for tab changes to remove overlay from inactive tabs
chrome.tabs.onActivated.addListener((activeInfo) => {
  console.log('Tab activated:', activeInfo.tabId, 'Previous overlay tab:', activeOverlayTabId);
  if (activeOverlayTabId && activeOverlayTabId !== activeInfo.tabId) {
    console.log('Removing overlay from tab:', activeOverlayTabId);
    // Remove overlay from previously active tab
    chrome.tabs.sendMessage(activeOverlayTabId, { type: 'REMOVE_OVERLAY' }, (response) => {
      if (chrome.runtime.lastError) {
        console.log('Error removing overlay:', chrome.runtime.lastError);
      } else {
        console.log('Overlay removal response:', response);
      }
    });
    activeOverlayTabId = null;
  }
});

// Listen for window focus changes
chrome.windows.onFocusChanged.addListener((windowId) => {
  console.log('Window focus changed:', windowId);
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    // No window focused, remove overlay from any active tab
    if (activeOverlayTabId) {
      console.log('Removing overlay due to window focus loss');
      chrome.tabs.sendMessage(activeOverlayTabId, { type: 'REMOVE_OVERLAY' }, (response) => {
        if (chrome.runtime.lastError) {
          console.log('Error removing overlay on focus loss:', chrome.runtime.lastError);
        } else {
          console.log('Overlay removal on focus loss response:', response);
        }
      });
      activeOverlayTabId = null;
    }
  }
});

// Listen for tab removal
chrome.tabs.onRemoved.addListener((tabId) => {
  console.log('Tab removed:', tabId);
  if (activeOverlayTabId === tabId) {
    activeOverlayTabId = null;
  }
});

// Log when extension loads
console.log('Background service worker loaded');
