/**
 * Shortcut Service
 * CRUD operations and search for shortcuts
 * Handles all interactions with the shortcuts database store
 */

import { v4 as uuidv4 } from 'uuid';
import { getStore } from './db';
import { validateShortcut, validateFullAlias, caseInsensitiveEqual } from './validators';
import { formatDateISO } from './formatters';

/**
 * Sync shortcuts to chrome.storage.local for search overlay access
 * @param {Array} shortcuts - Array of shortcuts to sync
 */
const syncToStorage = async (shortcuts) => {
  try {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      await chrome.storage.local.set({ shortcuts });
      console.log('Shortcuts synced to storage:', shortcuts.length);
    }
  } catch (error) {
    console.error('Error syncing shortcuts to storage:', error);
  }
};

/**
 * Track shortcut access (increment access count and update last accessed)
 * @param {string} shortcutId - ID of the shortcut to track
 * @returns {Promise<object>} Updated shortcut
 */
export const trackShortcutAccess = async (shortcutId) => {
  const store = await getStore('shortcuts', 'readwrite');
  
  return new Promise((resolve, reject) => {
    const getRequest = store.get(shortcutId);
    
    getRequest.onsuccess = () => {
      const shortcut = getRequest.result;
      if (!shortcut) {
        reject(new Error('Shortcut not found'));
        return;
      }
      
      const updatedShortcut = {
        ...shortcut,
        accessCount: (shortcut.accessCount || 0) + 1,
        lastAccessed: Date.now(),
        updatedAt: formatDateISO()
      };
      
      const updateRequest = store.put(updatedShortcut);
      
      updateRequest.onsuccess = async () => {
        try {
          const allShortcuts = await getAllShortcuts();
          await syncToStorage(allShortcuts);
          resolve(updatedShortcut);
        } catch (error) {
          console.error('Error syncing after access tracking:', error);
          resolve(updatedShortcut);
        }
      };
      
      updateRequest.onerror = () => {
        reject(new Error('Failed to update shortcut access'));
      };
    };
    
    getRequest.onerror = () => {
      reject(new Error('Failed to get shortcut'));
    };
  });
};

/**
 * Create a new shortcut
 * @param {object} data - Shortcut data { url, alias, folder, tags }
 * @returns {Promise<object>} Created shortcut with ID and metadata
 * @throws {Error} If validation fails or alias already exists
 */
export const createShortcut = async (data) => {
  // Validate input
  const validation = validateShortcut(data);
  if (!validation.valid) {
    throw new Error(`Validation failed: ${JSON.stringify(validation.errors)}`);
  }

  // Check for duplicate alias
  const existingShortcut = await getShortcutByFullAlias(data.folder, data.alias);
  if (existingShortcut) {
    throw new Error(
      `Alias already exists: ${data.folder ? data.folder + '/' : ''}${data.alias}`
    );
  }

  const now = formatDateISO();
  const shortcut = {
    id: uuidv4(),
    url: data.url.trim(),
    alias: data.alias.trim(),
    folder: data.folder ? data.folder.trim() : '',
    tags: validation.tags || [],
    createdAt: now,
    updatedAt: now,
    lastAccessed: null,
    accessCount: 0,
    isFavorite: false
  };

  const store = await getStore('shortcuts', 'readwrite');

  return new Promise((resolve, reject) => {
    const request = store.add(shortcut);

    request.onsuccess = async () => {
      console.log('Shortcut created:', shortcut.id);
      // Sync to chrome.storage.local for search overlay
      try {
        const allShortcuts = await getAllShortcuts();
        await syncToStorage(allShortcuts);
      } catch (error) {
        console.error('Error syncing shortcuts:', error);
      }
      resolve(shortcut);
    };

    request.onerror = () => {
      reject(new Error(`Failed to create shortcut: ${request.error}`));
    };
  });
};

/**
 * Get shortcut by ID
 * @param {string} id - Shortcut ID
 * @returns {Promise<object|null>} Shortcut or null
 */
