/**
 * Folder Service
 * Folder management and operations
 * Handles folder CRUD and validation
 */

import { getStore } from './db';
import { validateFolderName, caseInsensitiveEqual } from './validators';
import { formatDateISO } from './formatters';
import { getShortcutsByFolder, renameFolder as renameShortcutsFolder } from './shortcutService';

/**
 * Create a new folder
 * @param {string} name - Folder name
 * @returns {Promise<object>} Created folder
 * @throws {Error} If validation fails or folder already exists
 */
export const createFolder = async (name) => {
  // Validate folder name
  const validation = validateFolderName(name);
  if (!validation.valid) {
    throw new Error(`Invalid folder name: ${validation.error}`);
  }

  const normalizedName = name.trim();

  // Check if folder already exists (case-insensitive)
  const existingFolder = await getFolderByName(normalizedName);
  if (existingFolder) {
    throw new Error(`Folder already exists: ${normalizedName}`);
  }

  const folder = {
    name: normalizedName,
    createdAt: formatDateISO(),
  };

  const store = await getStore('folders', 'readwrite');

  return new Promise((resolve, reject) => {
    const request = store.add(folder);

    request.onsuccess = () => {
      console.log('Folder created:', folder.name);
      resolve(folder);
    };

    request.onerror = () => {
      reject(new Error(`Failed to create folder: ${request.error}`));
    };
  });
};

/**
 * Get folder by name
 * @param {string} name - Folder name
 * @returns {Promise<object|null>} Folder or null
 */
export const getFolderByName = async (name) => {
  if (!name) return null;

  const store = await getStore('folders', 'readonly');
  const normalizedName = name.trim();

  return new Promise((resolve, reject) => {
    const request = store.get(normalizedName);

    request.onsuccess = () => {
      resolve(request.result || null);
    };

    request.onerror = () => {
      reject(new Error(`Failed to get folder: ${request.error}`));
    };
  });
};

/**
 * Get all folders
 * @returns {Promise<array>} All folders
 */
export const getAllFolders = async () => {
  const store = await getStore('folders', 'readonly');

  return new Promise((resolve, reject) => {
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result || []);
    };

    request.onerror = () => {
      reject(new Error(`Failed to get all folders: ${request.error}`));
    };
  });
};

/**
 * Get all folders with shortcut counts
 * @returns {Promise<array>} Folders with counts
 */
export const getAllFoldersWithCounts = async () => {
  const folders = await getAllFolders();
  const result = [];

  for (const folder of folders) {
    const shortcuts = await getShortcutsByFolder(folder.name);
    result.push({
      ...folder,
      shortcutCount: shortcuts.length,
    });
  }

  // Sort by name
  result.sort((a, b) => a.name.localeCompare(b.name));

  return result;
};

/**
 * Rename folder
 * @param {string} oldName - Old folder name
 * @param {string} newName - New folder name
 * @returns {Promise<object>} Updated folder
 * @throws {Error} If validation fails or folder exists
 */
export const renameFolder = async (oldName, newName) => {
  // Validate new name
  const validation = validateFolderName(newName);
  if (!validation.valid) {
    throw new Error(`Invalid folder name: ${validation.error}`);
  }

  const normalizedOldName = oldName.trim();
  const normalizedNewName = newName.trim();

  // Check if they're the same (case-insensitive)
  if (caseInsensitiveEqual(normalizedOldName, normalizedNewName)) {
    const folder = await getFolderByName(normalizedOldName);
    return folder;
  }

  // Check if new folder name already exists
  const existingFolder = await getFolderByName(normalizedNewName);
  if (existingFolder) {
    throw new Error(`Folder already exists: ${normalizedNewName}`);
  }

  // Update all shortcuts in the folder
  await renameShortcutsFolder(normalizedOldName, normalizedNewName);

  // Delete old folder
  const store = await getStore('folders', 'readwrite');

  return new Promise((resolve, reject) => {
    const deleteRequest = store.delete(normalizedOldName);

    deleteRequest.onsuccess = () => {
      // Add new folder
      const addRequest = store.add({
        name: normalizedNewName,
        createdAt: formatDateISO(),
      });

      addRequest.onsuccess = () => {
        console.log(`Folder renamed from "${normalizedOldName}" to "${normalizedNewName}"`);
        resolve({
          name: normalizedNewName,
          createdAt: formatDateISO(),
        });
      };

      addRequest.onerror = () => {
        reject(new Error(`Failed to rename folder: ${addRequest.error}`));
      };
    };

    deleteRequest.onerror = () => {
      reject(new Error(`Failed to delete old folder: ${deleteRequest.error}`));
    };
  });
};

