/**
 * Validators Service
 * Input validation functions for all shortcut fields
 * Based on requirements from docs/requirements/01-core-shortcut-management.md
 */

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {object} { valid: boolean, error?: string }
 */
export const validateUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return { valid: false, error: 'URL is required' };
  }

  const trimmed = url.trim();
  if (!trimmed) {
    return { valid: false, error: 'URL cannot be empty' };
  }

  if (trimmed.length > 2048) {
    return { valid: false, error: 'URL is too long (max 2048 characters)' };
  }

  // Check for valid HTTP/HTTPS protocol
  try {
    const urlObj = new URL(trimmed);
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return { valid: false, error: 'URL must use HTTP or HTTPS protocol' };
    }
    return { valid: true };
  } catch (err) {
    return { valid: false, error: 'Invalid URL format' };
  }
};

/**
 * Parse alias with folder support (folder/alias format)
 * @param {string} aliasInput - Alias input that may contain folder/alias
 * @returns {object} { folder: string, alias: string, fullAlias: string }
 */
export const parseAliasWithFolder = (aliasInput) => {
  if (!aliasInput || typeof aliasInput !== 'string') {
    return { folder: '', alias: '', fullAlias: '' };
  }

  const trimmed = aliasInput.trim();
  if (!trimmed) {
    return { folder: '', alias: '', fullAlias: '' };
  }

  // Check if it contains a slash (folder/alias format)
  if (trimmed.includes('/')) {
    const parts = trimmed.split('/');
    if (parts.length === 2) {
      const folder = parts[0].trim().toLowerCase();
      const alias = parts[1].trim().toLowerCase();
      return {
        folder,
        alias,
        fullAlias: `${folder}/${alias}`
      };
    }
  }

  // No folder, just alias
  return {
    folder: '',
    alias: trimmed.toLowerCase(),
    fullAlias: trimmed.toLowerCase()
  };
};

/**
 * Validate alias (shortcut name) - lowercase, no spaces, hyphens allowed
 * @param {string} alias - Alias to validate
 * @returns {object} { valid: boolean, error?: string }
 */
export const validateAlias = (alias) => {
  if (!alias || typeof alias !== 'string') {
    return { valid: false, error: 'Alias is required' };
  }

  const trimmed = alias.trim();
  if (!trimmed) {
    return { valid: false, error: 'Alias cannot be empty' };
  }

  if (trimmed.length < 1) {
    return { valid: false, error: 'Alias must be at least 1 character' };
  }

  if (trimmed.length > 50) {
    return { valid: false, error: 'Alias must be max 50 characters' };
  }

  // Only lowercase alphanumeric and hyphens allowed (no spaces, no uppercase)
  const validPattern = /^[a-z0-9\-]+$/;
  if (!validPattern.test(trimmed)) {
    return {
      valid: false,
      error: 'Alias must be lowercase, no spaces, only letters, numbers, and hyphens (-)',
    };
  }

  return { valid: true };
};

/**
 * Validate folder name
 * @param {string} folderName - Folder name to validate
 * @returns {object} { valid: boolean, error?: string }
 */
export const validateFolderName = (folderName) => {
  if (!folderName) {
    // Folder is optional (root is allowed)
    return { valid: true };
  }

  if (typeof folderName !== 'string') {
    return { valid: false, error: 'Folder must be a string' };
  }

  const trimmed = folderName.trim();
  if (!trimmed) {
    // Empty string is treated as root
    return { valid: true };
  }

  if (trimmed.length < 1) {
    return { valid: false, error: 'Folder must be at least 1 character' };
  }

  if (trimmed.length > 30) {
    return { valid: false, error: 'Folder name must be max 30 characters' };
  }

  // Only alphanumeric, hyphens, and underscores allowed
  const validPattern = /^[a-zA-Z0-9\-_]+$/;
  if (!validPattern.test(trimmed)) {
    return {
      valid: false,
      error: 'Folder name can only contain letters, numbers, hyphens (-), and underscores (_)',
    };
  }

  return { valid: true };
};

/**
 * Validate individual tag
 * @param {string} tag - Single tag to validate
 * @returns {object} { valid: boolean, error?: string }
 */
export const validateTag = (tag) => {
  if (!tag || typeof tag !== 'string') {
    return { valid: false, error: 'Tag must be a string' };
  }

  const trimmed = tag.trim();

  // Empty tags are filtered out
  if (!trimmed) {
    return { valid: false, error: 'Tag cannot be empty' };
  }

  if (trimmed.length > 20) {
    return { valid: false, error: 'Each tag must be max 20 characters' };
  }

  // Tags must be lowercase
  if (trimmed !== trimmed.toLowerCase()) {
    return { valid: false, error: 'Tags must be lowercase only' };
  }

  // Only alphanumeric and hyphens allowed for tags
  const validPattern = /^[a-z0-9\-]+$/;
  if (!validPattern.test(trimmed)) {
    return {
      valid: false,
      error: 'Tags can only contain lowercase letters, numbers, and hyphens (-)',
    };
  }

  return { valid: true };
};

