/**
 * useFoldersData Hook
 * Custom hook for managing folder data operations
 * Integrates store state with folder service layer
 */

import { useEffect, useCallback } from 'react';
import { useFolders, useUI } from '../store/appStore';
import * as folderService from '../services/folderService';
import { log } from '../services/chromeApi';

export const useFoldersData = () => {
  const { folders, setFolders, addFolder: storeAddFolder, deleteFolder: storeDeleteFolder, selectFolder } =
    useFolders();

  const { showSuccess, showError } = useUI();

  // Load all folders on mount
  const loadFolders = useCallback(async () => {
    try {
      const folders = await folderService.getAllFoldersWithCounts();
      setFolders(folders);
      log('log', `Loaded ${folders.length} folders`);
    } catch (error) {
      log('error', 'Failed to load folders', error);
      showError('Failed to load folders');
    }
  }, [setFolders, showError]);

  useEffect(() => {
    loadFolders();
  }, [loadFolders]);

  // Create folder
  const createFolder = useCallback(
    async (name) => {
      try {
        const folder = await folderService.createFolder(name);
        storeAddFolder(folder);
        showSuccess(`Folder created: ${name}`);
        return folder;
      } catch (error) {
        const errorMsg = error.message || 'Failed to create folder';
        log('error', errorMsg);
        showError(errorMsg);
        throw error;
      }
    },
    [storeAddFolder, showSuccess, showError]
  );

  // Get folder by name
  const getFolder = useCallback(
    async (name) => {
      try {
        const folder = await folderService.getFolderByName(name);
        return folder;
      } catch (error) {
        log('error', 'Failed to get folder', error);
        return null;
      }
    },
    []
  );

  // Rename folder
  const renameFolder = useCallback(
    async (oldName, newName) => {
      try {
        const updated = await folderService.renameFolder(oldName, newName);
        // Reload folders to reflect changes
        await loadFolders();
        showSuccess(`Folder renamed: ${oldName} → ${newName}`);
        return updated;
      } catch (error) {
        const errorMsg = error.message || 'Failed to rename folder';
        log('error', errorMsg);
        showError(errorMsg);
        throw error;
      }
    },
    [loadFolders, showSuccess, showError]
  );

  // Delete folder
  const deleteFolder = useCallback(
    async (name) => {
      try {
        await folderService.deleteFolder(name);
        storeDeleteFolder(name);
        showSuccess(`Folder deleted: ${name}`);
        return true;
      } catch (error) {
        const errorMsg = error.message || 'Failed to delete folder';
        log('error', errorMsg);
        showError(errorMsg);
        return false;
      }
    },
    [storeDeleteFolder, showSuccess, showError]
  );

  // Get folder suggestions
  const getSuggestions = useCallback(async () => {
    try {
      const suggestions = await folderService.getFolderSuggestions();
      return suggestions;
    } catch (error) {
      log('error', 'Failed to get folder suggestions', error);
      return [];
    }
  }, []);

  // Check if folder name is available
  const isNameAvailable = useCallback(
    async (name) => {
      try {
        const available = await folderService.isFolderNameAvailable(name);
        return available;
      } catch (error) {
        log('error', 'Failed to check folder name availability', error);
        return false;
      }
    },
    []
  );

  // Get folder statistics
  const getStats = useCallback(
    async (name) => {
      try {
        const stats = await folderService.getFolderStats(name);
        return stats;
      } catch (error) {
        log('error', 'Failed to get folder stats', error);
        return null;
      }
    },
    []
  );

  // Clean up empty folders
  const cleanupEmpty = useCallback(async () => {
    try {
      const count = await folderService.cleanupEmptyFolders();
      if (count > 0) {
        await loadFolders();
        showSuccess(`Cleaned up ${count} empty folder(s)`);
      }
      return count;
    } catch (error) {
      log('error', 'Cleanup failed', error);
      return 0;
    }
  }, [loadFolders, showSuccess]);

  return {
    // State
    folders,

    // CRUD
    createFolder,
    getFolder,
    renameFolder,
    deleteFolder,

    // Query
    getSuggestions,
    isNameAvailable,
    getStats,

    // Interactions
    selectFolder,

    // Utilities
    cleanupEmpty,
    loadFolders,
  };
};
