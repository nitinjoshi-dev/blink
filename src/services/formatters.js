/**
 * Formatters Service
 * Data transformation and formatting utilities
 */

import { formatDistanceToNow, format } from 'date-fns';

/**
 * Format full alias from folder and alias
 * @param {string} folder - Folder name (optional)
 * @param {string} alias - Alias name
 * @returns {string} Full alias like "folder/alias" or just "alias"
 */
export const formatFullAlias = (folder, alias) => {
  const folderPart = folder && folder.trim() ? folder.trim() : '';
  const aliasPart = (alias || '').trim();
  return folderPart ? `${folderPart}/${aliasPart}` : aliasPart;
};

/**
 * Parse full alias into folder and alias components
 * @param {string} fullAlias - Full alias like "folder/alias"
 * @returns {object} { folder: string, alias: string }
 */
export const parseFullAlias = (fullAlias) => {
  const parts = (fullAlias || '').split('/');
  if (parts.length === 2) {
    return { folder: parts[0].trim(), alias: parts[1].trim() };
  }
  return { folder: '', alias: fullAlias.trim() };
};

/**
 * Format date as relative time
 * @param {string|Date} date - Date to format
 * @returns {string} Relative time like "2 hours ago"
 */
export const formatTimeAgo = (date) => {
  if (!date) return '';
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch {
    return '';
  }
};

/**
 * Format date as ISO string
 * @param {string|Date} date - Date to format (optional, defaults to now)
 * @returns {string} ISO format date string
 */
export const formatDateISO = (date) => {
  const d = date ? new Date(date) : new Date();
  return d.toISOString();
};

/**
 * Format date for display
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date like "Oct 22, 2025 at 2:30 PM"
 */
export const formatDateDisplay = (date) => {
  if (!date) return '';
  try {
    return format(new Date(date), 'MMM dd, yyyy \'at\' h:mm a');
  } catch {
    return '';
  }
};

/**
 * Format date for short display
 * @param {string|Date} date - Date to format
 * @returns {string} Short format like "Oct 22"
 */
export const formatDateShort = (date) => {
  if (!date) return '';
  try {
    return format(new Date(date), 'MMM dd');
  } catch {
    return '';
  }
};

/**
 * Extract suggested alias from URL
 * @param {string} url - URL to extract from
 * @returns {string} Suggested alias
 */
export const extractAliasFromUrl = (url) => {
  if (!url) return '';

  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;

    // Remove 'www.' prefix if present
    let suggested = hostname.replace(/^www\./, '');

    // Remove domain extension
    const parts = suggested.split('.');
    if (parts.length > 0) {
      suggested = parts[0];
    }

    // Convert to lowercase and remove special characters
    suggested = suggested
      .toLowerCase()
      .replace(/[^a-z0-9\-_]/g, '-')
      .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
      .substring(0, 50);

    return suggested || 'shortcut';
  } catch {
    return 'shortcut';
  }
};

/**
 * Extract suggested alias from page title
 * @param {string} title - Page title
 * @returns {string} Suggested alias
 */
export const extractAliasFromTitle = (title) => {
  if (!title) return '';

  let alias = String(title)
    .toLowerCase()
    .trim()
    .split(/\s+/)[0] // Take first word
    .replace(/[^a-z0-9\-_]/g, '-') // Replace special chars
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .substring(0, 50);

  return alias || 'shortcut';
};

/**
 * Combine URL and title to suggest alias
 * Prefers title-based suggestion
 * @param {string} url - URL
 * @param {string} title - Page title
 * @returns {string} Suggested alias
 */
export const suggestAlias = (url, title) => {
  // Prefer title-based suggestion
  if (title && title.length > 0) {
    const titleAlias = extractAliasFromTitle(title);
    if (titleAlias) return titleAlias;
  }

  // Fall back to URL-based suggestion
  return extractAliasFromUrl(url);
};

/**
 * Format shortcut for display
 * @param {object} shortcut - Shortcut object
 * @returns {object} Formatted shortcut for UI display
 */
export const formatShortcutForDisplay = (shortcut) => {
  if (!shortcut) return null;

  return {
    ...shortcut,
    fullAlias: formatFullAlias(shortcut.folder, shortcut.alias),
    lastAccessedDisplay: formatTimeAgo(shortcut.lastAccessedAt),
    createdDisplay: formatDateDisplay(shortcut.createdAt),
    updatedDisplay: formatDateDisplay(shortcut.updatedAt),
    tagsDisplay: (shortcut.tags || []).join(', '),
  };
};

/**
 * Format multiple shortcuts for display
 * @param {array} shortcuts - Array of shortcuts
 * @returns {array} Formatted shortcuts
 */
