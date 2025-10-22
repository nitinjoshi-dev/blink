/**
 * ImportExport Component
 * Handles importing and exporting shortcuts data
 */

import React, { useState } from 'react';
import { exportShortcuts, downloadExport, importShortcuts, validateImportFile, getExportStats } from '../../services/importExportService';
import { createShortcut } from '../../services/shortcutService';

const ImportExport = ({ onClose, onImportComplete }) => {
  const [activeTab, setActiveTab] = useState('export'); // 'export' or 'import'
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [exportStats, setExportStats] = useState(null);
  const [importPreview, setImportPreview] = useState(null);

  React.useEffect(() => {
    loadExportStats();
  }, []);

  const loadExportStats = async () => {
    try {
      const stats = await getExportStats();
      setExportStats(stats);
    } catch (err) {
      console.error('Error loading export stats:', err);
    }
  };

  const handleExport = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const exportData = await exportShortcuts();
      const filename = `blink-export-${new Date().toISOString().split('T')[0]}.json`;
      downloadExport(exportData, filename);
      
      setSuccess(`Export downloaded: ${filename}`);
    } catch (err) {
      setError(`Export failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);
      setImportPreview(null);

      // Validate file
      const validation = await validateImportFile(file);
      if (!validation.valid) {
        setError(validation.error);
        return;
      }

      // Parse import data
      const importResult = await importShortcuts(file);
      setImportPreview(importResult);
      
    } catch (err) {
      setError(`Import validation failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async () => {
    if (!importPreview) return;

    try {
      setIsLoading(true);
      setError(null);

      // Import each shortcut
      let imported = 0;
      let skipped = 0;

      for (const shortcut of importPreview.shortcuts) {
        try {
          await createShortcut({
            url: shortcut.url,
            alias: shortcut.alias,
            folder: shortcut.folder || '',
            tags: shortcut.tags || []
          });
          imported++;
        } catch (err) {
          console.warn('Skipped duplicate shortcut:', shortcut.alias);
          skipped++;
        }
      }

      setSuccess(`Import complete: ${imported} shortcuts imported, ${skipped} skipped`);
      setImportPreview(null);
      
      if (onImportComplete) {
        onImportComplete();
      }
    } catch (err) {
      setError(`Import failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
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
    overflow: 'hidden'
  };

  const headerStyle = {
    padding: '20px 24px 16px',
    borderBottom: '1px solid #2a2a2a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  };

  const tabStyle = (isActive) => ({
    padding: '8px 16px',
    backgroundColor: isActive ? '#00d9ff' : 'transparent',
    color: isActive ? '#0f0f0f' : '#e8e8e8',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s'
  });

  const contentStyle = {
    padding: '24px',
    maxHeight: '400px',
    overflowY: 'auto'
  };

  const buttonStyle = {
    padding: '10px 20px',
    backgroundColor: '#00d9ff',
    color: '#0f0f0f',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  };

  const fileInputStyle = {
    width: '100%',
    padding: '12px',
    backgroundColor: '#2a2a2a',
    border: '1px solid #3a3a3a',
    borderRadius: '6px',
    color: '#e8e8e8',
    fontSize: '14px',
    marginBottom: '16px'
  };

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <div>
          <h3 style={{ margin: 0, fontSize: '18px', color: '#e8e8e8' }}>
            Import / Export
          </h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#a0a0a0' }}>
            Manage your Blink data
          </p>
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

      {/* Tabs */}
      <div style={{ padding: '0 24px', borderBottom: '1px solid #2a2a2a' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setActiveTab('export')}
            style={tabStyle(activeTab === 'export')}
          >
            📤 Export
          </button>
          <button
            onClick={() => setActiveTab('import')}
            style={tabStyle(activeTab === 'import')}
          >
            📥 Import
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={contentStyle}>
        {activeTab === 'export' && (
          <div>
            <h4 style={{ margin: '0 0 16px 0', color: '#e8e8e8' }}>Export Shortcuts</h4>
            
            {exportStats && (
              <div style={{ 
                backgroundColor: '#2a2a2a', 
                padding: '16px', 
                borderRadius: '8px', 
                marginBottom: '20px' 
              }}>
                <div style={{ fontSize: '14px', color: '#a0a0a0', marginBottom: '8px' }}>
                  Export Statistics
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#a0a0a0' }}>Total Shortcuts</div>
                    <div style={{ fontSize: '18px', color: '#00d9ff', fontWeight: '600' }}>
                      {exportStats.totalShortcuts}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#a0a0a0' }}>Total Access</div>
                    <div style={{ fontSize: '18px', color: '#00d9ff', fontWeight: '600' }}>
                      {exportStats.totalAccess}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#a0a0a0' }}>Favorites</div>
                    <div style={{ fontSize: '18px', color: '#00d9ff', fontWeight: '600' }}>
                      {exportStats.favorites}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#a0a0a0' }}>Recent (7 days)</div>
                    <div style={{ fontSize: '18px', color: '#00d9ff', fontWeight: '600' }}>
                      {exportStats.recent}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <p style={{ margin: '0 0 20px 0', color: '#a0a0a0', fontSize: '14px' }}>
              Export all your shortcuts to a JSON file. This includes URLs, aliases, folders, tags, and usage statistics.
            </p>

            <button
              onClick={handleExport}
              disabled={isLoading}
              style={{
                ...buttonStyle,
                backgroundColor: isLoading ? '#6b7280' : '#00d9ff',
                cursor: isLoading ? 'not-allowed' : 'pointer'
              }}
            >
              {isLoading ? '⏳ Exporting...' : '📤 Export Shortcuts'}
            </button>
          </div>
        )}

        {activeTab === 'import' && (
          <div>
            <h4 style={{ margin: '0 0 16px 0', color: '#e8e8e8' }}>Import Shortcuts</h4>
            
            <p style={{ margin: '0 0 16px 0', color: '#a0a0a0', fontSize: '14px' }}>
              Import shortcuts from a JSON file. Duplicate shortcuts will be skipped.
            </p>

            <input
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              style={fileInputStyle}
              disabled={isLoading}
            />

            {importPreview && (
              <div style={{ 
                backgroundColor: '#2a2a2a', 
                padding: '16px', 
                borderRadius: '8px', 
                marginBottom: '20px' 
              }}>
                <div style={{ fontSize: '14px', color: '#a0a0a0', marginBottom: '8px' }}>
                  Import Preview
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#a0a0a0' }}>Total Shortcuts</div>
                    <div style={{ fontSize: '18px', color: '#00d9ff', fontWeight: '600' }}>
                      {importPreview.totalShortcuts}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#a0a0a0' }}>Valid Shortcuts</div>
                    <div style={{ fontSize: '18px', color: '#10b981', fontWeight: '600' }}>
                      {importPreview.validShortcuts}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#a0a0a0' }}>Invalid Shortcuts</div>
                    <div style={{ fontSize: '18px', color: '#ef4444', fontWeight: '600' }}>
                      {importPreview.invalidShortcuts}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#a0a0a0' }}>Export Date</div>
                    <div style={{ fontSize: '12px', color: '#a0a0a0' }}>
                      {new Date(importPreview.exportDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {importPreview && (
              <button
                onClick={handleImport}
                disabled={isLoading}
                style={{
                  ...buttonStyle,
                  backgroundColor: isLoading ? '#6b7280' : '#10b981',
                  cursor: isLoading ? 'not-allowed' : 'pointer'
                }}
              >
                {isLoading ? '⏳ Importing...' : '📥 Import Shortcuts'}
              </button>
            )}
          </div>
        )}

        {/* Status Messages */}
        {error && (
          <div style={{
            backgroundColor: '#ef4444',
            color: '#ffffff',
            padding: '12px',
            borderRadius: '6px',
            marginTop: '16px',
            fontSize: '14px'
          }}>
            ❌ {error}
          </div>
        )}

        {success && (
          <div style={{
            backgroundColor: '#10b981',
            color: '#ffffff',
            padding: '12px',
            borderRadius: '6px',
            marginTop: '16px',
            fontSize: '14px'
          }}>
            ✅ {success}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImportExport;
