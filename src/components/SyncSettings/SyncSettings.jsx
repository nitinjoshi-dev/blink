/**
 * SyncSettings Component
 * Manages Chrome profile sync for shortcuts
 */

import React, { useState, useEffect } from 'react';
import { 
  getSyncStatus, 
  syncToChrome, 
  loadFromChrome, 
  clearChromeSync, 
  getSyncQuota,
  isSyncAvailable 
} from '../../services/syncService';
import { getAllShortcuts } from '../../services/shortcutService';

const SyncSettings = ({ onClose }) => {
  const [syncStatus, setSyncStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [quota, setQuota] = useState(null);

  useEffect(() => {
    loadSyncStatus();
  }, []);

  const loadSyncStatus = async () => {
    try {
      setIsLoading(true);
      const status = await getSyncStatus();
      setSyncStatus(status);
      
      if (status.available) {
        const quotaInfo = await getSyncQuota();
        setQuota(quotaInfo);
      }
    } catch (err) {
      setError(`Failed to load sync status: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncToChrome = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      const shortcuts = await getAllShortcuts();
      const result = await syncToChrome(shortcuts);
      
      setSuccess(`Synced ${result.shortcutsCount} shortcuts to Chrome profile`);
      await loadSyncStatus(); // Refresh status
    } catch (err) {
      setError(`Sync failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadFromChrome = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      const result = await loadFromChrome();
      
      if (result.success) {
        setSuccess(`Loaded ${result.shortcutsCount} shortcuts from Chrome profile`);
      } else {
        setError(result.message || 'No sync data found');
      }
    } catch (err) {
      setError(`Load failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearSync = async () => {
    if (!window.confirm('Are you sure you want to clear all sync data? This cannot be undone.')) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      await clearChromeSync();
      setSuccess('Sync data cleared successfully');
      await loadSyncStatus(); // Refresh status
    } catch (err) {
      setError(`Clear failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
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

  const contentStyle = {
    padding: '24px'
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
    transition: 'background-color 0.2s',
    marginRight: '8px',
    marginBottom: '8px'
  };

  const statusStyle = (type) => ({
    padding: '12px',
    borderRadius: '6px',
    marginBottom: '16px',
    fontSize: '14px',
    backgroundColor: type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#2a2a2a',
    color: type === 'success' || type === 'error' ? '#ffffff' : '#e8e8e8',
    border: type === 'info' ? '1px solid #3a3a3a' : 'none'
  });

  if (!isSyncAvailable()) {
    return (
      <div style={containerStyle}>
        <div style={headerStyle}>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', color: '#e8e8e8' }}>
              Chrome Sync
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#a0a0a0' }}>
              Sync shortcuts across devices
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
        <div style={contentStyle}>
          <div style={statusStyle('error')}>
            ❌ Chrome sync is not available. Make sure you're signed into Chrome and sync is enabled.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <div>
          <h3 style={{ margin: 0, fontSize: '18px', color: '#e8e8e8' }}>
            Chrome Sync
          </h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#a0a0a0' }}>
            Sync shortcuts across devices
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

      {/* Content */}
      <div style={contentStyle}>
        {/* Sync Status */}
        {syncStatus && (
          <div style={statusStyle('info')}>
            <div style={{ fontWeight: '600', marginBottom: '8px' }}>
              Sync Status
            </div>
            {syncStatus.synced ? (
              <div>
                ✅ Synced to Chrome profile
                {syncStatus.lastSync && (
                  <div style={{ fontSize: '12px', marginTop: '4px', opacity: 0.8 }}>
                    Last sync: {new Date(syncStatus.lastSync).toLocaleString()}
                  </div>
                )}
                {syncStatus.shortcutsCount && (
                  <div style={{ fontSize: '12px', marginTop: '4px', opacity: 0.8 }}>
                    {syncStatus.shortcutsCount} shortcuts synced
                  </div>
                )}
              </div>
            ) : (
              <div>
                ⚠️ Not synced to Chrome profile
                <div style={{ fontSize: '12px', marginTop: '4px', opacity: 0.8 }}>
                  Your shortcuts are only stored locally
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quota Information */}
        {quota && quota.available && (
          <div style={statusStyle('info')}>
            <div style={{ fontWeight: '600', marginBottom: '8px' }}>
              Storage Usage
            </div>
            <div style={{ fontSize: '12px', marginBottom: '4px' }}>
              Used: {Math.round(quota.used / 1024)}KB / {Math.round(quota.max / 1024)}KB
            </div>
            <div style={{ 
              width: '100%', 
              height: '6px', 
              backgroundColor: '#3a3a3a', 
              borderRadius: '3px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${quota.percentage}%`,
                height: '100%',
                backgroundColor: quota.percentage > 80 ? '#ef4444' : quota.percentage > 60 ? '#f59e0b' : '#10b981',
                transition: 'width 0.3s'
              }} />
            </div>
            <div style={{ fontSize: '10px', marginTop: '4px', opacity: 0.7 }}>
              {quota.remaining > 0 ? `${Math.round(quota.remaining / 1024)}KB remaining` : 'Storage full'}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ marginTop: '20px' }}>
          <button
            onClick={handleSyncToChrome}
            disabled={isLoading}
            style={{
              ...buttonStyle,
              backgroundColor: isLoading ? '#6b7280' : '#00d9ff',
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? '⏳ Syncing...' : '📤 Sync to Chrome'}
          </button>

          <button
            onClick={handleLoadFromChrome}
            disabled={isLoading}
            style={{
              ...buttonStyle,
              backgroundColor: isLoading ? '#6b7280' : '#10b981',
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? '⏳ Loading...' : '📥 Load from Chrome'}
          </button>

          <button
            onClick={handleClearSync}
            disabled={isLoading}
            style={{
              ...buttonStyle,
              backgroundColor: isLoading ? '#6b7280' : '#ef4444',
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? '⏳ Clearing...' : '🗑️ Clear Sync Data'}
          </button>
        </div>

        {/* Status Messages */}
        {error && (
          <div style={statusStyle('error')}>
            ❌ {error}
          </div>
        )}

        {success && (
          <div style={statusStyle('success')}>
            ✅ {success}
          </div>
        )}

        {/* Info */}
        <div style={{ 
          marginTop: '20px', 
          padding: '12px', 
          backgroundColor: '#2a2a2a', 
          borderRadius: '6px',
          fontSize: '12px',
          color: '#a0a0a0'
        }}>
          <div style={{ fontWeight: '600', marginBottom: '4px' }}>ℹ️ About Chrome Sync</div>
          <div>• Syncs shortcuts across all your Chrome devices</div>
          <div>• Limited to 100KB storage (about 200-500 shortcuts)</div>
          <div>• Requires Chrome sign-in and sync enabled</div>
          <div>• Data is encrypted and stored in your Google account</div>
        </div>
      </div>
    </div>
  );
};

export default SyncSettings;