/**
 * Validate tags array
 * @param {string|array} tags - Tags (comma-separated string or array)
 * @returns {object} { valid: boolean, tags?: string[], error?: string }
 */
export const validateTags = (tags) => {
  if (!tags) {
    // Tags are optional
    return { valid: true, tags: [] };
  }

  let tagArray;

  // Handle both string and array input
  if (typeof tags === 'string') {
    const trimmed = tags.trim();
    if (!trimmed) {
      return { valid: true, tags: [] };
    }
    tagArray = tags.split(',').map((t) => t.trim());
  } else if (Array.isArray(tags)) {
    tagArray = tags.map((t) => String(t).trim());
  } else {
    return { valid: false, error: 'Tags must be a comma-separated string or array' };
  }

  // Filter out empty strings
  tagArray = tagArray.filter((t) => t.length > 0);

  if (tagArray.length > 0 && tagArray.length > 20) {
    return { valid: false, error: 'Maximum 20 tags allowed' };
  }

  // Validate each tag
  for (const tag of tagArray) {
    const validation = validateTag(tag);
    if (!validation.valid) {
      return validation;
    }
  }

  // Remove duplicates and sort for consistency
  const uniqueTags = [...new Set(tagArray)].sort();

  return { valid: true, tags: uniqueTags };
};

/**
 * Validate full alias (folder/alias combination)
 * @param {string} folder - Folder name (optional)
 * @param {string} alias - Alias name
 * @returns {object} { valid: boolean, fullAlias?: string, error?: string }
 */
export const validateFullAlias = (folder, alias) => {
  const folderValidation = validateFolderName(folder);
  if (!folderValidation.valid) {
    return folderValidation;
  }

  const aliasValidation = validateAlias(alias);
  if (!aliasValidation.valid) {
    return aliasValidation;
  }

  const folderPart = folder && folder.trim() ? folder.trim() : '';
  const aliasPart = alias.trim();
  const fullAlias = folderPart ? `${folderPart}/${aliasPart}` : aliasPart;

  return { valid: true, fullAlias };
};

/**
 * Validate complete shortcut object
 * @param {object} shortcut - Shortcut data
 * @returns {object} { valid: boolean, errors?: object }
 */
export const validateShortcut = (shortcut) => {
  const errors = {};

  if (!shortcut || typeof shortcut !== 'object') {
    return { valid: false, errors: { general: 'Invalid shortcut data' } };
  }

  // Validate URL
  const urlValidation = validateUrl(shortcut.url);
  if (!urlValidation.valid) {
    errors.url = urlValidation.error;
  }

  // Validate Alias
  const aliasValidation = validateAlias(shortcut.alias);
  if (!aliasValidation.valid) {
    errors.alias = aliasValidation.error;
  }

  // Validate Folder
  const folderValidation = validateFolderName(shortcut.folder);
  if (!folderValidation.valid) {
    errors.folder = folderValidation.error;
  }

  // Validate Tags
  const tagsValidation = validateTags(shortcut.tags);
  if (!tagsValidation.valid) {
    errors.tags = tagsValidation.error;
  }

  const isValid = Object.keys(errors).length === 0;

  return {
    valid: isValid,
    ...(isValid && { tags: tagsValidation.tags }),
    ...(Object.keys(errors).length > 0 && { errors }),
  };
};

/**
 * Check if alias is valid (basic check without database)
 * @param {string} alias - Alias to check
 * @returns {boolean}
 */
export const isValidAlias = (alias) => {
  const validation = validateAlias(alias);
  return validation.valid;
};

/**
 * Check if URL is valid
 * @param {string} url - URL to check
 * @returns {boolean}
 */
export const isValidUrl = (url) => {
  const validation = validateUrl(url);
  return validation.valid;
};

/**
 * Normalize tags (lowercase, trim, remove duplicates)
 * @param {string|array} tags - Tags to normalize
 * @returns {string[]} Normalized tags array
 */
export const normalizeTags = (tags) => {
  const validation = validateTags(tags);
  return validation.tags || [];
};

/**
 * Normalize folder name (lowercase, trim)
 * @param {string} folder - Folder to normalize
 * @returns {string} Normalized folder name
 */
export const normalizeFolder = (folder) => {
  if (!folder) return '';
  const trimmed = String(folder).trim();
  return trimmed.toLowerCase();
};

/**
 * Normalize alias (trim, but preserve case)
 * @param {string} alias - Alias to normalize
 * @returns {string} Normalized alias
 */
export const normalizeAlias = (alias) => {
  if (!alias) return '';
  return String(alias).trim();
};

/**
 * Check case-insensitive equality for aliases/folders
 * Used for uniqueness checking
 * @param {string} a - First string
 * @param {string} b - Second string
 * @returns {boolean} True if case-insensitive equal
 */
export const caseInsensitiveEqual = (a, b) => {
  const normalizedA = String(a || '').trim().toLowerCase();
  const normalizedB = String(b || '').trim().toLowerCase();
  return normalizedA === normalizedB;
};
