/**
 * Dashboard Component
 * Full-screen dashboard for managing shortcuts with folder organization
 * Left sidebar: Folder navigation
 * Right main area: Shortcut list and management
 */

import React, { useState, useEffect } from 'react';
import { getAllShortcuts, getFolderStats, deleteShortcut, updateShortcut, createShortcut, trackShortcutAccess } from '../../services/shortcutService';
import { parseAliasWithFolder, validateUrl, validateAlias } from '../../services/validators';
import { useShortcutSearch } from '../../hooks/useDebouncedSearch';
import { useRecentShortcuts } from '../../hooks/useRecentShortcuts';
import AdvancedSearch from '../AdvancedSearch/AdvancedSearch';
import URLPreview from '../URLPreview/URLPreview';
import ImportExport from '../ImportExport/ImportExport';
import SyncSettings from '../SyncSettings/SyncSettings';

const Dashboard = () => {
  const [shortcuts, setShortcuts] = useState([]);
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingShortcut, setEditingShortcut] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [newShortcut, setNewShortcut] = useState({ url: '', alias: '', tags: '' });
  const [newFolderName, setNewFolderName] = useState('');
  const [newTag, setNewTag] = useState('');
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [previewShortcut, setPreviewShortcut] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showSearchFilters, setShowSearchFilters] = useState(false);
  const [searchFilters, setSearchFilters] = useState({
    tags: [],
    folders: [],
    dateRange: 'all',
    sortBy: 'relevance',
    showRecent: false,
    showFavorites: false
  });
  const [showImportExport, setShowImportExport] = useState(false);
  const [showSyncSettings, setShowSyncSettings] = useState(false);

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
    debounceMs: 300,
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
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [allShortcuts, folderStats] = await Promise.all([
        getAllShortcuts(),
        getFolderStats()
      ]);
      
      setShortcuts(allShortcuts);
      
      // Create folder list from stats
      const folderList = Object.keys(folderStats).map(folder => ({
        name: folder,
        count: folderStats[folder]
      })).sort((a, b) => a.name.localeCompare(b.name));
      
      setFolders(folderList);
      console.log('Dashboard data loaded:', { shortcuts: allShortcuts.length, folders: folderList.length });
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load shortcuts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFolderSelect = async (folderName) => {
    setSelectedFolder(folderName);
    clearSearch(); // Clear search when selecting folder
    
    // Close add/edit forms when selecting a folder
    if (showAddForm || editingShortcut) {
      setShowAddForm(false);
      setEditingShortcut(null);
      setNewShortcut({ url: '', alias: '', tags: '' });
      setNewTag('');
    }
    
    // Refresh data when selecting "All Shortcuts" to ensure we have the latest data
    if (folderName === '') {
      await loadData();
    }
  };

  const handleSearch = (query) => {
    setSearch(query);
    setSelectedFolder(''); // Clear folder selection when searching
  };

  const handleDeleteShortcut = async (shortcutId) => {
    if (!confirm('Are you sure you want to delete this shortcut?')) {
      return;
    }

    try {
      await deleteShortcut(shortcutId);
      await loadData(); // Reload data
      console.log('Shortcut deleted:', shortcutId);
    } catch (err) {
      console.error('Error deleting shortcut:', err);
      setError('Failed to delete shortcut');
    }
  };

  const handleEditShortcut = (shortcut) => {
    setEditingShortcut(shortcut);
  };

  const handleSaveEdit = async (updatedData) => {
    try {
      await updateShortcut(editingShortcut.id, updatedData);
      setEditingShortcut(null);
      await loadData(); // Reload data
      console.log('Shortcut updated:', editingShortcut.id);
    } catch (err) {
      console.error('Error updating shortcut:', err);
      setError('Failed to update shortcut');
    }
  };

  const handleAddShortcut = async () => {
    try {
      // Validate inputs
      if (!newShortcut.url.trim() || !newShortcut.alias.trim()) {
        setError('URL and alias are required');
        return;
      }

      const urlValidation = validateUrl(newShortcut.url);
      if (!urlValidation.valid) {
        setError(`Invalid URL: ${urlValidation.error}`);
        return;
      }

      const parsedAlias = parseAliasWithFolder(newShortcut.alias);
      const aliasValidation = validateAlias(parsedAlias.alias);
      if (!aliasValidation.valid) {
        setError(`Invalid alias: ${aliasValidation.error}`);
        return;
      }

      // Create shortcut
      const shortcutData = {
        url: newShortcut.url.trim(),
        alias: parsedAlias.alias,
        folder: parsedAlias.folder,
        tags: newShortcut.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };

      await createShortcut(shortcutData);
      setNewShortcut({ url: '', alias: '', tags: '' });
      setNewTag('');
      setShowAddForm(false);
      await loadData();
      console.log('Shortcut created successfully');
    } catch (err) {
      console.error('Error creating shortcut:', err);
      setError(`Failed to create shortcut: ${err.message}`);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      setError('Folder name is required');
      return;
    }

    const folderValidation = validateAlias(newFolderName.trim());
    if (!folderValidation.valid) {
      setError(`Invalid folder name: ${folderValidation.error}`);
      return;
    }

    try {
      // Create a placeholder shortcut in the new folder
      const shortcutData = {
        url: 'https://example.com',
        alias: 'placeholder',
        folder: newFolderName.trim().toLowerCase(),
        tags: []
      };

      await createShortcut(shortcutData);
      
      // Delete the placeholder shortcut immediately
      const allShortcuts = await getAllShortcuts();
      const placeholder = allShortcuts.find(s => 
        s.folder === newFolderName.trim().toLowerCase() && 
        s.alias === 'placeholder' && 
        s.url === 'https://example.com'
      );
      
      if (placeholder) {
        await deleteShortcut(placeholder.id);
      }

      setNewFolderName('');
      setShowCreateFolder(false);
      setError(null);
      await loadData();
      console.log('Folder created successfully:', newFolderName.trim().toLowerCase());
    } catch (err) {
      console.error('Error creating folder:', err);
      setError(`Failed to create folder: ${err.message}`);
    }
  };

  const handleOpenShortcut = async (shortcut) => {
    try {
      // Track access
      await trackAccess(shortcut.id);
      
      // Open URL
      chrome.tabs.create({ url: shortcut.url });
      
      console.log('Shortcut opened and access tracked:', shortcut.alias);
    } catch (err) {
      console.error('Error opening shortcut:', err);
      // Still open the URL even if tracking fails
      chrome.tabs.create({ url: shortcut.url });
    }
  };

  const handlePreviewShortcut = (shortcut) => {
    setPreviewShortcut(shortcut);
    setShowPreview(true);
  };

  const handleCopyUrl = async (shortcut) => {
    try {
      await navigator.clipboard.writeText(shortcut.url);
      console.log('URL copied to clipboard:', shortcut.url);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  const handleAdvancedSearch = () => {
    setShowAdvancedSearch(true);
  };

  const handleAdvancedSearchClose = () => {
    setShowAdvancedSearch(false);
  };

  const handleAdvancedSearchSelect = async (shortcut) => {
    await handleOpenShortcut(shortcut);
    setShowAdvancedSearch(false);
  };

  // Apply advanced filters to search results
  const applyAdvancedFilters = (results) => {
    let filtered = results;
    
    // Apply tag filters
    if (searchFilters.tags.length > 0) {
      filtered = filtered.filter(shortcut => 
        searchFilters.tags.some(tag => 
          (shortcut.tags || []).includes(tag)
        )
      );
    }
    
    // Apply folder filters
    if (searchFilters.folders.length > 0) {
      filtered = filtered.filter(shortcut => 
        searchFilters.folders.includes(shortcut.folder || '')
      );
    }
    
    // Apply date range filter
    if (searchFilters.dateRange !== 'all') {
      const now = Date.now();
      let cutoff;
      
      switch (searchFilters.dateRange) {
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
      
      filtered = filtered.filter(shortcut => 
        (shortcut.createdAt || 0) > cutoff
      );
    }
    
    // Show recent shortcuts if enabled
    if (searchFilters.showRecent) {
      const recentIds = new Set(recentShortcuts.map(s => s.id));
      filtered = filtered.filter(shortcut => recentIds.has(shortcut.id));
    }
    
    // Show favorites if enabled
    if (searchFilters.showFavorites) {
      filtered = filtered.filter(shortcut => shortcut.isFavorite);
    }
    
    // Apply sorting
    if (searchFilters.sortBy === 'recent') {
      filtered = filtered.sort((a, b) => (b.lastAccessed || 0) - (a.lastAccessed || 0));
    } else if (searchFilters.sortBy === 'frequent') {
      filtered = filtered.sort((a, b) => (b.accessCount || 0) - (a.accessCount || 0));
    } else if (searchFilters.sortBy === 'alphabetical') {
      filtered = filtered.sort((a, b) => a.alias.localeCompare(b.alias));
    }
    
    return filtered;
  };

  // Filter shortcuts based on folder selection or search
  const getFilteredShortcuts = () => {
    let results;
    
    // If searching, use search results
    if (hasQuery) {
      results = searchResults;
    } else if (selectedFolder) {
      // If folder selected, filter by folder
      results = shortcuts.filter(shortcut => 
        (shortcut.folder || '') === selectedFolder
      );
    } else {
      // Otherwise, show all shortcuts
      results = shortcuts;
    }
    
    // Apply advanced filters
    return applyAdvancedFilters(results);
  };

  const filteredShortcuts = getFilteredShortcuts();

  const containerStyle = {
    display: 'flex',
    height: '100vh',
    background: '#0f0f0f',
    color: '#e8e8e8',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", sans-serif'
  };

  const sidebarStyle = {
    width: '250px',
    background: '#1a1a1a',
    borderRight: '1px solid #2a2a2a',
    padding: '20px',
    overflowY: 'auto'
  };

  const mainStyle = {
    flex: 1,
    padding: '20px',
    overflowY: 'auto'
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    paddingBottom: '15px',
    borderBottom: '1px solid #2a2a2a'
  };

  const searchStyle = {
    width: '300px',
    padding: '10px 15px',
    background: '#1a1a1a',
    border: '1px solid #2a2a2a',
    borderRadius: '6px',
    color: '#e8e8e8',
    fontSize: '14px',
    outline: 'none'
  };

  const folderItemStyle = (isSelected) => ({
    padding: '10px 15px',
    margin: '5px 0',
    background: isSelected ? '#00d9ff' : 'transparent',
    color: isSelected ? '#0f0f0f' : '#e8e8e8',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    transition: 'all 0.2s ease'
  });

  const shortcutItemStyle = {
    padding: '15px',
    margin: '10px 0',
    background: '#1a1a1a',
    border: '1px solid #2a2a2a',
    borderRadius: '8px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    transition: 'all 0.2s ease'
  };

  const buttonStyle = {
    padding: '8px 12px',
    margin: '0 5px',
    background: '#00d9ff',
    color: '#0f0f0f',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '500',
    transition: 'background 0.2s ease'
  };

  const deleteButtonStyle = {
    ...buttonStyle,
    background: '#ef4444',
    color: '#ffffff'
  };

  if (isLoading) {
    return (
      <div style={containerStyle}>
        <div style={{ ...mainStyle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '18px', marginBottom: '10px' }}>⏳</div>
            <div>Loading shortcuts...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={containerStyle}>
        <div style={{ ...mainStyle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', color: '#ef4444' }}>
            <div style={{ fontSize: '18px', marginBottom: '10px' }}>❌</div>
            <div>{error}</div>
            <button 
              onClick={loadData}
              style={{ ...buttonStyle, marginTop: '15px' }}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {/* Left Sidebar - Folder Navigation */}
      <div style={sidebarStyle}>
        <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', color: '#00d9ff' }}>
          📁 Folders
        </h3>
        
        {/* All Shortcuts */}
        <div 
          style={folderItemStyle(selectedFolder === '')}
          onClick={() => handleFolderSelect('')}
        >
          <span>All Shortcuts</span>
          <span style={{ fontSize: '12px', opacity: 0.7 }}>
            {shortcuts.length}
          </span>
        </div>

        {/* Folder List */}
        {folders.map(folder => (
          <div 
            key={folder.name}
            style={folderItemStyle(selectedFolder === folder.name)}
            onClick={() => handleFolderSelect(folder.name)}
          >
            <span>{folder.name || 'Root'}</span>
            <span style={{ fontSize: '12px', opacity: 0.7 }}>
              {folder.count}
            </span>
          </div>
        ))}

        {/* Recent Shortcuts */}
        {recentShortcuts.length > 0 && (
          <div style={{ marginTop: '30px' }}>
            <h4 style={{ margin: '0 0 15px 0', fontSize: '14px', color: '#00d9ff' }}>
              🕒 Recent
            </h4>
            {recentShortcuts.slice(0, 5).map(shortcut => (
              <div 
                key={shortcut.id}
                style={{
                  ...folderItemStyle(false),
                  padding: '8px 12px',
                  fontSize: '12px',
                  margin: '3px 0'
                }}
                onClick={() => handleOpenShortcut(shortcut)}
                title={`Last used: ${new Date(shortcut.lastAccessed).toLocaleString()}`}
              >
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {shortcut.folder ? `${shortcut.folder}/` : ''}{shortcut.alias}
                </span>
                <span style={{ fontSize: '10px', opacity: 0.6 }}>
                  {shortcut.accessCount || 0}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Add Shortcut Button */}
        <div style={{ marginTop: '30px' }}>
          <button 
            onClick={() => setShowAddForm(true)}
            style={{
              ...buttonStyle,
              width: '100%',
              marginBottom: '10px',
              background: '#00d9ff',
              color: '#0f0f0f'
            }}
            onMouseEnter={(e) => e.target.style.background = '#00bcd4'}
            onMouseLeave={(e) => e.target.style.background = '#00d9ff'}
          >
            ➕ Add Shortcut
          </button>
          <button 
            onClick={() => setShowCreateFolder(true)}
            style={{
              ...buttonStyle,
              width: '100%',
              background: '#22c55e',
              color: '#ffffff',
              marginBottom: '10px'
            }}
            onMouseEnter={(e) => e.target.style.background = '#16a34a'}
            onMouseLeave={(e) => e.target.style.background = '#22c55e'}
          >
            📁 Create Folder
          </button>
          <button 
            onClick={() => setShowImportExport(true)}
            style={{
              ...buttonStyle,
              width: '100%',
              background: '#8b5cf6',
              color: '#ffffff',
              marginBottom: '10px'
            }}
            onMouseEnter={(e) => e.target.style.background = '#7c3aed'}
            onMouseLeave={(e) => e.target.style.background = '#8b5cf6'}
          >
            📤 Import / Export
          </button>
          <button 
            onClick={() => setShowSyncSettings(true)}
            style={{
              ...buttonStyle,
              width: '100%',
              background: '#f59e0b',
              color: '#ffffff'
            }}
            onMouseEnter={(e) => e.target.style.background = '#d97706'}
            onMouseLeave={(e) => e.target.style.background = '#f59e0b'}
          >
            🔄 Chrome Sync
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={mainStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', color: '#e8e8e8', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px' }}>⚡</span>
              Blink Dashboard
            </h1>
          </div>
          <button 
            onClick={() => window.close()}
            style={buttonStyle}
          >
            ✕ Close
          </button>
        </div>

        {/* Search Bar - Only show when not in add/edit mode */}
        {!showAddForm && !editingShortcut && (
          <>
            <div style={{ marginBottom: '10px' }}>
              <div style={{ position: 'relative', maxWidth: '500px' }}>
                <div style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: isSearching ? '#00d9ff' : '#a0a0a0',
                  fontSize: '16px',
                  pointerEvents: 'none',
                  transition: 'color 0.2s ease'
                }}>
                  {isSearching ? '⏳' : '🔍'}
                </div>
                <input
                  type="text"
                  placeholder="Search shortcuts by alias, URL, or tags..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  style={{
                    ...searchStyle,
                    width: '100%',
                    fontSize: '16px',
                    padding: '12px 15px 12px 40px',
                    paddingLeft: '40px',
                    borderColor: isSearching ? '#00d9ff' : '#2a2a2a',
                    transition: 'border-color 0.2s ease'
                  }}
                />
                {hasQuery && (
                  <button
                    onClick={clearSearch}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#a0a0a0',
                      cursor: 'pointer',
                      fontSize: '16px',
                      padding: '4px',
                      borderRadius: '4px',
                      transition: 'color 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.color = '#e8e8e8'}
                    onMouseLeave={(e) => e.target.style.color = '#a0a0a0'}
                    title="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>
              <button
                onClick={() => setShowSearchFilters(!showSearchFilters)}
                style={{
                  padding: '8px 12px',
                  backgroundColor: showSearchFilters ? '#00d9ff' : '#2a2a2a',
                  color: showSearchFilters ? '#0f0f0f' : '#e8e8e8',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  marginLeft: '8px'
                }}
                title="Toggle Search Filters"
              >
                🔧 Filters
              </button>
            </div>

            {/* Search Filters */}
            {showSearchFilters && (
              <div style={{
                padding: '16px',
                backgroundColor: '#2a2a2a',
                borderRadius: '8px',
                marginBottom: '20px',
                border: '1px solid #3a3a3a'
              }}>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                  {/* Sort By */}
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#a0a0a0' }}>
                      Sort By
                    </label>
                    <select
                      value={searchFilters.sortBy}
                      onChange={(e) => setSearchFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                      style={{
                        padding: '6px 10px',
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
                      value={searchFilters.dateRange}
                      onChange={(e) => setSearchFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                      style={{
                        padding: '6px 10px',
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
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'end' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#a0a0a0' }}>
                      <input
                        type="checkbox"
                        checked={searchFilters.showRecent}
                        onChange={(e) => setSearchFilters(prev => ({ ...prev, showRecent: e.target.checked }))}
                        style={{ margin: 0 }}
                      />
                      Recent Only
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#a0a0a0' }}>
                      <input
                        type="checkbox"
                        checked={searchFilters.showFavorites}
                        onChange={(e) => setSearchFilters(prev => ({ ...prev, showFavorites: e.target.checked }))}
                        style={{ margin: 0 }}
                      />
                      Favorites Only
                    </label>
                  </div>

                  <button
                    onClick={() => setSearchFilters({
                      tags: [],
                      folders: [],
                      dateRange: 'all',
                      sortBy: 'relevance',
                      showRecent: false,
                      showFavorites: false
                    })}
                    style={{
                      padding: '6px 12px',
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
              </div>
            )}

            {/* Enhanced Shortcut Count with Search Stats */}
            <div style={{ marginBottom: '20px' }}>
              <p style={{ margin: '0', color: '#a0a0a0', fontSize: '14px' }}>
                {hasQuery ? (
                  <span>
                    {isSearching ? 'Searching...' : 
                     searchStats.hasResults ? 
                       `Found ${filteredShortcuts.length} of ${searchStats.totalItems} shortcuts` :
                       `No shortcuts found for "${searchQuery}"`}
                    {searchFilters.showRecent && ' • Recent only'}
                    {searchFilters.showFavorites && ' • Favorites only'}
                    {searchFilters.sortBy !== 'relevance' && ` • Sorted by ${searchFilters.sortBy}`}
                    {searchStats.isExactMatch && ' • Exact match!'}
                  </span>
                ) : selectedFolder ? (
                  `Folder: ${selectedFolder} (${filteredShortcuts.length} shortcuts)`
                ) : (
                  `All shortcuts: ${filteredShortcuts.length} total`
                )}
              </p>
            </div>
          </>
        )}

        {/* Main Content - Shortcuts List or Add/Edit Form */}
        {(showAddForm || editingShortcut) ? (
          /* Add/Edit Shortcut Form */
          <div style={{
            background: '#1a1a1a',
            padding: '30px',
            borderRadius: '12px',
            border: '1px solid #2a2a2a',
            maxWidth: '600px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontSize: '20px', color: '#e8e8e8' }}>
                {editingShortcut ? '✏️ Edit Shortcut' : '➕ Add New Shortcut'}
              </h2>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setEditingShortcut(null);
                  setNewShortcut({ url: '', alias: '', tags: '' });
                  setNewTag('');
                }}
                style={{
                  ...buttonStyle,
                  background: '#6b7280',
                  color: '#ffffff',
                  padding: '8px 12px'
                }}
              >
                ✕ Cancel
              </button>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#a0a0a0', fontWeight: '500' }}>
                URL
              </label>
              <input
                type="text"
                value={editingShortcut ? editingShortcut.url : newShortcut.url}
                onChange={(e) => {
                  if (editingShortcut) {
                    setEditingShortcut({...editingShortcut, url: e.target.value});
                  } else {
                    setNewShortcut({...newShortcut, url: e.target.value});
                  }
                }}
                placeholder="https://example.com"
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#2a2a2a',
                  border: '1px solid #3a3a3a',
                  borderRadius: '6px',
                  color: '#e8e8e8',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#a0a0a0', fontWeight: '500' }}>
                Alias (e.g., jep-453 or folder/jep-453)
              </label>
              <input
                type="text"
                value={editingShortcut ? 
                  (editingShortcut.folder ? `${editingShortcut.folder}/${editingShortcut.alias}` : editingShortcut.alias) : 
                  newShortcut.alias}
                onChange={(e) => {
                  if (editingShortcut) {
                    const parsed = parseAliasWithFolder(e.target.value);
                    setEditingShortcut({
                      ...editingShortcut,
                      alias: parsed.alias,
                      folder: parsed.folder
                    });
                  } else {
                    setNewShortcut({...newShortcut, alias: e.target.value});
                  }
                }}
                placeholder="my-shortcut or folder/my-shortcut"
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#2a2a2a',
                  border: '1px solid #3a3a3a',
                  borderRadius: '6px',
                  color: '#e8e8e8',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#a0a0a0', fontWeight: '500' }}>
                Tags (optional, comma-separated)
              </label>
              <input
                type="text"
                value={editingShortcut ? 
                  (Array.isArray(editingShortcut.tags) ? editingShortcut.tags.join(', ') : editingShortcut.tags || '') : 
                  newShortcut.tags}
                onChange={(e) => {
                  if (editingShortcut) {
                    setEditingShortcut({...editingShortcut, tags: e.target.value});
                  } else {
                    setNewShortcut({...newShortcut, tags: e.target.value});
                  }
                }}
                placeholder="tag1, tag2, tag3"
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#2a2a2a',
                  border: '1px solid #3a3a3a',
                  borderRadius: '6px',
                  color: '#e8e8e8',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setEditingShortcut(null);
                  setNewShortcut({ url: '', alias: '', tags: '' });
                  setNewTag('');
                }}
                style={{
                  ...buttonStyle,
                  background: '#6b7280',
                  color: '#ffffff',
                  padding: '12px 20px'
                }}
              >
                Cancel
              </button>
              <button
                onClick={editingShortcut ? () => handleSaveEdit({
                  url: editingShortcut.url,
                  alias: editingShortcut.alias,
                  folder: editingShortcut.folder,
                  tags: typeof editingShortcut.tags === 'string' ? 
                    editingShortcut.tags.split(',').map(tag => tag.trim()).filter(tag => tag) :
                    (Array.isArray(editingShortcut.tags) ? editingShortcut.tags : [])
                }) : handleAddShortcut}
                style={{
                  ...buttonStyle,
                  padding: '12px 20px'
                }}
              >
                {editingShortcut ? 'Save Changes' : 'Add Shortcut'}
              </button>
            </div>
          </div>
        ) : (
          /* Shortcuts List */
          <div>
            {filteredShortcuts.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px', 
              color: '#a0a0a0',
              background: '#1a1a1a',
              borderRadius: '8px',
              border: '1px solid #2a2a2a'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '15px' }}>📝</div>
              <div style={{ fontSize: '18px', marginBottom: '10px' }}>No shortcuts found</div>
              <div style={{ fontSize: '14px' }}>
                {searchQuery ? 'Try a different search term' :
                 selectedFolder ? 'This folder is empty' :
                 'Create your first shortcut by clicking the extension icon on any webpage'}
              </div>
            </div>
          ) : (
            filteredShortcuts.map(shortcut => (
              <div 
                key={shortcut.id} 
                style={{
                  ...shortcutItemStyle,
                  cursor: 'pointer'
                }}
                onClick={() => handleOpenShortcut(shortcut)}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#2a2a2a';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#1a1a1a';
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    fontSize: '16px', 
                    fontWeight: '600', 
                    marginBottom: '5px',
                    color: '#e8e8e8'
                  }}>
                    {shortcut.folder ? `${shortcut.folder}/${shortcut.alias}` : shortcut.alias}
                  </div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#a0a0a0', 
                    marginBottom: '5px',
                    wordBreak: 'break-all'
                  }}>
                    {shortcut.url}
                  </div>
                  {shortcut.tags && shortcut.tags.length > 0 && (
                    <div style={{ fontSize: '11px', color: '#00d9ff' }}>
                      {shortcut.tags.map(tag => `#${tag}`).join(' ')}
                    </div>
                  )}
                  <div style={{ fontSize: '10px', opacity: 0.6, marginTop: '4px' }}>
                    {shortcut.accessCount ? `Used ${shortcut.accessCount} times` : 'Never used'} • 
                    {shortcut.lastAccessed ? ` Last used ${new Date(shortcut.lastAccessed).toLocaleDateString()}` : ' Never accessed'}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenShortcut(shortcut);
                    }}
                    style={buttonStyle}
                    onMouseEnter={(e) => e.target.style.background = '#00bcd4'}
                    onMouseLeave={(e) => e.target.style.background = '#00d9ff'}
                    title="Open URL"
                  >
                    🔗
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyUrl(shortcut);
                    }}
                    style={{
                      ...buttonStyle,
                      background: '#6b7280',
                      color: '#ffffff'
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#4b5563'}
                    onMouseLeave={(e) => e.target.style.background = '#6b7280'}
                    title="Copy URL"
                  >
                    📋
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePreviewShortcut(shortcut);
                    }}
                    style={{
                      ...buttonStyle,
                      background: '#8b5cf6',
                      color: '#ffffff'
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#7c3aed'}
                    onMouseLeave={(e) => e.target.style.background = '#8b5cf6'}
                    title="Preview URL"
                  >
                    👁️
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditShortcut(shortcut);
                    }}
                    style={buttonStyle}
                    onMouseEnter={(e) => e.target.style.background = '#00bcd4'}
                    onMouseLeave={(e) => e.target.style.background = '#00d9ff'}
                    title="Edit Shortcut"
                  >
                    ✏️
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteShortcut(shortcut.id);
                    }}
                    style={deleteButtonStyle}
                    onMouseEnter={(e) => e.target.style.background = '#dc2626'}
                    onMouseLeave={(e) => e.target.style.background = '#ef4444'}
                    title="Delete Shortcut"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))
          )}
          </div>
        )}



        {/* Create Folder Modal */}
        {showCreateFolder && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              background: '#1a1a1a',
              padding: '30px',
              borderRadius: '12px',
              border: '1px solid #2a2a2a',
              width: '400px',
              maxWidth: '90vw'
            }}>
              <h3 style={{ margin: '0 0 20px 0', color: '#e8e8e8' }}>
                📁 Create New Folder
              </h3>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', color: '#a0a0a0' }}>
                  Folder Name (lowercase, no spaces)
                </label>
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="my-folder"
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: '#2a2a2a',
                    border: '1px solid #3a3a3a',
                    borderRadius: '6px',
                    color: '#e8e8e8',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => {
                    setShowCreateFolder(false);
                    setNewFolderName('');
                  }}
                  style={{
                    ...buttonStyle,
                    background: '#6b7280',
                    color: '#ffffff'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateFolder}
                  style={{
                    ...buttonStyle,
                    background: '#22c55e',
                    color: '#ffffff'
                  }}
                >
                  Create Folder
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Advanced Search Modal */}
        {showAdvancedSearch && (
          <AdvancedSearch
            onClose={handleAdvancedSearchClose}
            onSelectShortcut={handleAdvancedSearchSelect}
          />
        )}

        {/* URL Preview Modal */}
        {showPreview && previewShortcut && (
          <URLPreview
            shortcut={previewShortcut}
            onClose={() => {
              setShowPreview(false);
              setPreviewShortcut(null);
            }}
            onCopy={handleCopyUrl}
            onOpen={handleOpenShortcut}
          />
        )}

        {/* Import/Export Modal */}
        {showImportExport && (
          <ImportExport
            onClose={() => setShowImportExport(false)}
            onImportComplete={() => {
              setShowImportExport(false);
              loadData(); // Refresh data after import
            }}
          />
        )}

        {/* Sync Settings Modal */}
        {showSyncSettings && (
          <SyncSettings
            onClose={() => setShowSyncSettings(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
