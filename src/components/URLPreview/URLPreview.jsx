/**
 * URLPreview Component
 * Preview and copy URL functionality with metadata
 */

import React, { useState, useEffect } from 'react';

const URLPreview = ({ shortcut, onClose, onCopy, onOpen }) => {
  const [metadata, setMetadata] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (shortcut) {
      fetchMetadata(shortcut.url);
    }
  }, [shortcut]);

  const fetchMetadata = async (url) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real implementation, you might want to use a proxy or CORS-enabled service
      // For now, we'll just show basic URL information
      const urlObj = new URL(url);
      
      setMetadata({
        title: shortcut.alias || urlObj.hostname,
        description: `Shortcut for ${urlObj.hostname}`,
        favicon: `https://www.google.com/s2/favicons?domain=${urlObj.hostname}`,
        domain: urlObj.hostname,
        protocol: urlObj.protocol,
        path: urlObj.pathname,
        search: urlObj.search,
        hash: urlObj.hash
      });
    } catch (err) {
      console.error('Error fetching metadata:', err);
      setError('Failed to load URL metadata');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shortcut.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      if (onCopy) onCopy(shortcut);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  const handleOpen = () => {
    if (onOpen) onOpen(shortcut);
  };

  const containerStyle = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '500px',
    maxWidth: '90vw',
    backgroundColor: '#1a1a1a',
    border: '1px solid #2a2a2a',
    borderRadius: '12px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
    zIndex: 10001,
    overflow: 'hidden'
  };

  const headerStyle = {
    padding: '20px 24px 16px',
    borderBottom: '1px solid #2a2a2a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  };

  const contentStyle = {
    padding: '20px 24px'
  };

  const urlStyle = {
    fontSize: '14px',
    color: '#00d9ff',
    wordBreak: 'break-all',
    marginBottom: '16px',
    padding: '12px',
    backgroundColor: '#2a2a2a',
    borderRadius: '6px',
    border: '1px solid #3a3a3a'
  };

  const metadataStyle = {
    marginBottom: '20px'
  };

  const metadataItemStyle = {
    display: 'flex',
    marginBottom: '8px',
    fontSize: '12px'
  };

  const labelStyle = {
    color: '#a0a0a0',
    minWidth: '80px',
    marginRight: '8px'
  };

  const valueStyle = {
    color: '#e8e8e8',
    flex: 1
  };

  const buttonStyle = {
    padding: '8px 16px',
    margin: '0 8px 0 0',
    backgroundColor: '#00d9ff',
    color: '#0f0f0f',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  };

  const copyButtonStyle = {
    ...buttonStyle,
    backgroundColor: copied ? '#10b981' : '#6b7280',
    color: '#ffffff'
  };

  const closeButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#ef4444',
    color: '#ffffff'
  };

  if (!shortcut) return null;

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontSize: '20px' }}>🔗</div>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', color: '#e8e8e8' }}>
              URL Preview
            </h3>
            <div style={{ fontSize: '12px', color: '#a0a0a0' }}>
              {shortcut.folder ? `${shortcut.folder}/` : ''}{shortcut.alias}
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#a0a0a0',
            cursor: 'pointer',
            fontSize: '18px',
            padding: '4px'
          }}
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div style={contentStyle}>
        {/* URL Display */}
        <div style={urlStyle}>
          {shortcut.url}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div style={{ textAlign: 'center', padding: '20px', color: '#a0a0a0' }}>
            ⏳ Loading URL metadata...
          </div>
        )}

        {/* Error State */}
        {error && (
          <div style={{ textAlign: 'center', padding: '20px', color: '#ef4444' }}>
            ❌ {error}
          </div>
        )}

        {/* Metadata */}
        {metadata && !isLoading && !error && (
          <div style={metadataStyle}>
            <div style={metadataItemStyle}>
              <span style={labelStyle}>Domain:</span>
              <span style={valueStyle}>{metadata.domain}</span>
            </div>
            <div style={metadataItemStyle}>
              <span style={labelStyle}>Protocol:</span>
              <span style={valueStyle}>{metadata.protocol}</span>
            </div>
            {metadata.path && metadata.path !== '/' && (
              <div style={metadataItemStyle}>
                <span style={labelStyle}>Path:</span>
                <span style={valueStyle}>{metadata.path}</span>
              </div>
            )}
            {metadata.search && (
              <div style={metadataItemStyle}>
                <span style={labelStyle}>Query:</span>
                <span style={valueStyle}>{metadata.search}</span>
              </div>
            )}
            {metadata.hash && (
              <div style={metadataItemStyle}>
                <span style={labelStyle}>Hash:</span>
                <span style={valueStyle}>{metadata.hash}</span>
              </div>
            )}
            {shortcut.tags && shortcut.tags.length > 0 && (
              <div style={metadataItemStyle}>
                <span style={labelStyle}>Tags:</span>
                <span style={valueStyle}>
                  {shortcut.tags.map(tag => `#${tag}`).join(' ')}
                </span>
              </div>
            )}
            {shortcut.accessCount && (
              <div style={metadataItemStyle}>
                <span style={labelStyle}>Used:</span>
                <span style={valueStyle}>
                  {shortcut.accessCount} time{shortcut.accessCount !== 1 ? 's' : ''}
                </span>
              </div>
            )}
            {shortcut.lastAccessed && (
              <div style={metadataItemStyle}>
                <span style={labelStyle}>Last Used:</span>
                <span style={valueStyle}>
                  {new Date(shortcut.lastAccessed).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
          <button
            onClick={handleCopy}
            style={copyButtonStyle}
            onMouseEnter={(e) => {
              if (!copied) e.target.style.backgroundColor = '#4b5563';
            }}
            onMouseLeave={(e) => {
              if (!copied) e.target.style.backgroundColor = '#6b7280';
            }}
          >
            {copied ? '✓ Copied!' : '📋 Copy URL'}
          </button>
          <button
            onClick={handleOpen}
            style={buttonStyle}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#00bcd4'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#00d9ff'}
          >
            🔗 Open URL
          </button>
          <button
            onClick={onClose}
            style={closeButtonStyle}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#dc2626'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#ef4444'}
          >
            ✕ Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default URLPreview;
