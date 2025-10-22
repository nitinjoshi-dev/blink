/**
 * useShortcutsData Hook
 * Custom hook for managing shortcut data operations
 * Integrates store state with database service layer
 */

import { useEffect, useCallback } from 'react';
import { useShortcuts, useUI, useUndo } from '../store/appStore';
import * as shortcutService from '../services/shortcutService';
import * as folderService from '../services/folderService';
import { log } from '../services/chromeApi';

export const useShortcutsData = () => {
  const {
    shortcuts,
    setShortcuts,
    addShortcut: storeAddShortcut,
    updateShortcut: storeUpdateShortcut,
    deleteShortcut: storeDeleteShortcut,
    selectShortcut,
    setEditingShortcut,
  } = useShortcuts();

  const { showSuccess, showError } = useUI();
  const { addToUndoStack } = useUndo();

  // Load all shortcuts on mount
  const loadShortcuts = useCallback(async () => {
    try {
      const shortcuts = await shortcutService.getAllShortcuts();
      setShortcuts(shortcuts);
      log('log', `Loaded ${shortcuts.length} shortcuts`);
    } catch (error) {
      log('error', 'Failed to load shortcuts', error);
      showError('Failed to load shortcuts');
    }
  }, [setShortcuts, showError]);

  useEffect(() => {
    loadShortcuts();
  }, [loadShortcuts]);

  // Create new shortcut
  const createShortcut = useCallback(
    async (data) => {
      try {
        const shortcut = await shortcutService.createShortcut(data);
        storeAddShortcut(shortcut);
        showSuccess(`Shortcut created: ${data.alias}`);
        return shortcut;
      } catch (error) {
        const errorMsg = error.message || 'Failed to create shortcut';
        log('error', errorMsg);
        showError(errorMsg);
        throw error;
      }
    },
    [storeAddShortcut, showSuccess, showError]
  );

  // Get shortcut details
  const getShortcut = useCallback(
    async (id) => {
      try {
        const shortcut = await shortcutService.getShortcut(id);
        return shortcut;
      } catch (error) {
        log('error', 'Failed to get shortcut', error);
        return null;
      }
    },
    []
  );

  // Update shortcut
  const updateShortcut = useCallback(
    async (id, updates) => {
      try {
        const existing = await shortcutService.getShortcut(id);
        const updated = await shortcutService.updateShortcut(id, updates);
        storeUpdateShortcut(id, updates);
        showSuccess('Shortcut updated');
        return updated;
      } catch (error) {
        const errorMsg = error.message || 'Failed to update shortcut';
        log('error', errorMsg);
        showError(errorMsg);
        throw error;
      }
    },
    [storeUpdateShortcut, showSuccess, showError]
  );

  // Delete shortcut
  const deleteShortcut = useCallback(
    async (id) => {
      try {
        const shortcut = await shortcutService.getShortcut(id);
        if (!shortcut) throw new Error('Shortcut not found');

        await shortcutService.deleteShortcut(id);
        storeDeleteShortcut(id);

        // Add to undo stack
        addToUndoStack('delete', shortcut);

        showSuccess(`Deleted: ${shortcut.alias}`, 5000);
        return true;
      } catch (error) {
        const errorMsg = error.message || 'Failed to delete shortcut';
        log('error', errorMsg);
        showError(errorMsg);
        return false;
      }
    },
    [storeDeleteShortcut, addToUndoStack, showSuccess, showError]
  );

  // Search shortcuts
  const searchShortcuts = useCallback(
    async (query) => {
      try {
        const results = await shortcutService.searchShortcuts(query);
        return results;
      } catch (error) {
        log('error', 'Search failed', error);
        return [];
      }
    },
    []
  );

  // Get frequent shortcuts
  const getFrequent = useCallback(
    async (limit = 10) => {
      try {
        const frequent = await shortcutService.getFrequentShortcuts(limit);
        return frequent;
      } catch (error) {
        log('error', 'Failed to get frequent shortcuts', error);
        return [];
      }
    },
    []
  );

  // Increment access count
  const recordAccess = useCallback(
    async (id) => {
      try {
        const updated = await shortcutService.incrementAccessCount(id);
        storeUpdateShortcut(id, {
          accessCount: updated.accessCount,
          lastAccessedAt: updated.lastAccessedAt,
        });
      } catch (error) {
        log('warn', 'Failed to record access');
      }
    },
    [storeUpdateShortcut]
  );

  // Get shortcuts by folder
  const getByFolder = useCallback(
    async (folder) => {
      try {
        const shortcuts = await shortcutService.getShortcutsByFolder(folder);
        return shortcuts;
      } catch (error) {
        log('error', 'Failed to get shortcuts by folder', error);
        return [];
      }
    },
    []
  );

  // Get shortcuts by tag
  const getByTag = useCallback(
    async (tag) => {
      try {
        const shortcuts = await shortcutService.getShortcutsByTag(tag);
        return shortcuts;
      } catch (error) {
        log('error', 'Failed to get shortcuts by tag', error);
        return [];
      }
    },
    []
  );

  // Undo deletion
  const undoDeletion = useCallback(
    async (shortcut) => {
      try {
        const restored = await shortcutService.createShortcut(shortcut);
        storeAddShortcut(restored);
        showSuccess(`Restored: ${shortcut.alias}`);
        return restored;
      } catch (error) {
        const errorMsg = error.message || 'Failed to restore shortcut';
        log('error', errorMsg);
        showError(errorMsg);
      }
    },
    [storeAddShortcut, showSuccess, showError]
  );

  // Get statistics
  const getStats = useCallback(
    async () => {
      try {
        const stats = await shortcutService.getStatistics();
        return stats;
      } catch (error) {
        log('error', 'Failed to get statistics', error);
        return null;
      }
    },
    []
  );

  return {
    // State
    shortcuts,

    // CRUD
    createShortcut,
    getShortcut,
    updateShortcut,
    deleteShortcut,

    // Search & Query
    searchShortcuts,
    getFrequent,
    getByFolder,
    getByTag,
    getStats,

    // Interactions
    recordAccess,
    undoDeletion,
    selectShortcut,
    setEditingShortcut,

    // Utilities
    loadShortcuts,
  };
};
