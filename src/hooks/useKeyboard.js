/**
 * useKeyboard Hook
 * Comprehensive keyboard shortcut management for the URL Shortcuts extension
 * Handles global shortcuts, context shortcuts, and focus management
 */

import { useEffect, useRef, useCallback } from 'react';

/**
 * Keyboard shortcut configuration
 */
const KEYBOARD_SHORTCUTS = {
  // Global shortcuts (work everywhere)
  GLOBAL: {
    OPEN_SEARCH: 'Cmd+Shift+O',
    OPEN_DASHBOARD: 'Cmd+Shift+D',
    OPEN_POPUP: 'Cmd+Shift+P',
  },
  
  // Context shortcuts (work in specific contexts)
  CONTEXT: {
    // Search overlay shortcuts
    SEARCH: {
      CLOSE: 'Escape',
      OPEN_SELECTED: 'Enter',
      OPEN_NEW_TAB: 'Cmd+Enter',
      OPEN_NEW_WINDOW: 'Cmd+Shift+Enter',
      COPY_URL: 'c',
      EDIT: 'e',
      DELETE: 'd',
      NAVIGATE_UP: 'ArrowUp',
      NAVIGATE_DOWN: 'ArrowDown',
      NAVIGATE_FIRST: 'Home',
      NAVIGATE_LAST: 'End',
    },
    
    // Dashboard shortcuts
    DASHBOARD: {
      NEW_SHORTCUT: 'n',
      NEW_FOLDER: 'f',
      SEARCH: '/',
      REFRESH: 'r',
      EXPORT: 'Cmd+e',
      IMPORT: 'Cmd+i',
      SETTINGS: 'Cmd+,',
    },
    
    // Form shortcuts
    FORM: {
      SAVE: 'Cmd+Enter',
      CANCEL: 'Escape',
      NEXT_FIELD: 'Tab',
      PREV_FIELD: 'Shift+Tab',
    },
  },
};

/**
 * Parse keyboard shortcut string into normalized format
 * @param {string} shortcut - Shortcut string (e.g., "Cmd+Shift+O")
 * @returns {object} Parsed shortcut with key, modifiers, and normalized format
 */
function parseShortcut(shortcut) {
  const parts = shortcut.split('+').map(part => part.trim());
  const modifiers = {
    ctrl: false,
    alt: false,
    shift: false,
    meta: false, // Cmd on Mac, Ctrl on Windows/Linux
  };
  
  let key = parts[parts.length - 1].toLowerCase();
  
  // Handle special keys
  const specialKeys = {
    'arrowup': 'ArrowUp',
    'arrowdown': 'ArrowDown',
    'arrowleft': 'ArrowLeft',
    'arrowright': 'ArrowRight',
    'enter': 'Enter',
    'escape': 'Escape',
    'tab': 'Tab',
    'space': ' ',
    'home': 'Home',
    'end': 'End',
    'pageup': 'PageUp',
    'pagedown': 'PageDown',
  };
  
  if (specialKeys[key]) {
    key = specialKeys[key];
  }
  
  // Parse modifiers
  for (let i = 0; i < parts.length - 1; i++) {
    const modifier = parts[i].toLowerCase();
    switch (modifier) {
      case 'cmd':
      case 'meta':
        modifiers.meta = true;
        break;
      case 'ctrl':
        modifiers.ctrl = true;
        break;
      case 'alt':
        modifiers.alt = true;
        break;
      case 'shift':
        modifiers.shift = true;
        break;
    }
  }
  
  return {
    key,
    modifiers,
    original: shortcut,
    normalized: `${modifiers.meta ? 'Meta+' : ''}${modifiers.ctrl ? 'Ctrl+' : ''}${modifiers.alt ? 'Alt+' : ''}${modifiers.shift ? 'Shift+' : ''}${key}`,
  };
}

/**
 * Check if a keyboard event matches a shortcut
 * @param {KeyboardEvent} event - Keyboard event
 * @param {object} shortcut - Parsed shortcut object
 * @returns {boolean} True if event matches shortcut
 */