export const getShortcut = async (id) => {
  const store = await getStore('shortcuts', 'readonly');

  return new Promise((resolve, reject) => {
    const request = store.get(id);

    request.onsuccess = () => {
      resolve(request.result || null);
    };

    request.onerror = () => {
      reject(new Error(`Failed to get shortcut: ${request.error}`));
    };
  });
};

/**
 * Get shortcut by full alias (folder/alias)
 * @param {string} folder - Folder name (optional)
 * @param {string} alias - Alias name
 * @returns {Promise<object|null>} Shortcut or null
 */
export const getShortcutByFullAlias = async (folder, alias) => {
  const allShortcuts = await getAllShortcuts();

  const folderNorm = (folder || '').trim().toLowerCase();
  const aliasNorm = (alias || '').trim().toLowerCase();

  const found = allShortcuts.find((s) => {
    const sFolderNorm = (s.folder || '').trim().toLowerCase();
    const sAliasNorm = (s.alias || '').trim().toLowerCase();
    return sFolderNorm === folderNorm && sAliasNorm === aliasNorm;
  });

  return found || null;
};

/**
 * Get shortcut by URL
 * @param {string} url - URL to search for
 * @returns {Promise<object|null>} Shortcut or null
 */
export const getShortcutByUrl = async (url) => {
  if (!url) return null;

  const allShortcuts = await getAllShortcuts();
  const normalizedUrl = url.trim().toLowerCase();

  const found = allShortcuts.find((s) => s.url.toLowerCase() === normalizedUrl);
  return found || null;
};

/**
 * Get all shortcuts
 * @returns {Promise<array>} All shortcuts
 */
export const getAllShortcuts = async () => {
  const store = await getStore('shortcuts', 'readonly');

  return new Promise((resolve, reject) => {
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result || []);
    };

    request.onerror = () => {
      reject(new Error(`Failed to get all shortcuts: ${request.error}`));
    };
  });
};

/**
 * Get shortcuts by folder
 * @param {string} folder - Folder name (empty string for root)
 * @returns {Promise<array>} Shortcuts in folder
 */
export const getShortcutsByFolder = async (folder) => {
  const allShortcuts = await getAllShortcuts();
  const folderNorm = (folder || '').trim().toLowerCase();

  return allShortcuts.filter((s) => {
    const sFolderNorm = (s.folder || '').trim().toLowerCase();
    return sFolderNorm === folderNorm;
  });
};

/**
 * Get shortcuts by tag
 * @param {string} tag - Tag to search for
 * @returns {Promise<array>} Shortcuts with tag
 */
export const getShortcutsByTag = async (tag) => {
  if (!tag) return [];

  const allShortcuts = await getAllShortcuts();
  const tagNorm = tag.trim().toLowerCase();

  return allShortcuts.filter((s) =>
    (s.tags || []).some((t) => t.toLowerCase() === tagNorm)
  );
};

/**
 * Update shortcut
 * @param {string} id - Shortcut ID
 * @param {object} updates - Fields to update
 * @returns {Promise<object>} Updated shortcut
 * @throws {Error} If validation fails or alias conflict
 */
export const updateShortcut = async (id, updates) => {
  const existing = await getShortcut(id);
  if (!existing) {
    throw new Error(`Shortcut not found: ${id}`);
  }

  // Prepare updated data
  const updated = { ...existing, ...updates };

  // Validate the updated shortcut
  const validation = validateShortcut(updated);
  if (!validation.valid) {
    throw new Error(`Validation failed: ${JSON.stringify(validation.errors)}`);
  }

  // Check for alias conflicts (if alias or folder changed)
  if (
    updates.alias ||
    updates.folder !== undefined
  ) {
    const existingAlias = await getShortcutByFullAlias(updated.folder, updated.alias);
    if (existingAlias && existingAlias.id !== id) {
      throw new Error(
        `Alias already exists: ${updated.folder ? updated.folder + '/' : ''}${updated.alias}`
      );
    }
  }

  updated.tags = validation.tags || [];
  updated.updatedAt = formatDateISO();

  const store = await getStore('shortcuts', 'readwrite');

  return new Promise((resolve, reject) => {
    const request = store.put(updated);

    request.onsuccess = async () => {
      console.log('Shortcut updated:', id);
      // Sync to chrome.storage.local for search overlay
      try {
        const allShortcuts = await getAllShortcuts();
        await syncToStorage(allShortcuts);
      } catch (error) {
        console.error('Error syncing shortcuts:', error);
      }
      resolve(updated);
    };

    request.onerror = () => {
      reject(new Error(`Failed to update shortcut: ${request.error}`));
    };
  });
};

