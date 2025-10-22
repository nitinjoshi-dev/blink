/**
 * SearchPopup Component
 * Global search popup triggered by keyboard shortcut (Cmd+Shift+O)
 * Command-palette style interface for quick shortcut access
 */

import React, { useState, useEffect, useRef } from 'react';
import { getAllShortcuts, trackShortcutAccess } from '../../services/shortcutService';
import { useShortcutSearch } from '../../hooks/useDebouncedSearch';
import { useRecentShortcuts } from '../../hooks/useRecentShortcuts';
import '@/styles/global.css';

const SearchPopup = () => {
  const [shortcuts, setShortcuts] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    tags: [],
    folders: [],
    dateRange: 'all',
    sortBy: 'relevance',
    showRecent: false,
    showFavorites: false
  });
  
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // Enhanced search with debouncing
  const {
    searchQuery,
    setSearch,
    clearSearch,
    filteredItems: searchResults,
    searchStats,
    isSearching,
    hasQuery,
    hasResults
  } = useShortcutSearch(shortcuts, {
    debounceMs: 200, // Faster debounce for search popup
    searchFields: ['alias', 'url', 'tags', 'folder']
  });

  // Recent shortcuts tracking
  const {
    recentShortcuts,
    favoriteShortcuts,
    trackAccess,
    toggleFavorite,
    getShortcutStats
  } = useRecentShortcuts({
    maxRecent: 10,
    recentDays: 7,
    autoUpdate: true
  });

  useEffect(() => {
    loadShortcuts();
    // Force refresh after a short delay to ensure we get the latest data
    const timeoutId = setTimeout(() => {
      loadShortcuts();
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, []);

  // Refresh shortcuts when component becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadShortcuts();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  useEffect(() => {
    // Focus the input when component mounts and after shortcuts are loaded
    if (inputRef.current && !isLoading) {
      inputRef.current.focus();
    }
  }, [isLoading]);

  // Reset selected index when search results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchResults]);

  // Apply advanced filters to search results
  const getFilteredResults = () => {
    let results = searchResults;
    
    // Apply tag filters
    if (filters.tags.length > 0) {
      results = results.filter(shortcut => 
        filters.tags.some(tag => 
          (shortcut.tags || []).includes(tag)
        )
      );
    }
    
    // Apply folder filters
    if (filters.folders.length > 0) {
      results = results.filter(shortcut => 
        filters.folders.includes(shortcut.folder || '')
      );
    }
    
    // Apply date range filter
    if (filters.dateRange !== 'all') {
      const now = Date.now();
      let cutoff;
      
      switch (filters.dateRange) {
        case 'today':
          cutoff = now - (24 * 60 * 60 * 1000);
          break;
        case 'week':
          cutoff = now - (7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          cutoff = now - (30 * 24 * 60 * 60 * 1000);
          break;
        default:
          cutoff = 0;
      }
      
      results = results.filter(shortcut => 
        (shortcut.createdAt || 0) > cutoff
      );
    }
    
    // Show recent shortcuts if enabled
    if (filters.showRecent) {
      const recentIds = new Set(recentShortcuts.map(s => s.id));
      results = results.filter(shortcut => recentIds.has(shortcut.id));
    }
    
    // Show favorites if enabled
    if (filters.showFavorites) {
      results = results.filter(shortcut => shortcut.isFavorite);
    }
    
    // Apply sorting
    if (filters.sortBy === 'recent') {
      results = results.sort((a, b) => (b.lastAccessed || 0) - (a.lastAccessed || 0));
    } else if (filters.sortBy === 'frequent') {
      results = results.sort((a, b) => (b.accessCount || 0) - (a.accessCount || 0));
    } else if (filters.sortBy === 'alphabetical') {
      results = results.sort((a, b) => a.alias.localeCompare(b.alias));
    }
    
    return results;
  };

  const filteredShortcuts = getFilteredResults();

  const loadShortcuts = async () => {
    try {
      setIsLoading(true);
      console.log('Loading shortcuts for search popup...');
      const allShortcuts = await getAllShortcuts();
      console.log('Raw shortcuts from database:', allShortcuts);
      
      // Ensure all shortcuts have access tracking fields
      const shortcutsWithAccessData = allShortcuts.map(shortcut => ({
        ...shortcut,
        accessCount: shortcut.accessCount || 0,
        lastAccessed: shortcut.lastAccessed || null
      }));
      
      setShortcuts(shortcutsWithAccessData);
      console.log('Search popup loaded shortcuts:', allShortcuts.length);
      if (allShortcuts.length > 0) {
        console.log('Sample shortcut with access data:', {
          alias: allShortcuts[0].alias,
          accessCount: allShortcuts[0].accessCount,
          lastAccessed: allShortcuts[0].lastAccessed,
          hasAccessCount: 'accessCount' in allShortcuts[0],
          hasLastAccessed: 'lastAccessed' in allShortcuts[0],
          rawShortcut: allShortcuts[0]
        });
      }
    } catch (err) {
      console.error('Error loading shortcuts for search:', err);
      setError('Failed to load shortcuts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredShortcuts.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredShortcuts.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredShortcuts[selectedIndex]) {
          handleOpenShortcut(filteredShortcuts[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        window.close();
        break;
      case 'Tab':
        e.preventDefault();
        setShowFilters(!showFilters);
        break;
    }
  };

  const handleOpenShortcut = async (shortcut) => {
    try {
      // Track access
      await trackAccess(shortcut.id);
      
      // Open URL
      chrome.tabs.create({ url: shortcut.url });
      
      console.log('Shortcut opened and access tracked:', shortcut.alias);
      window.close();
    } catch (err) {
      console.error('Error opening shortcut:', err);
      // Still open the URL even if tracking fails
      chrome.tabs.create({ url: shortcut.url });
      window.close();
    }
  };

  const handleEditShortcut = (shortcut) => {
    console.log('Editing shortcut:', shortcut);
    // Open dashboard with edit mode
    chrome.tabs.create({ url: chrome.runtime.getURL('dashboard.html') });
    window.close();
  };

  const handleDeleteShortcut = async (shortcut) => {
    if (window.confirm(`Delete shortcut "${shortcut.alias}"?`)) {
      try {
        // Import deleteShortcut dynamically
        const { deleteShortcut } = await import('../../services/shortcutService');
        await deleteShortcut(shortcut.id);
        await loadShortcuts(); // Reload shortcuts
        console.log('Shortcut deleted:', shortcut.alias);
      } catch (err) {
        console.error('Error deleting shortcut:', err);
        setError('Failed to delete shortcut');
      }
    }
  };

  const handleOpenDashboard = () => {
    console.log('Opening dashboard...');
    chrome.tabs.create({ url: chrome.runtime.getURL('dashboard.html') });
    window.close();
  };

  const containerStyle = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '600px',
    maxWidth: '90vw',
    maxHeight: '80vh',
    backgroundColor: '#1a1a1a',
    border: '1px solid #2a2a2a',
    borderRadius: '12px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
    zIndex: 10000,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  };

  const headerStyle = {
    padding: '20px 24px 16px',
    borderBottom: '1px solid #2a2a2a',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  };

  const searchInputStyle = {
    flex: 1,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    fontSize: '18px',
    color: '#e8e8e8',
    fontWeight: '500',
    '::placeholder': {
      color: '#888888'
    }
  };

  const resultsStyle = {
    flex: 1,
    overflowY: 'auto',
    maxHeight: '400px'
  };

  const shortcutItemStyle = (isSelected) => ({
    padding: '12px 24px',
    borderBottom: '1px solid #2a2a2a',
    cursor: 'pointer',
    backgroundColor: isSelected ? '#00d9ff' : 'transparent',
    color: isSelected ? '#0f0f0f' : '#e8e8e8',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    transition: 'background-color 0.2s, color 0.2s'
  });

  const shortcutAliasStyle = {
    fontSize: '16px',
    fontWeight: '600',
    flex: 1
  };

  const shortcutUrlStyle = {
    fontSize: '12px',
    opacity: 0.7,
    maxWidth: '200px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  };

  const actionButtonsStyle = {
    display: 'flex',
    gap: '8px',
    opacity: 0.7
  };

  const actionButtonStyle = {
    padding: '4px 8px',
    background: 'rgba(255, 255, 255, 0.1)',
    border: 'none',
    borderRadius: '4px',
    color: 'inherit',
    fontSize: '11px',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  };

  const footerStyle = {
    padding: '12px 24px',
    borderTop: '1px solid #2a2a2a',
    fontSize: '12px',
    color: '#888888',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  };

  const loadingStyle = {
    padding: '40px',
    textAlign: 'center',
    color: '#888888'
  };

  const errorStyle = {
    padding: '40px',
    textAlign: 'center',
    color: '#ef4444'
  };

  if (isLoading) {
    return (
      <div style={containerStyle}>
        <div style={loadingStyle}>
          ⏳ Loading shortcuts...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={containerStyle}>
        <div style={errorStyle}>
          ❌ {error}
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <div style={{ fontSize: '20px' }}>🔍</div>
        <input
          ref={inputRef}
          type="text"
          placeholder="Search shortcuts..."
          value={searchQuery}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          style={searchInputStyle}
        />
        <button
          onClick={() => setShowFilters(!showFilters)}
          style={{
            padding: '8px 12px',
            backgroundColor: showFilters ? '#00d9ff' : '#2a2a2a',
            color: showFilters ? '#0f0f0f' : '#e8e8e8',
            border: 'none',
            borderRadius: '4px',
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
          title="Toggle Filters (Tab)"
        >
          🔧
        </button>
        <button 
          onClick={handleOpenDashboard}
          style={{
            padding: '8px 12px',
            backgroundColor: '#00d9ff',
            color: '#0f0f0f',
            border: 'none',
            borderRadius: '4px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#00bcd4'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#00d9ff'}
          title="Open Dashboard"
        >
          🏠
        </button>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid #2a2a2a',
          backgroundColor: '#2a2a2a',
          display: 'flex',
          gap: '16px',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          {/* Sort By */}
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#a0a0a0' }}>
              Sort By
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
              style={{
                padding: '4px 8px',
                backgroundColor: '#1a1a1a',
                border: '1px solid #3a3a3a',
                borderRadius: '4px',
                color: '#e8e8e8',
                fontSize: '12px'
              }}
            >
              <option value="relevance">Relevance</option>
              <option value="alphabetical">Alphabetical</option>
              <option value="recent">Recent</option>
              <option value="frequent">Most Used</option>
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#a0a0a0' }}>
              Date Range
            </label>
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
              style={{
                padding: '4px 8px',
                backgroundColor: '#1a1a1a',
                border: '1px solid #3a3a3a',
                borderRadius: '4px',
                color: '#e8e8e8',
                fontSize: '12px'
              }}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>

          {/* Quick Filters */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'end' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#a0a0a0' }}>
              <input
                type="checkbox"
                checked={filters.showRecent}
                onChange={(e) => setFilters(prev => ({ ...prev, showRecent: e.target.checked }))}
                style={{ margin: 0 }}
              />
              Recent Only
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#a0a0a0' }}>
              <input
                type="checkbox"
                checked={filters.showFavorites}
                onChange={(e) => setFilters(prev => ({ ...prev, showFavorites: e.target.checked }))}
                style={{ margin: 0 }}
              />
              Favorites Only
            </label>
          </div>

          <button
            onClick={() => setFilters({
              tags: [],
              folders: [],
              dateRange: 'all',
              sortBy: 'relevance',
              showRecent: false,
              showFavorites: false
            })}
            style={{
              padding: '4px 8px',
              backgroundColor: '#6b7280',
              color: '#ffffff',
              border: 'none',
              borderRadius: '4px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            Clear All
          </button>
        </div>
      )}

      {/* Results */}
      <div style={resultsStyle}>
        {filteredShortcuts.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#888888' }}>
            {searchQuery ? `No shortcuts found for "${searchQuery}"` : 'No shortcuts available'}
          </div>
        ) : (
          filteredShortcuts.map((shortcut, index) => (
            <div
              key={shortcut.id}
              style={shortcutItemStyle(index === selectedIndex)}
              onClick={() => handleOpenShortcut(shortcut)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div style={{ flex: 1 }}>
                <div style={shortcutAliasStyle}>
                  {shortcut.folder ? `${shortcut.folder}/` : ''}{shortcut.alias}
                </div>
                <div style={shortcutUrlStyle}>
                  {shortcut.url}
                </div>
                <div style={{ fontSize: '10px', opacity: 0.6, marginTop: '4px' }}>
                  {shortcut.accessCount || shortcut.accessCount === 0 ? `Used ${shortcut.accessCount} times` : 'Never used'} • 
                  {shortcut.lastAccessed ? ` Last used ${new Date(shortcut.lastAccessed).toLocaleDateString()}` : ' Never accessed'}
                </div>
              </div>
              
              <div style={actionButtonsStyle}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditShortcut(shortcut);
                  }}
                  style={actionButtonStyle}
                  title="Edit (Tab)"
                >
                  ✏️
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteShortcut(shortcut);
                  }}
                  style={actionButtonStyle}
                  title="Delete"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div style={footerStyle}>
        <div>
          {isSearching ? 'Searching...' : 
           hasQuery ? 
             `${filteredShortcuts.length} of ${searchStats.totalItems} shortcuts` :
             `${filteredShortcuts.length} shortcut${filteredShortcuts.length !== 1 ? 's' : ''}`}
          {hasQuery && ` matching "${searchQuery}"`}
          {filters.showRecent && ' • Recent only'}
          {filters.showFavorites && ' • Favorites only'}
          {filters.sortBy !== 'relevance' && ` • Sorted by ${filters.sortBy}`}
          {searchStats.isExactMatch && ' • Exact match!'}
        </div>
        <div>
          <kbd style={{ 
            background: '#2a2a2a', 
            padding: '2px 6px', 
            borderRadius: '3px',
            fontSize: '10px',
            color: '#e8e8e8'
          }}>↑↓</kbd> Navigate • 
          <kbd style={{ 
            background: '#2a2a2a', 
            padding: '2px 6px', 
            borderRadius: '3px',
            fontSize: '10px',
            color: '#e8e8e8'
          }}>Enter</kbd> Open • 
          <kbd style={{ 
            background: '#2a2a2a', 
            padding: '2px 6px', 
            borderRadius: '3px',
            fontSize: '10px',
            color: '#e8e8e8'
          }}>Tab</kbd> Filters • 
          <kbd style={{ 
            background: '#2a2a2a', 
            padding: '2px 6px', 
            borderRadius: '3px',
            fontSize: '10px',
            color: '#e8e8e8'
          }}>Esc</kbd> Close
        </div>
      </div>
    </div>
  );
};

export default SearchPopup;
