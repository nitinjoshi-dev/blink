/**
 * AdvancedSearch Component
 * Multi-criteria search with filters, tags, recent shortcuts, and URL preview
 */

import React, { useState, useEffect, useRef } from 'react';
import { getAllShortcuts } from '../../services/shortcutService';
import { useShortcutSearch } from '../../hooks/useDebouncedSearch';

const AdvancedSearch = ({ onClose, onSelectShortcut }) => {
  const [shortcuts, setShortcuts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    tags: [],
    folders: [],
    dateRange: 'all', // 'all', 'today', 'week', 'month'
    sortBy: 'relevance', // 'relevance', 'alphabetical', 'recent', 'frequent'
    showRecent: false,
    showFavorites: false
  });
  const [availableTags, setAvailableTags] = useState([]);
  const [availableFolders, setAvailableFolders] = useState([]);
  const [recentShortcuts, setRecentShortcuts] = useState([]);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // Enhanced search with advanced filtering
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
    debounceMs: 200,
    searchFields: ['alias', 'url', 'tags', 'folder'],
    searchFunction: (item, query) => {
      // Basic text search
      if (!query.trim()) return true;
      
      const searchText = query.toLowerCase();
      const aliasMatch = item.alias.toLowerCase().includes(searchText);
      const urlMatch = item.url.toLowerCase().includes(searchText);
      const tagMatch = (item.tags || []).some(tag => tag.toLowerCase().includes(searchText));
      const folderMatch = (item.folder || '').toLowerCase().includes(searchText);
      
      return aliasMatch || urlMatch || tagMatch || folderMatch;
    },
    sortFunction: (a, b, query) => {
      // Advanced sorting based on filters
      if (filters.sortBy === 'recent') {
        return (b.lastAccessed || 0) - (a.lastAccessed || 0);
      }
      if (filters.sortBy === 'frequent') {
        return (b.accessCount || 0) - (a.accessCount || 0);
      }
      if (filters.sortBy === 'alphabetical') {
        return a.alias.localeCompare(b.alias);
      }
      
      // Default relevance sorting
      const searchText = query.toLowerCase();
      const getRelevanceScore = (item) => {
        let score = 0;
        const alias = item.alias.toLowerCase();
        const url = item.url.toLowerCase();
        
        if (alias === searchText) score += 100;
        else if (alias.startsWith(searchText)) score += 50;
        else if (alias.includes(searchText)) score += 25;
        
        if (url.includes(searchText)) score += 10;
        
        return score;
      };
      
      return getRelevanceScore(b) - getRelevanceScore(a);
    }
  });

  useEffect(() => {
    loadShortcuts();
  }, []);

  useEffect(() => {
    if (inputRef.current && !isLoading) {
      inputRef.current.focus();
    }
  }, [isLoading]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchResults]);

  const loadShortcuts = async () => {
    try {
      setIsLoading(true);
      const allShortcuts = await getAllShortcuts();
      setShortcuts(allShortcuts);
      
      // Extract available tags and folders
      const tags = new Set();
      const folders = new Set();
      
      allShortcuts.forEach(shortcut => {
        if (shortcut.tags) {
          shortcut.tags.forEach(tag => tags.add(tag));
        }
        if (shortcut.folder) {
          folders.add(shortcut.folder);
        }
      });
      
      setAvailableTags(Array.from(tags).sort());
      setAvailableFolders(Array.from(folders).sort());
      
      // Get recent shortcuts (accessed in last 7 days)
      const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      const recent = allShortcuts
        .filter(s => s.lastAccessed && s.lastAccessed > sevenDaysAgo)
        .sort((a, b) => (b.lastAccessed || 0) - (a.lastAccessed || 0))
        .slice(0, 10);
      
      setRecentShortcuts(recent);
      
      console.log('Advanced search loaded:', {
        shortcuts: allShortcuts.length,
        tags: tags.size,
        folders: folders.size,
        recent: recent.length
      });
    } catch (err) {
      console.error('Error loading shortcuts for advanced search:', err);
      setError('Failed to load shortcuts');
    } finally {
      setIsLoading(false);
    }
  };

  // Apply advanced filters
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
    
    return results;
  };

  const filteredResults = getFilteredResults();

  const handleKeyDown = (e) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredResults.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredResults.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredResults[selectedIndex]) {
          handleSelectShortcut(filteredResults[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
      case 'Tab':
        e.preventDefault();
        setShowFilters(!showFilters);
        break;
      case 'c':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          if (filteredResults[selectedIndex]) {
            handleCopyUrl(filteredResults[selectedIndex]);
          }
        }
        break;
    }
  };

  const handleSelectShortcut = (shortcut) => {
    // Update access count and last accessed
    const updatedShortcut = {
      ...shortcut,
      accessCount: (shortcut.accessCount || 0) + 1,
      lastAccessed: Date.now()
    };
    
    // Update in local state
    setShortcuts(prev => 
      prev.map(s => s.id === shortcut.id ? updatedShortcut : s)
    );
    
    onSelectShortcut(shortcut);
  };

  const handleCopyUrl = async (shortcut) => {
    try {
      await navigator.clipboard.writeText(shortcut.url);
      console.log('URL copied to clipboard:', shortcut.url);
      // You could show a toast notification here
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  const handlePreviewUrl = (shortcut) => {
    setPreviewUrl(shortcut);
    setShowPreview(true);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleTagToggle = (tag) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) 
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const handleFolderToggle = (folder) => {
    setFilters(prev => ({
      ...prev,
      folders: prev.folders.includes(folder) 
        ? prev.folders.filter(f => f !== folder)
        : [...prev.folders, folder]
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      tags: [],
      folders: [],
      dateRange: 'all',
      sortBy: 'relevance',
      showRecent: false,
      showFavorites: false
    });
  };

  const containerStyle = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '800px',
    maxWidth: '95vw',
    maxHeight: '90vh',
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
    fontWeight: '500'
  };

  const filtersStyle = {
    padding: '16px 24px',
    borderBottom: '1px solid #2a2a2a',
    backgroundColor: '#2a2a2a',
    display: showFilters ? 'block' : 'none'
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

  const footerStyle = {
    padding: '12px 24px',
    borderTop: '1px solid #2a2a2a',
    fontSize: '12px',
    color: '#888888',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  };

  if (isLoading) {
    return (
      <div style={containerStyle}>
        <div style={{ padding: '40px', textAlign: 'center', color: '#888888' }}>
          ⏳ Loading shortcuts...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={containerStyle}>
        <div style={{ padding: '40px', textAlign: 'center', color: '#ef4444' }}>
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
          placeholder="Advanced search shortcuts..."
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
            cursor: 'pointer'
          }}
        >
          🔧 Filters
        </button>
        <button
          onClick={onClose}
          style={{
            padding: '8px 12px',
            backgroundColor: '#6b7280',
            color: '#ffffff',
            border: 'none',
            borderRadius: '4px',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          ✕
        </button>
      </div>

      {/* Advanced Filters */}
      <div style={filtersStyle}>
        <div style={{ display: 'flex', gap: '20px', marginBottom: '16px', flexWrap: 'wrap' }}>
          {/* Sort By */}
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#a0a0a0' }}>
              Sort By
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
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
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
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
                onChange={(e) => handleFilterChange('showRecent', e.target.checked)}
                style={{ margin: 0 }}
              />
              Recent Only
            </label>
          </div>

          <button
            onClick={clearAllFilters}
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

        {/* Tags Filter */}
        {availableTags.length > 0 && (
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '12px', color: '#a0a0a0', marginBottom: '8px' }}>
              Tags: {filters.tags.length > 0 && `(${filters.tags.length} selected)`}
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {availableTags.slice(0, 10).map(tag => (
                <button
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  style={{
                    padding: '4px 8px',
                    backgroundColor: filters.tags.includes(tag) ? '#00d9ff' : '#3a3a3a',
                    color: filters.tags.includes(tag) ? '#0f0f0f' : '#e8e8e8',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '11px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Folders Filter */}
        {availableFolders.length > 0 && (
          <div>
            <div style={{ fontSize: '12px', color: '#a0a0a0', marginBottom: '8px' }}>
              Folders: {filters.folders.length > 0 && `(${filters.folders.length} selected)`}
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {availableFolders.slice(0, 10).map(folder => (
                <button
                  key={folder}
                  onClick={() => handleFolderToggle(folder)}
                  style={{
                    padding: '4px 8px',
                    backgroundColor: filters.folders.includes(folder) ? '#00d9ff' : '#3a3a3a',
                    color: filters.folders.includes(folder) ? '#0f0f0f' : '#e8e8e8',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '11px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  📁 {folder}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div style={resultsStyle}>
        {filteredResults.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#888888' }}>
            {hasQuery ? `No shortcuts found for "${searchQuery}"` : 'No shortcuts available'}
          </div>
        ) : (
          filteredResults.map((shortcut, index) => (
            <div
              key={shortcut.id}
              style={shortcutItemStyle(index === selectedIndex)}
              onClick={() => handleSelectShortcut(shortcut)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
                  {shortcut.folder ? `${shortcut.folder}/` : ''}{shortcut.alias}
                </div>
                <div style={{ fontSize: '12px', opacity: 0.7, marginBottom: '4px' }}>
                  {shortcut.url}
                </div>
                {shortcut.tags && shortcut.tags.length > 0 && (
                  <div style={{ fontSize: '11px', color: '#00d9ff' }}>
                    {shortcut.tags.map(tag => `#${tag}`).join(' ')}
                  </div>
                )}
                <div style={{ fontSize: '10px', opacity: 0.5, marginTop: '4px' }}>
                  {shortcut.accessCount ? `Used ${shortcut.accessCount} times` : 'Never used'} • 
                  {shortcut.lastAccessed ? ` Last used ${new Date(shortcut.lastAccessed).toLocaleDateString()}` : ' Never accessed'}
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopyUrl(shortcut);
                  }}
                  style={{
                    padding: '4px 8px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: 'none',
                    borderRadius: '4px',
                    color: 'inherit',
                    fontSize: '11px',
                    cursor: 'pointer'
                  }}
                  title="Copy URL (Ctrl+C)"
                >
                  📋
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePreviewUrl(shortcut);
                  }}
                  style={{
                    padding: '4px 8px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: 'none',
                    borderRadius: '4px',
                    color: 'inherit',
                    fontSize: '11px',
                    cursor: 'pointer'
                  }}
                  title="Preview URL"
                >
                  👁️
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
           `${filteredResults.length} shortcut${filteredResults.length !== 1 ? 's' : ''}`}
          {hasQuery && ` matching "${searchQuery}"`}
          {filters.tags.length > 0 && ` • ${filters.tags.length} tag filters`}
          {filters.folders.length > 0 && ` • ${filters.folders.length} folder filters`}
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
          }}>Ctrl+C</kbd> Copy • 
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

export default AdvancedSearch;