/**
 * Delete shortcut
 * @param {string} id - Shortcut ID
 * @returns {Promise<void>}
 * @throws {Error} If deletion fails
 */
export const deleteShortcut = async (id) => {
  const store = await getStore('shortcuts', 'readwrite');

  return new Promise((resolve, reject) => {
    const request = store.delete(id);

    request.onsuccess = async () => {
      console.log('Shortcut deleted:', id);
      // Sync to chrome.storage.local for search overlay
      try {
        const allShortcuts = await getAllShortcuts();
        await syncToStorage(allShortcuts);
      } catch (error) {
        console.error('Error syncing shortcuts:', error);
      }
      resolve();
    };

    request.onerror = () => {
      reject(new Error(`Failed to delete shortcut: ${request.error}`));
    };
  });
};

/**
 * Search shortcuts with multi-criteria matching
 * Priority: exact alias > partial alias > tags > URL
 * @param {string} query - Search query
 * @returns {Promise<array>} Search results
 */
export const searchShortcuts = async (query) => {
  if (!query || !query.trim()) {
    return [];
  }

  const allShortcuts = await getAllShortcuts();
  const q = query.trim().toLowerCase();

  const exact = [];
  const partial = [];
  const tagMatches = [];
  const urlMatches = [];

  for (const shortcut of allShortcuts) {
    const fullAlias = `${(shortcut.folder || '').toLowerCase()}/${(shortcut.alias || '').toLowerCase()}`;
    const aliasPart = (shortcut.alias || '').toLowerCase();
    const folderPart = (shortcut.folder || '').toLowerCase();
    const urlLower = (shortcut.url || '').toLowerCase();
    const tagsLower = (shortcut.tags || []).map((t) => t.toLowerCase());

    // Exact alias match
    if (aliasPart === q || fullAlias === q) {
      exact.push(shortcut);
    }
    // Partial alias match
    else if (aliasPart.includes(q) || fullAlias.includes(q) || folderPart.includes(q)) {
      partial.push(shortcut);
    }
    // Tag match
    else if (tagsLower.some((t) => t.includes(q))) {
      tagMatches.push(shortcut);
    }
    // URL match
    else if (urlLower.includes(q)) {
      urlMatches.push(shortcut);
    }
  }

  return [...exact, ...partial, ...tagMatches, ...urlMatches];
};

/**
 * Get frequent shortcuts (top N by access count)
 * @param {number} limit - Number of shortcuts to return (default 10)
 * @returns {Promise<array>} Top frequent shortcuts
 */
export const getFrequentShortcuts = async (limit = 10) => {
  const allShortcuts = await getAllShortcuts();

  return allShortcuts
    .sort((a, b) => (b.accessCount || 0) - (a.accessCount || 0))
    .slice(0, limit);
};

/**
 * Increment access count for a shortcut
 * @param {string} id - Shortcut ID
 * @returns {Promise<object>} Updated shortcut
 */
export const incrementAccessCount = async (id) => {
  const shortcut = await getShortcut(id);
  if (!shortcut) {
    throw new Error(`Shortcut not found: ${id}`);
  }

  return updateShortcut(id, {
    accessCount: (shortcut.accessCount || 0) + 1,
    lastAccessedAt: formatDateISO(),
  });
};