/**
 * Delete folder (only if empty)
 * @param {string} name - Folder name
 * @returns {Promise<void>}
 * @throws {Error} If folder not empty or deletion fails
 */
export const deleteFolder = async (name) => {
  const normalizedName = name.trim();

  // Check if folder has shortcuts
  const shortcuts = await getShortcutsByFolder(normalizedName);
  if (shortcuts.length > 0) {
    throw new Error(
      `Cannot delete folder: contains ${shortcuts.length} shortcut(s). Move or delete shortcuts first.`
    );
  }

  const store = await getStore('folders', 'readwrite');

  return new Promise((resolve, reject) => {
    const request = store.delete(normalizedName);

    request.onsuccess = () => {
      console.log('Folder deleted:', normalizedName);
      resolve();
    };

    request.onerror = () => {
      reject(new Error(`Failed to delete folder: ${request.error}`));
    };
  });
};

/**
 * Get folder statistics
 * @param {string} name - Folder name
 * @returns {Promise<object>} Folder stats { name, shortcutCount, createdAt }
 */
export const getFolderStats = async (name) => {
  const normalizedName = name.trim();
  const folder = await getFolderByName(normalizedName);

  if (!folder) {
    return null;
  }

  const shortcuts = await getShortcutsByFolder(normalizedName);

  return {
    ...folder,
    shortcutCount: shortcuts.length,
  };
};

/**
 * Check if folder name is available
 * @param {string} name - Folder name to check
 * @returns {Promise<boolean>} True if available (not used)
 */
export const isFolderNameAvailable = async (name) => {
  if (!name || !name.trim()) {
    return true; // Empty/root is always available
  }

  const normalizedName = name.trim();
  const folder = await getFolderByName(normalizedName);
  return folder === null;
};

/**
 * Get folder or create if not exists
 * @param {string} name - Folder name
 * @returns {Promise<object>} Folder
 */
export const getOrCreateFolder = async (name) => {
  if (!name || !name.trim()) {
    return null; // Root folder
  }

  const normalizedName = name.trim();
  let folder = await getFolderByName(normalizedName);

  if (!folder) {
    // Try to create it
    try {
      folder = await createFolder(normalizedName);
    } catch (error) {
      // Folder might have been created by another operation
      folder = await getFolderByName(normalizedName);
      if (!folder) {
        throw error;
      }
    }
  }

  return folder;
};

/**
 * Clean up empty folders
 * Automatically deletes folders with no shortcuts
 * @returns {Promise<number>} Number of folders deleted
 */
export const cleanupEmptyFolders = async () => {
  const folders = await getAllFolders();
  let deletedCount = 0;

  for (const folder of folders) {
    try {
      await deleteFolder(folder.name);
      deletedCount++;
    } catch (error) {
      // Folder has shortcuts, skip it
      continue;
    }
  }

  console.log(`Cleaned up ${deletedCount} empty folder(s)`);
  return deletedCount;
};

/**
 * Get folder suggestions based on existing folders
 * @returns {Promise<array>} List of folder names
 */
export const getFolderSuggestions = async () => {
  const folders = await getAllFolders();
  return folders.map((f) => f.name).sort();
};

/**
 * Check if folder has shortcuts
 * @param {string} name - Folder name
 * @returns {Promise<boolean>} True if folder has shortcuts
 */
export const folderHasShortcuts = async (name) => {
  const shortcuts = await getShortcutsByFolder(name);
  return shortcuts.length > 0;
};

/**
 * Get folder size (number of shortcuts)
 * @param {string} name - Folder name
 * @returns {Promise<number>} Number of shortcuts in folder
 */
export const getFolderSize = async (name) => {
  const shortcuts = await getShortcutsByFolder(name);
  return shortcuts.length;
};
