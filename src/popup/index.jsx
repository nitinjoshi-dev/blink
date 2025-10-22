import React from 'react';
import ReactDOM from 'react-dom/client';
import PluginPopup from '../components/PluginPopup/PluginPopup';
import '../styles/global.css';

console.log('Popup index.jsx loaded');

const rootElement = document.getElementById('popup-root');
console.log('Root element:', rootElement);

if (!rootElement) {
  console.error('popup-root element not found!');
  document.body.innerHTML = '<div style="color: #ef4444; padding: 20px;">Error: Root element not found</div>';
} else {
  try {
    console.log('Creating React root...');
    const root = ReactDOM.createRoot(rootElement);
    console.log('React root created, rendering component...');
    root.render(
      <React.StrictMode>
        <PluginPopup />
      </React.StrictMode>
    );
    console.log('Component rendered successfully');
  } catch (error) {
    console.error('Error rendering component:', error);
    rootElement.innerHTML = `<div style="color: #ef4444; padding: 20px; white-space: pre-wrap;">Error: ${error.message}</div>`;
  }
}