/**
 * Get folder statistics
 * @returns {Promise<object>} Folder stats { folderName: count }
 */
export const getFolderStats = async () => {
  const allShortcuts = await getAllShortcuts();
  const stats = {};

  for (const shortcut of allShortcuts) {
    const folder = shortcut.folder ? shortcut.folder.trim() : 'ungrouped';
    stats[folder] = (stats[folder] || 0) + 1;
  }

  return stats;
};

/**
 * Get total shortcut count
 * @returns {Promise<number>} Total shortcuts
 */
export const getTotalCount = async () => {
  const allShortcuts = await getAllShortcuts();
  return allShortcuts.length;
};

/**
 * Rename folder (update all shortcuts in that folder)
 * @param {string} oldName - Old folder name
 * @param {string} newName - New folder name
 * @returns {Promise<number>} Number of shortcuts updated
 * @throws {Error} If new folder name is invalid or conflicts exist
 */
export const renameFolder = async (oldName, newName) => {
  if (caseInsensitiveEqual(oldName, newName)) {
    return 0; // No change needed
  }

  const shortcuts = await getShortcutsByFolder(oldName);
  let updated = 0;

  for (const shortcut of shortcuts) {
    // Check for conflicts with existing aliases
    const existingAlias = await getShortcutByFullAlias(newName, shortcut.alias);
    if (existingAlias && existingAlias.id !== shortcut.id) {
      throw new Error(`Cannot rename folder: alias conflict for "${shortcut.alias}"`);
    }

    await updateShortcut(shortcut.id, { folder: newName });
    updated++;
  }

  console.log(`Renamed folder from "${oldName}" to "${newName}" (${updated} shortcuts)`);
  return updated;
};

/**
 * Bulk operations on multiple shortcuts
 * @param {array} ids - Array of shortcut IDs
 * @param {string} operation - 'delete' | 'addTags' | 'removeTag' | 'moveToFolder'
 * @param {any} operationData - Data for the operation
 * @returns {Promise<object>} { updated: number, failed: number, errors: array }
 */
export const bulkOperation = async (ids, operation, operationData) => {
  const results = { updated: 0, failed: 0, errors: [] };

  if (!Array.isArray(ids) || ids.length === 0) {
    return results;
  }

  for (const id of ids) {
    try {
      const shortcut = await getShortcut(id);
      if (!shortcut) {
        results.failed++;
        results.errors.push({ id, error: 'Shortcut not found' });
        continue;
      }

      switch (operation) {
        case 'delete':
          await deleteShortcut(id);
          results.updated++;
          break;

        case 'addTags': {
          const newTags = Array.isArray(operationData)
            ? operationData
            : [operationData];
          const tags = new Set(shortcut.tags || []);
          newTags.forEach((t) => tags.add(t));
          await updateShortcut(id, { tags: Array.from(tags) });
          results.updated++;
          break;
        }

        case 'removeTag': {
          const tags = (shortcut.tags || []).filter((t) => t !== operationData);
          await updateShortcut(id, { tags });
          results.updated++;
          break;
        }

        case 'moveToFolder': {
          await updateShortcut(id, { folder: operationData });
          results.updated++;
          break;
        }

        default:
          results.failed++;
          results.errors.push({ id, error: `Unknown operation: ${operation}` });
      }
    } catch (error) {
      results.failed++;
      results.errors.push({ id, error: error.message });
    }
  }

  return results;
};

/**
 * Get shortcut statistics
 * @returns {Promise<object>} Stats { total, byFolder, mostUsed, recent }
 */
export const getStatistics = async () => {
  const allShortcuts = await getAllShortcuts();
  const byFolder = await getFolderStats();
  const mostUsed = allShortcuts
    .sort((a, b) => (b.accessCount || 0) - (a.accessCount || 0))
    .slice(0, 5);
  const recent = allShortcuts
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 5);

  return {
    total: allShortcuts.length,
    byFolder,
    mostUsed,
    recent,
  };
};
