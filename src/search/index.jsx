import React from 'react';
import ReactDOM from 'react-dom/client';
import SearchPopup from '../components/SearchPopup/SearchPopup';
import '../styles/global.css';

console.log('Search index.jsx loaded');

ReactDOM.createRoot(document.getElementById('search-root')).render(
  <React.StrictMode>
    <SearchPopup />
  </React.StrictMode>
);
