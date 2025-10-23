/**
 * useDebouncedSearch Hook
 * Provides real-time search with debouncing for better performance
 */

import { useState, useEffect, useCallback, useMemo } from 'react';

/**
 * useDebouncedSearch Hook
 * @param {Array} items - Array of items to search through
 * @param {Object} options - Configuration options
 * @param {number} options.debounceMs - Debounce delay in milliseconds (default: 300)
 * @param {Array} options.searchFields - Fields to search in (default: ['alias', 'url', 'tags', 'folder'])
 * @param {Function} options.searchFunction - Custom search function
 * @param {Function} options.sortFunction - Custom sort function
 * @param {boolean} options.caseSensitive - Whether search should be case sensitive (default: false)
 * @returns {Object} Search utilities and results
 */
export function useDebouncedSearch(items = [], options = {}) {
  const {
    debounceMs = 300,
    searchFields = ['alias', 'url', 'tags', 'folder'],
    searchFunction = null,
    sortFunction = null,
    caseSensitive = false,
  } = options;

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Debounce the search query
  useEffect(() => {
    setIsSearching(true);
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setIsSearching(false);
    }, debounceMs);

    return () => {
      clearTimeout(timer);
      setIsSearching(false);
    };
  }, [searchQuery, debounceMs]);

  // Default search function
  const defaultSearchFunction = useCallback((item, query) => {
    if (!query.trim()) return true;

    const searchText = caseSensitive ? query : query.toLowerCase();
    
    // Handle folder-specific search (e.g., "work/" or "work/meet")
    if (searchText.includes('/')) {
      const [folderPart, aliasPart] = searchText.split('/', 2);
      const itemFolder = (item.folder || '').toLowerCase();
      const itemAlias = (item.alias || '').toLowerCase();
      
      // If only folder specified (e.g., "work/")
      if (!aliasPart) {
        return itemFolder.includes(folderPart);
      }
      // If both folder and alias specified (e.g., "work/meet")
      else {
        return itemFolder.includes(folderPart) && itemAlias.includes(aliasPart);
      }
    }
    
    return searchFields.some(field => {
      const fieldValue = item[field];
      if (!fieldValue) return false;

      let valueToSearch;
      if (Array.isArray(fieldValue)) {
        // Handle arrays (like tags)
        valueToSearch = fieldValue.join(' ');
      } else {
        valueToSearch = fieldValue;
      }

      const searchableValue = caseSensitive ? valueToSearch : valueToSearch.toLowerCase();
      return searchableValue.includes(searchText);
    });
  }, [searchFields, caseSensitive]);

  // Default sort function - prioritize exact matches, then partial matches
  const defaultSortFunction = useCallback((a, b, query) => {
    if (!query.trim()) return 0;

    const searchText = caseSensitive ? query : query.toLowerCase();
    
    // Helper function to get searchable value
    const getSearchableValue = (item, field) => {
      const value = item[field];
      if (Array.isArray(value)) {
        return value.join(' ');
      }
      return value || '';
    };

    // Helper function to calculate match score
    const getMatchScore = (item) => {
      let score = 0;
      
      // Handle folder-specific search scoring
      if (searchText.includes('/')) {
        const [folderPart, aliasPart] = searchText.split('/', 2);
        const itemFolder = (item.folder || '').toLowerCase();
        const itemAlias = (item.alias || '').toLowerCase();
        
        // Exact folder match gets high score
        if (itemFolder === folderPart) {
          score += 100;
        } else if (itemFolder.includes(folderPart)) {
          score += 50;
        }
        
        // If alias part specified, score it too
        if (aliasPart) {
          if (itemAlias === aliasPart) {
            score += 100;
          } else if (itemAlias.startsWith(aliasPart)) {
            score += 75;
          } else if (itemAlias.includes(aliasPart)) {
            score += 25;
          }
        }
      } else {
        // Regular search scoring
        searchFields.forEach(field => {
          const value = getSearchableValue(item, field);
          const searchableValue = caseSensitive ? value : value.toLowerCase();
          
          if (searchableValue === searchText) {
            score += 100; // Exact match
          } else if (searchableValue.startsWith(searchText)) {
            score += 50; // Starts with
          } else if (searchableValue.includes(searchText)) {
            score += 25; // Contains
          }
        });
      }
      
      return score;
    };

    const scoreA = getMatchScore(a);
    const scoreB = getMatchScore(b);
    
    if (scoreA !== scoreB) {
      return scoreB - scoreA; // Higher score first
    }
    
    // If scores are equal, sort alphabetically by alias
    const aliasA = (a.alias || '').toLowerCase();
    const aliasB = (b.alias || '').toLowerCase();
    return aliasA.localeCompare(aliasB);
  }, [searchFields, caseSensitive]);

  // Filter and sort items based on debounced query
  const filteredItems = useMemo(() => {
    if (!debouncedQuery.trim()) {
      return items;
    }

    const searchFn = searchFunction || defaultSearchFunction;
    const sortFn = sortFunction || defaultSortFunction;

    const filtered = items.filter(item => searchFn(item, debouncedQuery));
    return filtered.sort((a, b) => sortFn(a, b, debouncedQuery));
  }, [items, debouncedQuery, searchFunction, defaultSearchFunction, sortFunction, defaultSortFunction]);

  // Search statistics
  const searchStats = useMemo(() => {
    const totalItems = items.length;
    const filteredCount = filteredItems.length;
    const hasResults = filteredCount > 0;
    const isExactMatch = debouncedQuery && filteredItems.some(item => 
      searchFields.some(field => {
        const value = item[field];
        if (Array.isArray(value)) {
          return value.some(v => 
            (caseSensitive ? v : v.toLowerCase()) === (caseSensitive ? debouncedQuery : debouncedQuery.toLowerCase())
          );
        }
        return (caseSensitive ? value : value.toLowerCase()) === (caseSensitive ? debouncedQuery : debouncedQuery.toLowerCase());
      })
    );

    return {
      totalItems,
      filteredCount,
      hasResults,
      isExactMatch,
      isEmpty: totalItems === 0,
      isSearching: isSearching || (searchQuery !== debouncedQuery),
    };
  }, [items.length, filteredItems.length, debouncedQuery, searchFields, caseSensitive, isSearching, searchQuery]);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setDebouncedQuery('');
  }, []);

  // Set search query
  const setSearch = useCallback((query) => {
    setSearchQuery(query);
  }, []);

  return {
    // Search state
    searchQuery,
    debouncedQuery,
    isSearching: isSearching || (searchQuery !== debouncedQuery),
    
    // Results
    filteredItems,
    searchStats,
    
    // Actions
    setSearch,
    clearSearch,
    
    // Utilities
    hasQuery: debouncedQuery.trim().length > 0,
    hasResults: filteredItems.length > 0,
  };
}

/**
 * Hook for searching shortcuts specifically
 */
export function useShortcutSearch(shortcuts = [], options = {}) {
  const shortcutSearchOptions = {
    searchFields: ['alias', 'url', 'tags', 'folder'],
    debounceMs: 300,
    caseSensitive: false,
    ...options,
  };

  return useDebouncedSearch(shortcuts, shortcutSearchOptions);
}

export default useDebouncedSearch;