export const formatShortcutsForDisplay = (shortcuts) => {
  if (!Array.isArray(shortcuts)) return [];
  return shortcuts.map(formatShortcutForDisplay);
};

/**
 * Truncate string with ellipsis
 * @param {string} str - String to truncate
 * @param {number} length - Max length
 * @returns {string} Truncated string
 */
export const truncate = (str, length = 50) => {
  if (!str) return '';
  if (str.length <= length) return str;
  return `${str.substring(0, length)}...`;
};

/**
 * Format URL for display (remove protocol)
 * @param {string} url - URL to format
 * @returns {string} Formatted URL
 */
export const formatUrlForDisplay = (url) => {
  if (!url) return '';
  try {
    const urlObj = new URL(url);
    const path = urlObj.pathname === '/' ? '' : urlObj.pathname;
    const search = urlObj.search || '';
    return `${urlObj.hostname}${path}${search}`;
  } catch {
    return url;
  }
};

/**
 * Format access count for display
 * @param {number} count - Access count
 * @returns {string} Formatted count like "1.2K"
 */
export const formatAccessCount = (count) => {
  if (!count) return '0';
  if (count < 1000) return String(count);
  if (count < 1000000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return `${(count / 1000000).toFixed(1)}M`;
};

/**
 * Get star rating display for access count
 * @param {number} count - Access count
 * @returns {string} Star display like "⭐⭐⭐"
 */
export const getStarRating = (count) => {
  if (!count) return '';
  if (count < 5) return '';
  if (count < 20) return '⭐';
  if (count < 50) return '⭐⭐';
  return '⭐⭐⭐';
};

/**
 * Format folder name for display
 * @param {string} folder - Folder name
 * @returns {string} Display name
 */
export const formatFolderForDisplay = (folder) => {
  if (!folder || !folder.trim()) return 'Ungrouped';
  return folder.trim();
};

/**
 * Create shortcut summary for display
 * @param {object} shortcut - Shortcut object
 * @returns {string} Summary like "work/meet - https://work.com"
 */
export const formatShortcutSummary = (shortcut) => {
  if (!shortcut) return '';
  const fullAlias = formatFullAlias(shortcut.folder, shortcut.alias);
  const url = formatUrlForDisplay(shortcut.url);
  return `${fullAlias} - ${url}`;
};

/**
 * Sort shortcuts by various criteria
 * @param {array} shortcuts - Array of shortcuts
 * @param {string} sortBy - Sort key: 'alias', 'folder', 'recent', 'popular'
 * @returns {array} Sorted shortcuts
 */
export const sortShortcuts = (shortcuts, sortBy = 'alias') => {
  if (!Array.isArray(shortcuts)) return [];

  const sorted = [...shortcuts];

  switch (sortBy) {
    case 'folder':
      sorted.sort((a, b) => {
        const folderA = (a.folder || '').toLowerCase();
        const folderB = (b.folder || '').toLowerCase();
        return folderA.localeCompare(folderB);
      });
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
      sorted.sort((a, b) => {
        const aliasA = `${(a.folder || '').toLowerCase()}/${(a.alias || '').toLowerCase()}`;
        const aliasB = `${(b.folder || '').toLowerCase()}/${(b.alias || '').toLowerCase()}`;
        return aliasA.localeCompare(aliasB);
      });
  }

  return sorted;
};

/**
 * Group shortcuts by folder
 * @param {array} shortcuts - Array of shortcuts
 * @returns {object} Grouped shortcuts { folderName: [shortcuts] }
 */
export const groupShortcutsByFolder = (shortcuts) => {
  const grouped = {};

  if (!Array.isArray(shortcuts)) return grouped;

  for (const shortcut of shortcuts) {
    const folder = shortcut.folder ? shortcut.folder.trim() : 'ungrouped';
    if (!grouped[folder]) {
      grouped[folder] = [];
    }
    grouped[folder].push(shortcut);
  }

  return grouped;
};

/**
 * Format error message for display
 * @param {string|object} error - Error to format
 * @returns {string} Formatted error message
 */
export const formatError = (error) => {
  if (!error) return 'An unknown error occurred';
  if (typeof error === 'string') return error;
  if (error.message) return error.message;
  return JSON.stringify(error);
};

/**
 * Create CSV row from shortcut
 * @param {object} shortcut - Shortcut object
 * @returns {string} CSV row
 */
export const shortcutToCsvRow = (shortcut) => {
  if (!shortcut) return '';

  const fields = [
    formatFullAlias(shortcut.folder, shortcut.alias),
    shortcut.url,
    (shortcut.tags || []).join(';'),
    shortcut.accessCount || 0,
    formatDateDisplay(shortcut.createdAt),
  ];

  // Escape and quote fields containing commas or quotes
  return fields
    .map((field) => {
      const str = String(field || '');
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    })
    .join(',');
};
