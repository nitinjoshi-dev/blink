/**
 * Search Overlay Script
 * Injected into current page to create Spotlight-like search overlay
 */

// Search overlay script loaded

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'REMOVE_OVERLAY') {
    const overlay = document.getElementById('linkvault-search-overlay');
    if (overlay) {
      overlay.remove();
      sendResponse({ success: true });
    } else {
      sendResponse({ success: false, error: 'No overlay found' });
    }
  }
});

// Check if overlay already exists
if (document.getElementById('linkvault-search-overlay')) {
  // If overlay exists, remove it
  document.getElementById('linkvault-search-overlay').remove();
} else {
  // Create the search overlay
  createSearchOverlay();
}

function createSearchOverlay() {
  // Create overlay container
  const overlay = document.createElement('div');
  overlay.id = 'linkvault-search-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    z-index: 999999;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding-top: 10vh;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  `;

  // Create search container
  const searchContainer = document.createElement('div');
  searchContainer.style.cssText = `
    width: 600px;
    max-width: 90vw;
    max-height: 80vh;
    background: #1a1a1a;
    border: 1px solid #2a2a2a;
    border-radius: 12px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  `;

  // Create header
  const header = document.createElement('div');
  header.style.cssText = `
    padding: 20px 24px 16px;
    border-bottom: 1px solid #2a2a2a;
    display: flex;
    align-items: center;
    gap: 12px;
  `;

  const searchIcon = document.createElement('div');
  searchIcon.textContent = '🔍';
  searchIcon.style.cssText = `
    font-size: 20px;
  `;

  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.placeholder = 'Search shortcuts...';
  searchInput.style.cssText = `
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    font-size: 18px;
    color: #e8e8e8;
    font-weight: 500;
  `;

  const homeButton = document.createElement('button');
  homeButton.innerHTML = '🏠';
  homeButton.title = 'Open Dashboard';
  homeButton.style.cssText = `
    padding: 8px 12px;
    background-color: #00d9ff;
    color: #0f0f0f;
    border: none;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s;
  `;

  header.appendChild(searchIcon);
  header.appendChild(searchInput);
  header.appendChild(homeButton);

  // Create results container
  const resultsContainer = document.createElement('div');
  resultsContainer.id = 'search-results';
  resultsContainer.style.cssText = `
    flex: 1;
    overflow-y: auto;
    max-height: 400px;
  `;

  // Create footer
  const footer = document.createElement('div');
  footer.style.cssText = `
    padding: 12px 24px;
    border-top: 1px solid #2a2a2a;
    font-size: 12px;
    color: #888888;
    display: flex;
    justify-content: space-between;
    align-items: center;
  `;

  const footerLeft = document.createElement('div');
  footerLeft.id = 'search-count';
  footerLeft.textContent = 'Loading shortcuts...';

  const footerRight = document.createElement('div');
  footerRight.innerHTML = `
    <kbd style="background: #2a2a2a; padding: 2px 6px; border-radius: 3px; font-size: 10px; color: #e8e8e8;">↑↓</kbd> Navigate • 
    <kbd style="background: #2a2a2a; padding: 2px 6px; border-radius: 3px; font-size: 10px; color: #e8e8e8;">Enter</kbd> Open • 
    <kbd style="background: #2a2a2a; padding: 2px 6px; border-radius: 3px; font-size: 10px; color: #e8e8e8;">Tab</kbd> Edit • 
    <kbd style="background: #2a2a2a; padding: 2px 6px; border-radius: 3px; font-size: 10px; color: #e8e8e8;">Esc</kbd> Close
  `;

  footer.appendChild(footerLeft);
  footer.appendChild(footerRight);

  // Assemble the overlay
  searchContainer.appendChild(header);
  searchContainer.appendChild(resultsContainer);
  searchContainer.appendChild(footer);
  overlay.appendChild(searchContainer);

  // Add to page
  document.body.appendChild(overlay);

  // Focus the input
  searchInput.focus();

  // Load shortcuts and set up event handlers
  loadShortcutsAndSetupEvents(searchInput, resultsContainer, footerLeft, homeButton);

  // Close overlay when clicking outside
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.remove();
    }
  });
}

