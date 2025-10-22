import React, { useState, useEffect } from 'react';
import { createShortcut, getShortcutByUrl, updateShortcut } from '../../services/shortcutService';
import { validateUrl, validateAlias, parseAliasWithFolder } from '../../services/validators';
import '@/styles/global.css';

/**
 * PluginPopup Component
 * Main entry point when user clicks the plugin icon
 * Context-aware: shows add form for new URLs, view/edit for existing URLs
 */
export default function PluginPopup() {
  const [isLoading, setIsLoading] = useState(true);
  const [url, setUrl] = useState('');
  const [alias, setAlias] = useState('');
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [urlError, setUrlError] = useState('');
  const [aliasError, setAliasError] = useState('');
  const [existingShortcut, setExistingShortcut] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [tags, setTags] = useState('');

  useEffect(() => {
    console.log('PluginPopup mounted, getting current tab...');
    
    // Get current tab information and check for existing shortcut
    const getCurrentTab = async () => {
      try {
        console.log('Querying tabs...');
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        console.log('Tab data:', tab);
        
        if (tab) {
          const currentUrl = tab.url || '';
          setUrl(currentUrl);
          
          // Check if shortcut already exists for this URL
          try {
            const existing = await getShortcutByUrl(currentUrl);
            if (existing) {
              console.log('Existing shortcut found:', existing);
              setExistingShortcut(existing);
              setIsEditMode(true);
              // Show the saved alias for editing
              const fullAlias = existing.folder ? `${existing.folder}/${existing.alias}` : existing.alias;
              setAlias(fullAlias);
              // Show existing tags
              setTags((existing.tags || []).join(', '));
            } else {
              console.log('No existing shortcut found, new shortcut mode');
              setIsEditMode(false);
              // Don't auto-fill alias from title for new shortcuts
              setAlias('');
              setTags('');
            }
          } catch (err) {
            console.error('Error checking for existing shortcut:', err);
            // If we can't check, assume new shortcut
            setIsEditMode(false);
            setAlias('');
            setTags('');
          }
          
          console.log('Tab info set:', { url: tab.url, isEditMode: isEditMode });
        } else {
          console.warn('No active tab found');
        }
        setIsLoading(false);
      } catch (err) {
        console.error('Error getting current tab:', err);
        setError('Failed to get page information: ' + err.message);
        setIsLoading(false);
      }
    };

    getCurrentTab();
  }, []);

  const containerStyle = {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    height: '100%',
    minHeight: '300px',
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  };

  const titleStyle = {
    fontSize: '16px',
    fontWeight: '600',
    color: '#e8e8e8',
    margin: 0,
  };

  const contentStyle = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  };

  const labelStyle = {
    fontSize: '12px',
    color: '#888888',
    fontWeight: '500',
    marginTop: '8px',
  };

  const valueStyle = {
    fontSize: '13px',
    color: '#e8e8e8',
    padding: '8px 10px',
    backgroundColor: '#1a1a1a',
    borderRadius: '4px',
    wordBreak: 'break-all',
  };

  const loadingStyle = {
    textAlign: 'center',
    padding: '20px',
    color: '#888888',
  };

  const errorStyle = {
    textAlign: 'center',
    padding: '20px',
    color: '#ef4444',
  };

  const buttonStyle = {
    padding: '10px 16px',
    marginTop: '8px',
    backgroundColor: '#00d9ff',
    color: '#0f0f0f',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background 0.2s',
  };

  const handleSaveShortcut = async () => {
    console.log('Saving shortcut:', { url, alias });
    
    // Run real-time validation
    const isUrlValid = validateUrlRealTime(url);
    const isAliasValid = validateAliasRealTime(alias);
    
    // Check if there are any validation errors
    if (!isUrlValid || !isAliasValid) {
      setError('Please fix the validation errors above');
      return;
    }

    // Parse alias with folder support
    const parsedAlias = parseAliasWithFolder(alias);

    setIsSaving(true);
    setError(null);
    setSaveMessage('');

    try {
      let savedShortcut;
      
      if (isEditMode && existingShortcut) {
        // Update existing shortcut
        console.log('Updating existing shortcut:', existingShortcut.id);
        const updateData = {
          alias: parsedAlias.alias,
          folder: parsedAlias.folder,
          tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        };
        
        savedShortcut = await updateShortcut(existingShortcut.id, updateData);
        console.log('Shortcut updated successfully:', savedShortcut);
        
        // Update the existing shortcut state
        setExistingShortcut(savedShortcut);
        
        // Show success message for update
        const folderInfo = parsedAlias.folder ? ` in folder "${parsedAlias.folder}"` : '';
        setSaveMessage(`✅ Shortcut "${parsedAlias.alias}"${folderInfo} updated successfully!`);
      } else {
        // Create new shortcut
        console.log('Creating new shortcut');
        const shortcutData = {
          url: url.trim(),
          alias: parsedAlias.alias,
          folder: parsedAlias.folder,
          tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        };

        savedShortcut = await createShortcut(shortcutData);
        console.log('Shortcut created successfully:', savedShortcut);
        
        // Update state to reflect this is now an existing shortcut
        setExistingShortcut(savedShortcut);
        setIsEditMode(true);
        
        // Show success message for creation
        const folderInfo = parsedAlias.folder ? ` in folder "${parsedAlias.folder}"` : '';
        setSaveMessage(`✅ Shortcut "${parsedAlias.alias}"${folderInfo} created successfully!`);
      }
      
      // Clear success message after 3 seconds (but keep form data)
      setTimeout(() => {
        setSaveMessage('');
      }, 3000);

    } catch (err) {
      console.error('Error saving shortcut:', err);
      setError(`Failed to save shortcut: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenDashboard = () => {
    console.log('Opening dashboard...');
    chrome.tabs.create({ url: chrome.runtime.getURL('dashboard.html') });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSaveShortcut();
    }
  };

  const validateUrlRealTime = (urlValue) => {
    if (!urlValue.trim()) {
      setUrlError('');
      return true;
    }
    
    const urlValidation = validateUrl(urlValue);
    if (!urlValidation.valid) {
      setUrlError(urlValidation.error);
      return false;
    } else {
      setUrlError('');
      return true;
    }
  };

  const validateAliasRealTime = (aliasValue) => {
    if (!aliasValue.trim()) {
      setAliasError('');
      return true;
    }
    
    const parsedAlias = parseAliasWithFolder(aliasValue);
    if (!parsedAlias.alias) {
      setAliasError('Alias is required');
      return false;
    }

    const aliasValidation = validateAlias(parsedAlias.alias);
    if (!aliasValidation.valid) {
      setAliasError(aliasValidation.error);
      return false;
    }

    if (parsedAlias.folder) {
      const folderValidation = validateAlias(parsedAlias.folder);
      if (!folderValidation.valid) {
        setAliasError(`Invalid folder: ${folderValidation.error}`);
        return false;
      }
    }

    setAliasError('');
    return true;
  };

  const handleInputChange = (setter, validator) => (e) => {
    const value = e.target.value;
    setter(value);
    
    // Clear general error when user starts typing
    if (error) {
      setError(null);
    }
    
    // Run real-time validation
    if (validator) {
      validator(value);
    }
  };

  console.log('PluginPopup rendering:', { isLoading, url, alias, error });

  if (isLoading) {
    return (
      <div style={containerStyle}>
        <div style={loadingStyle}>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={containerStyle}>
        <div style={errorStyle}>{error}</div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div>
          <h1 style={titleStyle}>URL Shortcuts</h1>
          {isEditMode && (
            <div style={{
              fontSize: '11px',
              color: '#00d9ff',
              marginTop: '2px',
              fontWeight: '500'
            }}>
              ✏️ Editing existing shortcut
            </div>
          )}
        </div>
        <button 
          onClick={handleOpenDashboard}
          style={buttonStyle} 
          title="Go to Dashboard"
          onMouseEnter={(e) => e.target.style.backgroundColor = '#00bcd4'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#00d9ff'}
        >
          🏠
        </button>
      </div>

      <div style={contentStyle}>
        <div>
          <div style={labelStyle}>URL</div>
          <input
            type="text"
            value={url}
            onChange={handleInputChange(setUrl, validateUrlRealTime)}
            onKeyDown={handleKeyDown}
            style={{
              width: '100%',
              background: '#1a1a1a',
              border: `1px solid ${urlError ? '#ef4444' : '#2a2a2a'}`,
              borderRadius: '4px',
              padding: '8px 10px',
              fontSize: '13px',
              color: '#e8e8e8',
              outline: 'none',
              transition: 'border-color 0.2s ease'
            }}
            onFocus={(e) => e.target.style.borderColor = urlError ? '#ef4444' : '#00d9ff'}
            onBlur={(e) => e.target.style.borderColor = urlError ? '#ef4444' : '#2a2a2a'}
            placeholder="Enter URL..."
          />
          {urlError && (
            <div style={{
              fontSize: '11px',
              color: '#ef4444',
              marginTop: '4px',
              marginLeft: '4px'
            }}>
              ❌ {urlError}
            </div>
          )}
        </div>

        <div>
          <div style={labelStyle}>Alias</div>
          <input
            type="text"
            value={alias}
            onChange={handleInputChange(setAlias, validateAliasRealTime)}
            onKeyDown={handleKeyDown}
            style={{
              width: '100%',
              background: '#1a1a1a',
              border: `1px solid ${aliasError ? '#ef4444' : '#2a2a2a'}`,
              borderRadius: '4px',
              padding: '8px 10px',
              fontSize: '13px',
              color: '#e8e8e8',
              outline: 'none',
              transition: 'border-color 0.2s ease'
            }}
            onFocus={(e) => e.target.style.borderColor = aliasError ? '#ef4444' : '#00d9ff'}
            onBlur={(e) => e.target.style.borderColor = aliasError ? '#ef4444' : '#2a2a2a'}
            placeholder="Enter alias (e.g., jep-453 or read/jep-453)..."
          />
          {aliasError && (
            <div style={{
              fontSize: '11px',
              color: '#ef4444',
              marginTop: '4px',
              marginLeft: '4px'
            }}>
              ❌ {aliasError}
            </div>
          )}
        </div>

        <div>
          <div style={labelStyle}>Tags (optional, comma-separated)</div>
          <input
            type="text"
            value={tags}
            onChange={handleInputChange(setTags)}
            onKeyDown={handleKeyDown}
            style={{
              width: '100%',
              background: '#1a1a1a',
              border: '1px solid #2a2a2a',
              borderRadius: '4px',
              padding: '8px 10px',
              fontSize: '13px',
              color: '#e8e8e8',
              outline: 'none',
              transition: 'border-color 0.2s ease'
            }}
            onFocus={(e) => e.target.style.borderColor = '#00d9ff'}
            onBlur={(e) => e.target.style.borderColor = '#2a2a2a'}
            placeholder="tag1, tag2, tag3"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div style={{ 
            marginTop: '12px',
            padding: '8px 12px', 
            backgroundColor: '#2d1b1b', 
            border: '1px solid #ef4444',
            borderRadius: '4px', 
            fontSize: '12px', 
            color: '#ef4444',
            textAlign: 'center'
          }}>
            ❌ {error}
          </div>
        )}

        {/* Success Message */}
        {saveMessage && (
          <div style={{ 
            marginTop: '12px',
            padding: '8px 12px', 
            backgroundColor: '#1b2d1b', 
            border: '1px solid #22c55e',
            borderRadius: '4px', 
            fontSize: '12px', 
            color: '#22c55e',
            textAlign: 'center'
          }}>
            {saveMessage}
          </div>
        )}

        {/* Keyboard Shortcut Hint */}
        {!error && !saveMessage && (
          <div style={{ 
            marginTop: '16px', 
            padding: '8px 12px', 
            backgroundColor: '#1a1a1a', 
            borderRadius: '4px', 
            fontSize: '11px', 
            color: '#888888',
            textAlign: 'center'
          }}>
            💡 Press <kbd style={{ 
              background: '#2a2a2a', 
              padding: '2px 6px', 
              borderRadius: '3px',
              fontSize: '10px',
              color: '#e8e8e8'
            }}>Cmd+Enter</kbd> to save
          </div>
        )}

        <button 
          onClick={handleSaveShortcut}
          disabled={isSaving || urlError || aliasError || !url.trim() || !alias.trim()}
          style={{
            ...buttonStyle, 
            marginTop: 'auto',
            opacity: (isSaving || urlError || aliasError || !url.trim() || !alias.trim()) ? 0.6 : 1,
            cursor: (isSaving || urlError || aliasError || !url.trim() || !alias.trim()) ? 'not-allowed' : 'pointer'
          }}
          onMouseEnter={(e) => !(isSaving || urlError || aliasError || !url.trim() || !alias.trim()) && (e.target.style.backgroundColor = '#00bcd4')}
          onMouseLeave={(e) => !(isSaving || urlError || aliasError || !url.trim() || !alias.trim()) && (e.target.style.backgroundColor = '#00d9ff')}
        >
          {isSaving ? '⏳ Saving...' : (isEditMode ? '✏️ Update Shortcut' : '+ Add Shortcut')}
        </button>
      </div>
    </div>
  );
}
