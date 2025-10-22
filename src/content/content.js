/**
 * Content Script for URL Shortcuts
 * Runs on all web pages to:
 * - Extract page information
 * - Handle special keyboard interactions
 */

// Listen for messages from background/popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GET_PAGE_INFO') {
    const pageInfo = {
      url: window.location.href,
      title: document.title,
    };
    sendResponse(pageInfo);
  }
});

console.log('Content script loaded for', window.location.hostname);
