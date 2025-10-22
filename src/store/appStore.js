/**
 * App Store - Zustand Central State Management
 * Manages: shortcuts, folders, search, UI state, undo stack
 * Single source of truth for the entire application
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// Action creators
const createShortcutsSlice = (set, get) => ({
  // State
  shortcuts: [],
  selectedShortcutId: null,
  editingShortcutId: null,

  // Actions
  setShortcuts: (shortcuts) =>
    set({ shortcuts }, false, { type: 'setShortcuts' }),

  addShortcut: (shortcut) =>
    set(
      (state) => ({
        shortcuts: [...state.shortcuts, shortcut],
      }),
      false,
      { type: 'addShortcut' }
    ),

  updateShortcut: (id, updates) =>
    set(
      (state) => ({
        shortcuts: state.shortcuts.map((s) => (s.id === id ? { ...s, ...updates } : s)),
      }),
      false,
      { type: 'updateShortcut' }
    ),

  deleteShortcut: (id) =>
    set(
      (state) => ({
        shortcuts: state.shortcuts.filter((s) => s.id !== id),
        selectedShortcutId: state.selectedShortcutId === id ? null : state.selectedShortcutId,
        editingShortcutId: state.editingShortcutId === id ? null : state.editingShortcutId,
      }),
      false,
      { type: 'deleteShortcut' }
    ),

  selectShortcut: (id) => set({ selectedShortcutId: id }, false, { type: 'selectShortcut' }),

  setEditingShortcut: (id) => set({ editingShortcutId: id }, false, { type: 'setEditingShortcut' }),

  clearSelection: () => set({ selectedShortcutId: null }, false, { type: 'clearSelection' }),

  // Getters
  getShortcutById: (id) => {
    const state = get();
    return state.shortcuts.find((s) => s.id === id);
  },

  getShortcutsByFolder: (folder) => {
    const state = get();
    const folderNorm = (folder || '').trim().toLowerCase();
    return state.shortcuts.filter((s) => (s.folder || '').trim().toLowerCase() === folderNorm);
  },

  getTotalCount: () => get().shortcuts.length,
});

const createFoldersSlice = (set, get) => ({
  // State
  folders: [],
  selectedFolder: null,

  // Actions
  setFolders: (folders) => set({ folders }, false, { type: 'setFolders' }),

  addFolder: (folder) =>
    set(
      (state) => ({
        folders: [...state.folders, folder],
      }),
      false,
      { type: 'addFolder' }
    ),

  updateFolder: (name, updates) =>
    set(
      (state) => ({
        folders: state.folders.map((f) => (f.name === name ? { ...f, ...updates } : f)),
      }),
      false,
      { type: 'updateFolder' }
    ),

  deleteFolder: (name) =>
    set(
      (state) => ({
        folders: state.folders.filter((f) => f.name !== name),
        selectedFolder: state.selectedFolder === name ? null : state.selectedFolder,
      }),
      false,
      { type: 'deleteFolder' }
    ),

  selectFolder: (name) => set({ selectedFolder: name }, false, { type: 'selectFolder' }),

  // Getters
  getFolderByName: (name) => {
    const state = get();
    const folderNorm = (name || '').trim().toLowerCase();
    return state.folders.find((f) => f.name.toLowerCase() === folderNorm);
  },

  getAllFolders: () => get().folders,
});

const createSearchSlice = (set, get) => ({
  // State
  searchQuery: '',
  searchResults: [],
  isSearching: false,

  // Actions
  setSearchQuery: (query) => set({ searchQuery: query }, false, { type: 'setSearchQuery' }),

  setSearchResults: (results) => set({ searchResults: results }, false, { type: 'setSearchResults' }),

  setIsSearching: (isSearching) =>
    set({ isSearching }, false, { type: 'setIsSearching' }),

  clearSearch: () =>
    set(
      { searchQuery: '', searchResults: [], isSearching: false },
      false,
      { type: 'clearSearch' }
    ),

  // Getters
  getSearchResults: () => get().searchResults,
});

const createUISlice = (set, get) => ({
  // State
  showDashboard: false,
  showSearchPopup: false,
  showCreateModal: false,
  showEditModal: false,
  showDeleteConfirm: false,
  toasts: [],

  // Actions
  setShowDashboard: (show) => set({ showDashboard: show }, false, { type: 'setShowDashboard' }),

  setShowSearchPopup: (show) =>
    set({ showSearchPopup: show }, false, { type: 'setShowSearchPopup' }),

  setShowCreateModal: (show) => set({ showCreateModal: show }, false, { type: 'setShowCreateModal' }),

  setShowEditModal: (show) => set({ showEditModal: show }, false, { type: 'setShowEditModal' }),

  setShowDeleteConfirm: (show) =>
    set({ showDeleteConfirm: show }, false, { type: 'setShowDeleteConfirm' }),

  addToast: (message, type = 'info', duration = 5000) => {
    const id = Date.now();
    const toast = { id, message, type };

    set(
      (state) => ({
        toasts: [...state.toasts, toast],
      }),
      false,
      { type: 'addToast' }
    );

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, duration);
    }

    return id;
  },

  removeToast: (id) =>
    set(
      (state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }),
      false,
      { type: 'removeToast' }
    ),

  clearToasts: () => set({ toasts: [] }, false, { type: 'clearToasts' }),

  // Convenience methods
  showSuccess: (message, duration = 5000) => get().addToast(message, 'success', duration),
  showError: (message, duration = 5000) => get().addToast(message, 'error', duration),
  showWarning: (message, duration = 5000) => get().addToast(message, 'warning', duration),
  showInfo: (message, duration = 5000) => get().addToast(message, 'info', duration),
});

const createUndoSlice = (set, get) => ({
  // State
  undoStack: [],
  undoTimestamps: {},

  // Actions
  addToUndoStack: (action, shortcut) => {
    const id = Date.now();
    set(
      (state) => ({
        undoStack: [{ id, action, shortcut }, ...state.undoStack].slice(0, 10),
        undoTimestamps: { ...state.undoTimestamps, [id]: Date.now() },
      }),
      false,
      { type: 'addToUndoStack' }
    );

    // Auto-remove after 30 seconds
    setTimeout(() => {
      get().removeFromUndoStack(id);
    }, 30000);
  },

  removeFromUndoStack: (id) =>
    set(
      (state) => {
        const newTimestamps = { ...state.undoTimestamps };
        delete newTimestamps[id];
        return {
          undoStack: state.undoStack.filter((item) => item.id !== id),
          undoTimestamps: newTimestamps,
        };
      },
      false,
      { type: 'removeFromUndoStack' }
    ),

  undo: () => {
    const state = get();
    if (state.undoStack.length === 0) return null;

    const lastUndo = state.undoStack[0];
    get().removeFromUndoStack(lastUndo.id);
    return lastUndo;
  },

  clearUndoStack: () =>
    set(
      { undoStack: [], undoTimestamps: {} },
      false,
      { type: 'clearUndoStack' }
    ),

  // Getters
  canUndo: () => get().undoStack.length > 0,

  getUndoCount: () => get().undoStack.length,
});

const createLoadingSlice = (set) => ({
  // State
  isLoading: false,
  isLoadingShortcuts: false,
  isLoadingFolders: false,
  errorMessage: null,

  // Actions
  setIsLoading: (loading) => set({ isLoading: loading }, false, { type: 'setIsLoading' }),

  setIsLoadingShortcuts: (loading) =>
    set({ isLoadingShortcuts: loading }, false, { type: 'setIsLoadingShortcuts' }),

  setIsLoadingFolders: (loading) =>
    set({ isLoadingFolders: loading }, false, { type: 'setIsLoadingFolders' }),

  setErrorMessage: (message) => set({ errorMessage: message }, false, { type: 'setErrorMessage' }),

  clearErrorMessage: () => set({ errorMessage: null }, false, { type: 'clearErrorMessage' }),
});

const createFilterSlice = (set, get) => ({
  // State
  filterByFolder: null,
  filterByTag: null,
  sortBy: 'alias', // 'alias' | 'folder' | 'recent' | 'popular'

  // Actions
  setFilterByFolder: (folder) =>
    set({ filterByFolder: folder }, false, { type: 'setFilterByFolder' }),

  setFilterByTag: (tag) => set({ filterByTag: tag }, false, { type: 'setFilterByTag' }),

  setSortBy: (sortBy) => set({ sortBy }, false, { type: 'setSortBy' }),

  clearFilters: () =>
    set(
      { filterByFolder: null, filterByTag: null },
      false,
      { type: 'clearFilters' }
    ),

  // Getters
  getFilteredShortcuts: () => {
    const state = get();
    let filtered = state.shortcuts;

    if (state.filterByFolder) {
      const folderNorm = state.filterByFolder.toLowerCase();
      filtered = filtered.filter(
        (s) => (s.folder || '').toLowerCase() === folderNorm
      );
    }

    if (state.filterByTag) {
      filtered = filtered.filter((s) =>
        (s.tags || []).some((t) => t.toLowerCase() === state.filterByTag.toLowerCase())
      );
    }

    // Sort
    const sorted = [...filtered];
    switch (state.sortBy) {
      case 'folder':
        sorted.sort((a, b) => (a.folder || '').localeCompare(b.folder || ''));
        break;
      case 'recent':
        sorted.sort(
          (a, b) => new Date(b.lastAccessedAt || 0) - new Date(a.lastAccessedAt || 0)
        );
        break;
      case 'popular':
        sorted.sort((a, b) => (b.accessCount || 0) - (a.accessCount || 0));
        break;
      case 'alias':
      default:
        sorted.sort((a, b) => (a.alias || '').localeCompare(b.alias || ''));
    }

    return sorted;
  },
});

// Create the combined store
export const useAppStore = create(
  devtools(
    (set, get) => ({
      ...createShortcutsSlice(set, get),
      ...createFoldersSlice(set, get),
      ...createSearchSlice(set, get),
      ...createUISlice(set, get),
      ...createUndoSlice(set, get),
      ...createLoadingSlice(set, get),
      ...createFilterSlice(set, get),
    }),
    {
      name: 'AppStore',
    }
  )
);

// Selector hooks for performance optimization
export const useShortcuts = () =>
  useAppStore((state) => ({
    shortcuts: state.shortcuts,
    selectedShortcutId: state.selectedShortcutId,
    editingShortcutId: state.editingShortcutId,
    addShortcut: state.addShortcut,
    updateShortcut: state.updateShortcut,
    deleteShortcut: state.deleteShortcut,
    selectShortcut: state.selectShortcut,
    setEditingShortcut: state.setEditingShortcut,
  }));

export const useFolders = () =>
  useAppStore((state) => ({
    folders: state.folders,
    selectedFolder: state.selectedFolder,
    addFolder: state.addFolder,
    deleteFolder: state.deleteFolder,
    selectFolder: state.selectFolder,
  }));

export const useSearch = () =>
  useAppStore((state) => ({
    searchQuery: state.searchQuery,
    searchResults: state.searchResults,
    isSearching: state.isSearching,
    setSearchQuery: state.setSearchQuery,
    setSearchResults: state.setSearchResults,
    clearSearch: state.clearSearch,
  }));

export const useUI = () =>
  useAppStore((state) => ({
    showDashboard: state.showDashboard,
    showSearchPopup: state.showSearchPopup,
    toasts: state.toasts,
    setShowDashboard: state.setShowDashboard,
    setShowSearchPopup: state.setShowSearchPopup,
    addToast: state.addToast,
    removeToast: state.removeToast,
    showSuccess: state.showSuccess,
    showError: state.showError,
  }));

export const useUndo = () =>
  useAppStore((state) => ({
    undoStack: state.undoStack,
    addToUndoStack: state.addToUndoStack,
    undo: state.undo,
    canUndo: state.canUndo,
    getUndoCount: state.getUndoCount,
  }));

export const useLoading = () =>
  useAppStore((state) => ({
    isLoading: state.isLoading,
    isLoadingShortcuts: state.isLoadingShortcuts,
    isLoadingFolders: state.isLoadingFolders,
    errorMessage: state.errorMessage,
    setIsLoading: state.setIsLoading,
    setIsLoadingShortcuts: state.setIsLoadingShortcuts,
    setIsLoadingFolders: state.setIsLoadingFolders,
    setErrorMessage: state.setErrorMessage,
  }));

export const useFilter = () =>
  useAppStore((state) => ({
    filterByFolder: state.filterByFolder,
    filterByTag: state.filterByTag,
    sortBy: state.sortBy,
    setFilterByFolder: state.setFilterByFolder,
    setFilterByTag: state.setFilterByTag,
    setSortBy: state.setSortBy,
    clearFilters: state.clearFilters,
    getFilteredShortcuts: state.getFilteredShortcuts,
  }));

// Export entire store for debugging/dev tools
export default useAppStore;
