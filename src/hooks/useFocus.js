/**
 * useFocus Hook
 * Focus management utilities for modals, forms, and keyboard navigation
 */

import { useEffect, useRef, useCallback } from 'react';

/**
 * useFocus Hook
 * @param {object} config - Configuration object
 * @param {boolean} config.autoFocus - Whether to auto-focus on mount
 * @param {boolean} config.restoreFocus - Whether to restore focus on unmount
 * @param {boolean} config.trapFocus - Whether to trap focus within container
 * @param {string} config.initialFocus - Selector for initial focus element
 * @returns {object} Focus management utilities
 */
export function useFocus({
  autoFocus = true,
  restoreFocus = true,
  trapFocus = false,
  initialFocus = null,
} = {}) {
  const containerRef = useRef(null);
  const previousActiveElementRef = useRef(null);
  const focusableElementsRef = useRef([]);
  
  /**
   * Get all focusable elements within container
   */
  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return [];
    
    const focusableSelectors = [
      'input:not([disabled]):not([readonly])',
      'button:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled]):not([readonly])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
    ].join(', ');
    
    return Array.from(containerRef.current.querySelectorAll(focusableSelectors));
  }, []);
  
  /**
   * Focus first focusable element
   */
  const focusFirst = useCallback(() => {
    const elements = getFocusableElements();
    if (elements.length > 0) {
      elements[0].focus();
      return true;
    }
    return false;
  }, [getFocusableElements]);
  
  /**
   * Focus last focusable element
   */
  const focusLast = useCallback(() => {
    const elements = getFocusableElements();
    if (elements.length > 0) {
      elements[elements.length - 1].focus();
      return true;
    }
    return false;
  }, [getFocusableElements]);
  
  /**
   * Focus next focusable element
   */
  const focusNext = useCallback(() => {
    const elements = getFocusableElements();
    const activeElement = document.activeElement;
    const currentIndex = elements.indexOf(activeElement);
    
    if (currentIndex !== -1 && currentIndex < elements.length - 1) {
      elements[currentIndex + 1].focus();
      return true;
    } else if (elements.length > 0) {
      elements[0].focus(); // Wrap to first
      return true;
    }
    return false;
  }, [getFocusableElements]);
  
  /**
   * Focus previous focusable element
   */
  const focusPrevious = useCallback(() => {
    const elements = getFocusableElements();
    const activeElement = document.activeElement;
    const currentIndex = elements.indexOf(activeElement);
    
    if (currentIndex > 0) {
      elements[currentIndex - 1].focus();
      return true;
    } else if (elements.length > 0) {
      elements[elements.length - 1].focus(); // Wrap to last
      return true;
    }
    return false;
  }, [getFocusableElements]);
  
  /**
   * Focus specific element by selector
   */
  const focusElement = useCallback((selector) => {
    if (!containerRef.current) return false;
    
    const element = containerRef.current.querySelector(selector);
    if (element) {
      element.focus();
      return true;
    }
    return false;
  }, []);
  
  /**
   * Focus element by index
   */
  const focusByIndex = useCallback((index) => {
    const elements = getFocusableElements();
    if (elements[index]) {
      elements[index].focus();
      return true;
    }
    return false;
  }, [getFocusableElements]);
  
  /**
   * Handle focus trap for keyboard navigation
   */
  const handleFocusTrap = useCallback((event) => {
    if (!trapFocus || !containerRef.current) return;
    
    const elements = getFocusableElements();
    if (elements.length === 0) return;
    
    const firstElement = elements[0];
    const lastElement = elements[elements.length - 1];
    
    if (event.key === 'Tab') {
      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    }
  }, [trapFocus, getFocusableElements]);
  
  /**
   * Set up focus management
   */
  useEffect(() => {
    // Store previous active element
    if (restoreFocus) {
      previousActiveElementRef.current = document.activeElement;
    }
    
    // Set up focus trap
    if (trapFocus && containerRef.current) {
      containerRef.current.addEventListener('keydown', handleFocusTrap);
    }
    
    // Auto-focus on mount
    if (autoFocus) {
      const timer = setTimeout(() => {
        if (initialFocus) {
          focusElement(initialFocus);
        } else {
          focusFirst();
        }
      }, 0);
      
      return () => clearTimeout(timer);
    }
    
    return () => {
      if (trapFocus && containerRef.current) {
        containerRef.current.removeEventListener('keydown', handleFocusTrap);
      }
    };
  }, [autoFocus, restoreFocus, trapFocus, initialFocus, focusElement, focusFirst, handleFocusTrap]);
  
  /**
   * Restore focus on unmount
   */
  useEffect(() => {
    return () => {
      if (restoreFocus && previousActiveElementRef.current) {
        // Use setTimeout to ensure the element is still in the DOM
        setTimeout(() => {
          if (previousActiveElementRef.current && 
              document.contains(previousActiveElementRef.current)) {
            previousActiveElementRef.current.focus();
          }
        }, 0);
      }
    };
  }, [restoreFocus]);
  
  return {
    // Refs
    containerRef,
    
    // Focus utilities
    focusFirst,
    focusLast,
    focusNext,
    focusPrevious,
    focusElement,
    focusByIndex,
    
    // Element utilities
    getFocusableElements,
    
    // State
    isFocused: () => {
      return containerRef.current && containerRef.current.contains(document.activeElement);
    },
    
    // Focus management
    setContainer: (container) => {
      containerRef.current = container;
    },
  };
}

/**
 * Hook for modal focus management
 */
export function useModalFocus(initialFocus = null) {
  return useFocus({
    autoFocus: true,
    restoreFocus: true,
    trapFocus: true,
    initialFocus,
  });
}

/**
 * Hook for form focus management
 */
export function useFormFocus() {
  return useFocus({
    autoFocus: true,
    restoreFocus: false,
    trapFocus: false,
    initialFocus: 'input:not([disabled]):not([readonly]), textarea:not([disabled]):not([readonly])',
  });
}

/**
 * Hook for search overlay focus management
 */
export function useSearchFocus() {
  return useFocus({
    autoFocus: true,
    restoreFocus: false,
    trapFocus: true,
    initialFocus: 'input[type="text"]',
  });
}

export default useFocus;
