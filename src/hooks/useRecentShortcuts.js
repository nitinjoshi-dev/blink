/**
 * useRecentShortcuts Hook
 * Manages recent shortcuts, access tracking, and favorites
 */

import { useState, useEffect, useCallback } from 'react';
import { getAllShortcuts, updateShortcut } from '../services/shortcutService';

/**
 * useRecentShortcuts Hook
 * @param {Object} options - Configuration options
 * @param {number} options.maxRecent - Maximum number of recent shortcuts to track (default: 10)
 * @param {number} options.recentDays - Number of days to consider for recent (default: 7)
 * @param {boolean} options.autoUpdate - Whether to automatically update access counts (default: true)
 * @returns {Object} Recent shortcuts utilities and data
 */
export function useRecentShortcuts(options = {}) {
  const {
    maxRecent = 10,
    recentDays = 7,
    autoUpdate = true
  } = options;

  const [shortcuts, setShortcuts] = useState([]);
  const [recentShortcuts, setRecentShortcuts] = useState([]);
  const [favoriteShortcuts, setFavoriteShortcuts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load shortcuts on mount
  useEffect(() => {
    loadShortcuts();
  }, []);

  // Update recent shortcuts when shortcuts change
  useEffect(() => {
    if (shortcuts.length > 0) {
      updateRecentShortcuts();
      updateFavoriteShortcuts();
    }
  }, [shortcuts]);

  const loadShortcuts = async () => {
    try {
      setIsLoading(true);
      const allShortcuts = await getAllShortcuts();
      setShortcuts(allShortcuts);
    } catch (err) {
      console.error('Error loading shortcuts for recent tracking:', err);
      setError('Failed to load shortcuts');
    } finally {
      setIsLoading(false);
    }
  };

  const updateRecentShortcuts = useCallback(() => {
    const cutoffDate = Date.now() - (recentDays * 24 * 60 * 60 * 1000);
    
    const recent = shortcuts
      .filter(shortcut => 
        shortcut.lastAccessed && 
        shortcut.lastAccessed > cutoffDate
      )
      .sort((a, b) => (b.lastAccessed || 0) - (a.lastAccessed || 0))
      .slice(0, maxRecent);
    
    setRecentShortcuts(recent);
  }, [shortcuts, recentDays, maxRecent]);

  const updateFavoriteShortcuts = useCallback(() => {
    const favorites = shortcuts
      .filter(shortcut => shortcut.isFavorite)
      .sort((a, b) => (b.accessCount || 0) - (a.accessCount || 0));
    
    setFavoriteShortcuts(favorites);
  }, [shortcuts]);

  const trackAccess = useCallback(async (shortcutId) => {
    if (!autoUpdate) return;

    try {
      const shortcut = shortcuts.find(s => s.id === shortcutId);
      if (!shortcut) return;

      const updatedShortcut = {
        ...shortcut,
        accessCount: (shortcut.accessCount || 0) + 1,
        lastAccessed: Date.now()
      };

      // Update in local state
      setShortcuts(prev => 
        prev.map(s => s.id === shortcutId ? updatedShortcut : s)
      );

      // Update in storage
      await updateShortcut(shortcutId, {
        accessCount: updatedShortcut.accessCount,
        lastAccessed: updatedShortcut.lastAccessed
      });

      console.log('Access tracked for shortcut:', shortcutId);
    } catch (err) {
      console.error('Error tracking access:', err);
    }
  }, [shortcuts, autoUpdate]);

  const toggleFavorite = useCallback(async (shortcutId) => {
    try {
      const shortcut = shortcuts.find(s => s.id === shortcutId);
      if (!shortcut) return;

      const updatedShortcut = {
        ...shortcut,
        isFavorite: !shortcut.isFavorite
      };

      // Update in local state
      setShortcuts(prev => 
        prev.map(s => s.id === shortcutId ? updatedShortcut : s)
      );

      // Update in storage
      await updateShortcut(shortcutId, {
        isFavorite: updatedShortcut.isFavorite
      });

      console.log('Favorite toggled for shortcut:', shortcutId);
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  }, [shortcuts]);

  const getMostUsedShortcuts = useCallback((limit = 10) => {
    return shortcuts
      .filter(shortcut => (shortcut.accessCount || 0) > 0)
      .sort((a, b) => (b.accessCount || 0) - (a.accessCount || 0))
      .slice(0, limit);
  }, [shortcuts]);

  const getShortcutsByFolder = useCallback((folderName) => {
    return shortcuts.filter(shortcut => 
      (shortcut.folder || '') === folderName
    );
  }, [shortcuts]);

  const getShortcutsByTag = useCallback((tag) => {
    return shortcuts.filter(shortcut => 
      (shortcut.tags || []).includes(tag)
    );
  }, [shortcuts]);

  const searchShortcuts = useCallback((query) => {
    if (!query.trim()) return shortcuts;

    const searchText = query.toLowerCase();
    return shortcuts.filter(shortcut => {
      const aliasMatch = shortcut.alias.toLowerCase().includes(searchText);
      const urlMatch = shortcut.url.toLowerCase().includes(searchText);
      const tagMatch = (shortcut.tags || []).some(tag => 
        tag.toLowerCase().includes(searchText)
      );
      const folderMatch = (shortcut.folder || '').toLowerCase().includes(searchText);
      
      return aliasMatch || urlMatch || tagMatch || folderMatch;
    });
  }, [shortcuts]);

  const getShortcutStats = useCallback(() => {
    const total = shortcuts.length;
    const withAccess = shortcuts.filter(s => (s.accessCount || 0) > 0).length;
    const favorites = shortcuts.filter(s => s.isFavorite).length;
    const recent = recentShortcuts.length;
    const mostUsed = getMostUsedShortcuts(1)[0];
    
    const totalAccess = shortcuts.reduce((sum, s) => sum + (s.accessCount || 0), 0);
    const avgAccess = total > 0 ? (totalAccess / total).toFixed(1) : 0;

    return {
      total,
      withAccess,
      favorites,
      recent,
      totalAccess,
      avgAccess,
      mostUsed: mostUsed ? {
        alias: mostUsed.alias,
        accessCount: mostUsed.accessCount
      } : null
    };
  }, [shortcuts, recentShortcuts, getMostUsedShortcuts]);

  const refreshShortcuts = useCallback(async () => {
    await loadShortcuts();
  }, []);

  return {
    // Data
    shortcuts,
    recentShortcuts,
    favoriteShortcuts,
    isLoading,
    error,
    
    // Actions
    trackAccess,
    toggleFavorite,
    refreshShortcuts,
    
    // Utilities
    getMostUsedShortcuts,
    getShortcutsByFolder,
    getShortcutsByTag,
    searchShortcuts,
    getShortcutStats,
    
    // Computed values
    hasRecent: recentShortcuts.length > 0,
    hasFavorites: favoriteShortcuts.length > 0,
    totalShortcuts: shortcuts.length
  };
}

export default useRecentShortcuts;
