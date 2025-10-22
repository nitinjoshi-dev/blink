/**
 * useSearchData Hook
 * Custom hook for managing search operations
 * Includes debouncing and result caching
 */

import { useCallback, useRef, useEffect } from 'react';
import { useSearch, useUI } from '../store/appStore';
import * as shortcutService from '../services/shortcutService';
import { log } from '../services/chromeApi';

const SEARCH_DEBOUNCE_MS = 300;

export const useSearchData = () => {
  const { searchQuery, searchResults, setSearchQuery, setSearchResults, clearSearch } = useSearch();
  const { showError } = useUI();

  const debounceTimerRef = useRef(null);
  const resultsCache = useRef({});

  // Perform search
  const performSearch = useCallback(
    async (query) => {
      if (!query || query.trim().length === 0) {
        setSearchResults([]);
        return [];
      }

      try {
        // Check cache first
        const normalizedQuery = query.trim().toLowerCase();
        if (resultsCache.current[normalizedQuery]) {
          const cached = resultsCache.current[normalizedQuery];
          setSearchResults(cached);
          return cached;
        }

        // Perform search
        const results = await shortcutService.searchShortcuts(query);

        // Cache results
        resultsCache.current[normalizedQuery] = results;

        // Keep cache size reasonable (max 50 searches)
        const cacheKeys = Object.keys(resultsCache.current);
        if (cacheKeys.length > 50) {
          delete resultsCache.current[cacheKeys[0]];
        }

        setSearchResults(results);
        return results;
      } catch (error) {
        log('error', 'Search failed', error);
        showError('Search failed');
        return [];
      }
    },
    [setSearchResults, showError]
  );

  // Debounced search handler
  const handleSearch = useCallback(
    (query) => {
      setSearchQuery(query);

      // Clear existing timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Set new timer for debounced search
      debounceTimerRef.current = setTimeout(() => {
        performSearch(query);
      }, SEARCH_DEBOUNCE_MS);
    },
    [setSearchQuery, performSearch]
  );

  // Clear search cache
  const clearCache = useCallback(() => {
    resultsCache.current = {};
  }, []);

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

  // Get suggestions based on current query
  const getSuggestions = useCallback(
    async (query, limit = 5) => {
      try {
        const results = await shortcutService.searchShortcuts(query);
        return results.slice(0, limit);
      } catch (error) {
        log('error', 'Failed to get suggestions', error);
        return [];
      }
    },
    []
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    // State
    searchQuery,
    searchResults,

    // Actions
    handleSearch,
    performSearch,
    clearSearch,
    clearCache,

    // Query
    getFrequent,
    getSuggestions,

    // Utils
    hasResults: searchResults.length > 0,
    resultCount: searchResults.length,
  };
};