function matchesShortcut(event, shortcut) {
  const eventKey = event.key.toLowerCase();
  const shortcutKey = shortcut.key.toLowerCase();
  
  // Check key match
  if (eventKey !== shortcutKey) {
    return false;
  }
  
  // Check modifiers match
  return (
    event.metaKey === shortcut.modifiers.meta &&
    event.ctrlKey === shortcut.modifiers.ctrl &&
    event.altKey === shortcut.modifiers.alt &&
    event.shiftKey === shortcut.modifiers.shift
  );
}

/**
 * useKeyboard Hook
 * @param {object} config - Configuration object
 * @param {object} config.shortcuts - Shortcut definitions
 * @param {string} config.context - Current context (SEARCH, DASHBOARD, FORM, etc.)
 * @param {boolean} config.enabled - Whether shortcuts are enabled
 * @param {function} config.onShortcut - Callback for shortcut events
 * @param {object} config.focus - Focus management configuration
 * @returns {object} Keyboard management utilities
 */
export function useKeyboard({
  shortcuts = {},
  context = 'GLOBAL',
  enabled = true,
  onShortcut = () => {},
  focus = {}
} = {}) {
  const shortcutsRef = useRef({});
  const focusRef = useRef(focus);
  const contextRef = useRef(context);
  const enabledRef = useRef(enabled);
  
  // Update refs when props change
  useEffect(() => {
    shortcutsRef.current = shortcuts;
    focusRef.current = focus;
    contextRef.current = context;
    enabledRef.current = enabled;
  }, [shortcuts, focus, context, enabled]);
  
  /**
   * Handle keyboard events
   */
  const handleKeyDown = useCallback((event) => {
    if (!enabledRef.current) return;
    
    const currentShortcuts = shortcutsRef.current;
    const currentContext = contextRef.current;
    
    // Check global shortcuts first
    if (currentContext !== 'GLOBAL') {
      const globalShortcuts = KEYBOARD_SHORTCUTS.GLOBAL;
      for (const [name, shortcutString] of Object.entries(globalShortcuts)) {
        const parsedShortcut = parseShortcut(shortcutString);
        if (matchesShortcut(event, parsedShortcut)) {
          event.preventDefault();
          onShortcut(name, 'GLOBAL', event);
          return;
        }
      }
    }
    
    // Check context-specific shortcuts
    if (currentContext !== 'GLOBAL' && KEYBOARD_SHORTCUTS.CONTEXT[currentContext]) {
      const contextShortcuts = KEYBOARD_SHORTCUTS.CONTEXT[currentContext];
      for (const [name, shortcutString] of Object.entries(contextShortcuts)) {
        const parsedShortcut = parseShortcut(shortcutString);
        if (matchesShortcut(event, parsedShortcut)) {
          event.preventDefault();
          onShortcut(name, currentContext, event);
          return;
        }
      }
    }
    
    // Check custom shortcuts
    for (const [name, shortcutString] of Object.entries(currentShortcuts)) {
      const parsedShortcut = parseShortcut(shortcutString);
      if (matchesShortcut(event, parsedShortcut)) {
        event.preventDefault();
        onShortcut(name, currentContext, event);
        return;
      }
    }
  }, [onShortcut]);
  
  /**
   * Focus management utilities
   */
  const focusUtils = {
    /**
     * Focus first focusable element
     */
    focusFirst: useCallback(() => {
      const { container } = focusRef.current;
      if (!container) return;
      
      const focusableElements = container.querySelectorAll(
        'input, button, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    }, []),
    
    /**
     * Focus last focusable element
     */
    focusLast: useCallback(() => {
      const { container } = focusRef.current;
      if (!container) return;
      
      const focusableElements = container.querySelectorAll(
        'input, button, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements.length > 0) {
        focusableElements[focusableElements.length - 1].focus();
      }
    }, []),
    
    /**
     * Focus next focusable element
     */
    focusNext: useCallback(() => {
      const { container } = focusRef.current;
      if (!container) return;
      
      const focusableElements = Array.from(container.querySelectorAll(
        'input, button, select, textarea, [tabindex]:not([tabindex="-1"])'
      ));
      
      const activeElement = document.activeElement;
      const currentIndex = focusableElements.indexOf(activeElement);
      
      if (currentIndex !== -1 && currentIndex < focusableElements.length - 1) {
        focusableElements[currentIndex + 1].focus();
      } else if (focusableElements.length > 0) {
        focusableElements[0].focus(); // Wrap to first
      }
    }, []),
    
    /**
     * Focus previous focusable element
     */
    focusPrevious: useCallback(() => {
      const { container } = focusRef.current;
      if (!container) return;
      
      const focusableElements = Array.from(container.querySelectorAll(
        'input, button, select, textarea, [tabindex]:not([tabindex="-1"])'
      ));
      
      const activeElement = document.activeElement;
      const currentIndex = focusableElements.indexOf(activeElement);
      
      if (currentIndex > 0) {
        focusableElements[currentIndex - 1].focus();
      } else if (focusableElements.length > 0) {
        focusableElements[focusableElements.length - 1].focus(); // Wrap to last
      }
    }, []),
    
    /**
     * Trap focus within container
     */
    trapFocus: useCallback((event) => {
      const { container } = focusRef.current;
      if (!container) return;
      
      const focusableElements = Array.from(container.querySelectorAll(
        'input, button, select, textarea, [tabindex]:not([tabindex="-1"])'
      ));
      
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      
      if (event.key === 'Tab') {
        if (event.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement?.focus();
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement?.focus();
          }
        }
      }
    }, []),
  };
  
  /**
   * Set up keyboard event listeners
   */
  useEffect(() => {
    if (!enabled) return;
    
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown, enabled]);
  
  /**
   * Set up focus trap for modals
   */
  useEffect(() => {
    if (!focus.trapFocus || !focus.container) return;
    
    const container = focus.container;
    container.addEventListener('keydown', focusUtils.trapFocus);
    
    return () => {
      container.removeEventListener('keydown', focusUtils.trapFocus);
    };
  }, [focus.trapFocus, focus.container, focusUtils.trapFocus]);
  
  return {
    // Shortcut utilities
    parseShortcut,
    matchesShortcut,
    
    // Focus utilities
    focus: focusUtils,
    
    // Context management
    setContext: (newContext) => {
      contextRef.current = newContext;
    },
    
    // Enable/disable shortcuts
    setEnabled: (newEnabled) => {
      enabledRef.current = newEnabled;
    },
    
    // Get available shortcuts for current context
    getAvailableShortcuts: () => {
      const currentContext = contextRef.current;
      const shortcuts = { ...KEYBOARD_SHORTCUTS.GLOBAL };
      
      if (currentContext !== 'GLOBAL' && KEYBOARD_SHORTCUTS.CONTEXT[currentContext]) {
        Object.assign(shortcuts, KEYBOARD_SHORTCUTS.CONTEXT[currentContext]);
      }
      
      return shortcuts;
    },
  };
}

/**
 * Hook for managing keyboard shortcuts in search overlay
 */
export function useSearchKeyboard(onShortcut) {
  return useKeyboard({
    context: 'SEARCH',
    onShortcut,
    focus: {
      container: null, // Will be set by component
    },
  });
}

/**
 * Hook for managing keyboard shortcuts in dashboard
 */
export function useDashboardKeyboard(onShortcut) {
  return useKeyboard({
    context: 'DASHBOARD',
    onShortcut,
    focus: {
      container: null, // Will be set by component
    },
  });
}

/**
 * Hook for managing keyboard shortcuts in forms
 */
export function useFormKeyboard(onShortcut) {
  return useKeyboard({
    context: 'FORM',
    onShortcut,
    focus: {
      container: null, // Will be set by component
      trapFocus: true,
    },
  });
}

export default useKeyboard;
