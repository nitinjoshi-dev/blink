/**
 * Import/Export Service
 * Handles importing and exporting shortcuts data
 */

import { getAllShortcuts, getFolderStats } from './shortcutService';

/**
 * Export shortcuts to JSON file
 * @param {boolean} includeFolders - Whether to include folder data
 * @returns {Promise<Object>} Export data
 */
export const exportShortcuts = async (includeFolders = true) => {
  try {
    const shortcuts = await getAllShortcuts();
    const exportData = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      shortcuts: shortcuts.map(shortcut => ({
        id: shortcut.id,
        url: shortcut.url,
        alias: shortcut.alias,
        folder: shortcut.folder,
        tags: shortcut.tags,
        createdAt: shortcut.createdAt,
        accessCount: shortcut.accessCount || 0,
        lastAccessed: shortcut.lastAccessed,
        isFavorite: shortcut.isFavorite || false
      }))
    };

    if (includeFolders) {
      const folderStats = await getFolderStats();
      exportData.folders = Object.keys(folderStats).map(folderName => ({
        name: folderName,
        count: folderStats[folderName]
      }));
    }

    return exportData;
  } catch (error) {
    console.error('Error exporting shortcuts:', error);
    throw new Error('Failed to export shortcuts');
  }
};

/**
 * Download shortcuts as JSON file
 * @param {Object} exportData - Data to export
 * @param {string} filename - Filename for download
 */
export const downloadExport = (exportData, filename = 'linkvault-export.json') => {
  try {
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log('Export downloaded:', filename);
  } catch (error) {
    console.error('Error downloading export:', error);
    throw new Error('Failed to download export');
  }
};

/**
 * Import shortcuts from JSON file
 * @param {File} file - JSON file to import
 * @returns {Promise<Object>} Import result
 */
export const importShortcuts = async (file) => {
  try {
    const text = await file.text();
    const importData = JSON.parse(text);
    
    // Validate import data
    if (!importData.shortcuts || !Array.isArray(importData.shortcuts)) {
      throw new Error('Invalid import file format');
    }

    // Validate each shortcut
    const validShortcuts = importData.shortcuts.filter(shortcut => {
      return shortcut.url && shortcut.alias;
    });

    if (validShortcuts.length === 0) {
      throw new Error('No valid shortcuts found in import file');
    }

    return {
      success: true,
      shortcuts: validShortcuts,
      folders: importData.folders || [],
      version: importData.version || '1.0.0',
      exportDate: importData.exportDate,
      totalShortcuts: importData.shortcuts.length,
      validShortcuts: validShortcuts.length,
      invalidShortcuts: importData.shortcuts.length - validShortcuts.length
    };
  } catch (error) {
    console.error('Error importing shortcuts:', error);
    if (error instanceof SyntaxError) {
      throw new Error('Invalid JSON file format');
    }
    throw error;
  }
};

/**
 * Validate import file before processing
 * @param {File} file - File to validate
 * @returns {Promise<Object>} Validation result
 */
export const validateImportFile = async (file) => {
  try {
    if (!file.name.endsWith('.json')) {
      return { valid: false, error: 'File must be a JSON file' };
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      return { valid: false, error: 'File size too large (max 10MB)' };
    }

    const text = await file.text();
    const data = JSON.parse(text);
    
    if (!data.shortcuts || !Array.isArray(data.shortcuts)) {
      return { valid: false, error: 'Invalid file format - missing shortcuts array' };
    }

    return { valid: true, data };
  } catch (error) {
    if (error instanceof SyntaxError) {
      return { valid: false, error: 'Invalid JSON format' };
    }
    return { valid: false, error: 'Failed to read file' };
  }
};

/**
 * Get export statistics
 * @returns {Promise<Object>} Export statistics
 */
export const getExportStats = async () => {
  try {
    const shortcuts = await getAllShortcuts();
    const totalAccess = shortcuts.reduce((sum, s) => sum + (s.accessCount || 0), 0);
    const favorites = shortcuts.filter(s => s.isFavorite).length;
    const recent = shortcuts.filter(s => s.lastAccessed && (Date.now() - s.lastAccessed) < 7 * 24 * 60 * 60 * 1000).length;
    
    return {
      totalShortcuts: shortcuts.length,
      totalAccess,
      favorites,
      recent,
      avgAccess: shortcuts.length > 0 ? (totalAccess / shortcuts.length).toFixed(1) : 0
    };
  } catch (error) {
    console.error('Error getting export stats:', error);
    return {
      totalShortcuts: 0,
      totalAccess: 0,
      favorites: 0,
      recent: 0,
      avgAccess: 0
    };
  }
};