async function loadShortcutsAndSetupEvents(searchInput, resultsContainer, footerLeft, homeButton) {
  let shortcuts = [];
  let filteredShortcuts = [];
  let selectedIndex = 0;

  // Load shortcuts
  try {
    shortcuts = await loadShortcutsFromStorage();
    filteredShortcuts = shortcuts;
    updateResults();
  } catch (error) {
    console.error('Error loading shortcuts:', error);
    resultsContainer.innerHTML = '<div style="padding: 40px; text-align: center; color: #ef4444;">❌ Failed to load shortcuts</div>';
  }

  function loadShortcutsFromStorage() {
    return new Promise((resolve, reject) => {
      // Try to get shortcuts from IndexedDB via message passing
      chrome.runtime.sendMessage({ type: 'GET_SHORTCUTS' }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Chrome runtime error:', chrome.runtime.lastError);
          reject(chrome.runtime.lastError);
        } else if (response && response.shortcuts) {
          resolve(response.shortcuts);
        } else {
          resolve([]);
        }
      });
    });
  }

  function updateResults() {
    if (filteredShortcuts.length === 0) {
      resultsContainer.innerHTML = `
        <div style="padding: 40px; text-align: center; color: #888888;">
          ${searchInput.value ? `No shortcuts found for "${searchInput.value}"` : 'No shortcuts available'}
        </div>
      `;
    } else {
      resultsContainer.innerHTML = filteredShortcuts.map((shortcut, index) => `
        <div 
          class="search-result-item" 
          data-index="${index}"
          style="
            padding: 12px 24px;
            border-bottom: 1px solid #2a2a2a;
            cursor: pointer;
            background-color: ${index === selectedIndex ? '#00d9ff' : 'transparent'};
            color: ${index === selectedIndex ? '#0f0f0f' : '#e8e8e8'};
            display: flex;
            align-items: center;
            gap: 12px;
            transition: background-color 0.2s, color 0.2s;
          "
        >
          <div style="flex: 1;">
            <div style="font-size: 16px; font-weight: 600;">
              ${shortcut.folder ? `${shortcut.folder}/` : ''}${shortcut.alias}
            </div>
            <div style="font-size: 12px; opacity: 0.7; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              ${shortcut.url}
            </div>
            <div style="font-size: 10px; opacity: 0.6; margin-top: 4px;">
              ${shortcut.accessCount || shortcut.accessCount === 0 ? `Used ${shortcut.accessCount} times` : 'Never used'} • 
              ${shortcut.lastAccessed ? ` Last used ${new Date(shortcut.lastAccessed).toLocaleDateString()}` : ' Never accessed'}
            </div>
          </div>
          <div style="display: flex; gap: 8px; opacity: 0.7;">
            <button 
              class="edit-btn" 
              data-shortcut-id="${shortcut.id}"
              style="
                padding: 4px 8px;
                background: rgba(255, 255, 255, 0.1);
                border: none;
                border-radius: 4px;
                color: inherit;
                font-size: 11px;
                cursor: pointer;
                transition: background-color 0.2s;
              "
              title="Edit (Tab)"
            >
              ✏️
            </button>
            <button 
              class="delete-btn" 
              data-shortcut-id="${shortcut.id}"
              style="
                padding: 4px 8px;
                background: rgba(255, 255, 255, 0.1);
                border: none;
                border-radius: 4px;
                color: inherit;
                font-size: 11px;
                cursor: pointer;
                transition: background-color 0.2s;
              "
              title="Delete"
            >
              🗑️
            </button>
          </div>
        </div>
      `).join('');
    }

    footerLeft.textContent = `${filteredShortcuts.length} shortcut${filteredShortcuts.length !== 1 ? 's' : ''}${searchInput.value ? ` matching "${searchInput.value}"` : ''}`;
  }

  // Search functionality
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    if (!query.trim()) {
      filteredShortcuts = shortcuts;
    } else {
      filteredShortcuts = shortcuts.filter(shortcut => {
        const aliasMatch = shortcut.alias.toLowerCase().includes(query);
        const urlMatch = shortcut.url.toLowerCase().includes(query);
        const tagMatch = (shortcut.tags || []).some(tag => tag.toLowerCase().includes(query));
        const folderMatch = (shortcut.folder || '').toLowerCase().includes(query);
        return aliasMatch || urlMatch || tagMatch || folderMatch;
      }).sort((a, b) => {
        const aAlias = a.alias.toLowerCase();
        const bAlias = b.alias.toLowerCase();
        if (aAlias === query && bAlias !== query) return -1;
        if (bAlias === query && aAlias !== query) return 1;
        if (aAlias.startsWith(query) && !bAlias.startsWith(query)) return -1;
        if (bAlias.startsWith(query) && !aAlias.startsWith(query)) return 1;
        return aAlias.localeCompare(bAlias);
      });
    }
    selectedIndex = 0;
    updateResults();
  });

  // Keyboard navigation
  searchInput.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        selectedIndex = selectedIndex < filteredShortcuts.length - 1 ? selectedIndex + 1 : 0;
        updateResults();
        break;
      case 'ArrowUp':
        e.preventDefault();
        selectedIndex = selectedIndex > 0 ? selectedIndex - 1 : filteredShortcuts.length - 1;
        updateResults();
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredShortcuts[selectedIndex]) {
          openShortcut(filteredShortcuts[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        document.getElementById('linkvault-search-overlay').remove();
        break;
      case 'Tab':
        e.preventDefault();
        if (filteredShortcuts[selectedIndex]) {
          editShortcut(filteredShortcuts[selectedIndex]);
        }
        break;
    }
  });

  // Click handlers
  resultsContainer.addEventListener('click', (e) => {
    const resultItem = e.target.closest('.search-result-item');
    if (resultItem) {
      const index = parseInt(resultItem.dataset.index);
      selectedIndex = index;
      updateResults();
      if (e.target.classList.contains('edit-btn')) {
        editShortcut(filteredShortcuts[index]);
      } else if (e.target.classList.contains('delete-btn')) {
        deleteShortcut(filteredShortcuts[index]);
      } else {
        openShortcut(filteredShortcuts[index]);
      }
    }
  });

  // Home button
  homeButton.addEventListener('click', () => {
    // Use background script to open dashboard (has proper permissions)
    chrome.runtime.sendMessage({ type: 'OPEN_DASHBOARD' }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Chrome runtime error:', chrome.runtime.lastError);
      }
      if (response && response.success) {
        document.getElementById('linkvault-search-overlay').remove();
      } else {
        console.error('Failed to open dashboard, trying fallback');
        // Fallback: try direct navigation
        window.open(chrome.runtime.getURL('dashboard.html'), '_blank');
        document.getElementById('linkvault-search-overlay').remove();
      }
    });
  });

  function openShortcut(shortcut) {
    // Track access via message passing
    chrome.runtime.sendMessage({ 
      type: 'TRACK_ACCESS', 
      shortcutId: shortcut.id 
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Error tracking access:', chrome.runtime.lastError);
      } else {
        // Access tracked for shortcut
      }
    });
    
    // Use window.open instead of chrome.tabs.create in content script
    window.open(shortcut.url, '_blank');
    document.getElementById('linkvault-search-overlay').remove();
  }

  function editShortcut(shortcut) {
    // Use window.open instead of chrome.tabs.create in content script
    window.open(chrome.runtime.getURL('dashboard.html'), '_blank');
    document.getElementById('linkvault-search-overlay').remove();
  }

  function deleteShortcut(shortcut) {
    if (confirm(`Delete shortcut "${shortcut.alias}"?`)) {
      // Delete via message passing
      chrome.runtime.sendMessage({ 
        type: 'DELETE_SHORTCUT', 
        shortcutId: shortcut.id 
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Error deleting shortcut:', chrome.runtime.lastError);
        } else {
          // Reload shortcuts
          loadShortcutsFromStorage().then(newShortcuts => {
            shortcuts = newShortcuts;
            const query = searchInput.value.toLowerCase();
            if (!query.trim()) {
              filteredShortcuts = shortcuts;
            } else {
              filteredShortcuts = shortcuts.filter(shortcut => {
                const aliasMatch = shortcut.alias.toLowerCase().includes(query);
                const urlMatch = shortcut.url.toLowerCase().includes(query);
                const tagMatch = (shortcut.tags || []).some(tag => tag.toLowerCase().includes(query));
                const folderMatch = (shortcut.folder || '').toLowerCase().includes(query);
                return aliasMatch || urlMatch || tagMatch || folderMatch;
              });
            }
            updateResults();
          });
        }
      });
    }
  }
}
