/**
 * Sync Service
 * Handles Chrome profile sync for shortcuts data
 */

import { getAllShortcuts, getFolderStats } from './shortcutService';

/**
 * Check if Chrome sync is available
 * @returns {boolean} True if sync is available
 */
export const isSyncAvailable = () => {
  return typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync;
};

/**
 * Get sync quota information
 * @returns {Promise<Object>} Sync quota info
 */
export const getSyncQuota = async () => {
  if (!isSyncAvailable()) {
    return { available: false };
  }

  try {
    const quota = await chrome.storage.sync.getBytesInUse();
    return {
      available: true,
      used: quota,
      max: 100 * 1024, // 100KB limit for sync storage
      remaining: (100 * 1024) - quota,
      percentage: (quota / (100 * 1024)) * 100
    };
  } catch (error) {
    console.error('Error getting sync quota:', error);
    return { available: false, error: error.message };
  }
};

/**
 * Save shortcuts to Chrome sync storage
 * @param {Array} shortcuts - Shortcuts to sync
 * @returns {Promise<Object>} Sync result
 */
export const syncToChrome = async (shortcuts) => {
  if (!isSyncAvailable()) {
    throw new Error('Chrome sync not available');
  }

  try {
    // Compress data for sync storage (100KB limit)
    const syncData = {
      shortcuts: shortcuts.map(shortcut => ({
        id: shortcut.id,
        url: shortcut.url,
        alias: shortcut.alias,
        folder: shortcut.folder || '',
        tags: shortcut.tags || [],
        createdAt: shortcut.createdAt,
        accessCount: shortcut.accessCount || 0,
        lastAccessed: shortcut.lastAccessed,
        isFavorite: shortcut.isFavorite || false
      })),
      syncDate: Date.now(),
      version: '1.0.0'
    };

    // Check size before syncing
    const dataSize = JSON.stringify(syncData).length;
    if (dataSize > 100 * 1024) {
      throw new Error(`Data too large for sync (${Math.round(dataSize / 1024)}KB). Consider using export instead.`);
    }

    await chrome.storage.sync.set({ linkvaultData: syncData });
    
    return {
      success: true,
      shortcutsCount: shortcuts.length,
      dataSize: dataSize,
      syncDate: syncData.syncDate
    };
  } catch (error) {
    console.error('Error syncing to Chrome:', error);
    throw error;
  }
};

/**
 * Load shortcuts from Chrome sync storage
 * @returns {Promise<Object>} Sync data
 */
export const loadFromChrome = async () => {
  if (!isSyncAvailable()) {
    throw new Error('Chrome sync not available');
  }

  try {
    const result = await chrome.storage.sync.get(['linkvaultData']);
    if (!result.linkvaultData) {
      return { success: false, message: 'No sync data found' };
    }

    const syncData = result.linkvaultData;
    return {
      success: true,
      shortcuts: syncData.shortcuts || [],
      syncDate: syncData.syncDate,
      version: syncData.version,
      shortcutsCount: syncData.shortcuts?.length || 0
    };
  } catch (error) {
    console.error('Error loading from Chrome sync:', error);
    throw error;
  }
};

/**
 * Clear Chrome sync data
 * @returns {Promise<Object>} Clear result
 */
export const clearChromeSync = async () => {
  if (!isSyncAvailable()) {
    throw new Error('Chrome sync not available');
  }

  try {
    await chrome.storage.sync.clear();
    return { success: true };
  } catch (error) {
    console.error('Error clearing Chrome sync:', error);
    throw error;
  }
};

/**
 * Check if sync data exists
 * @returns {Promise<boolean>} True if sync data exists
 */
export const hasSyncData = async () => {
  if (!isSyncAvailable()) {
    return false;
  }

  try {
    const result = await chrome.storage.sync.get(['linkvaultData']);
    return !!result.linkvaultData;
  } catch (error) {
    console.error('Error checking sync data:', error);
    return false;
  }
};

/**
 * Get sync status and statistics
 * @returns {Promise<Object>} Sync status
 */
export const getSyncStatus = async () => {
  try {
    const quota = await getSyncQuota();
    const hasData = await hasSyncData();
    
    if (!quota.available) {
      return {
        available: false,
        message: 'Chrome sync not available'
      };
    }

    if (hasData) {
      const syncData = await loadFromChrome();
      return {
        available: true,
        synced: true,
        lastSync: syncData.syncDate ? new Date(syncData.syncDate) : null,
        shortcutsCount: syncData.shortcutsCount,
        quota: quota
      };
    }

    return {
      available: true,
      synced: false,
      quota: quota
    };
  } catch (error) {
    console.error('Error getting sync status:', error);
    return {
      available: false,
      error: error.message
    };
  }
};

/**
 * Auto-sync shortcuts to Chrome (called after create/update/delete)
 * @param {Array} shortcuts - Current shortcuts
 */
export const autoSync = async (shortcuts) => {
  try {
    if (!isSyncAvailable()) {
      return; // Silently fail if sync not available
    }

    const quota = await getSyncQuota();
    if (!quota.available) {
      return;
    }

    // Only sync if data is small enough
    const dataSize = JSON.stringify(shortcuts).length;
    if (dataSize < 80 * 1024) { // Leave some buffer
      await syncToChrome(shortcuts);
      console.log('Auto-sync completed');
    } else {
      console.log('Data too large for auto-sync, manual sync required');
    }
  } catch (error) {
    console.warn('Auto-sync failed:', error.message);
    // Don't throw - auto-sync should not break the app
  }
};
