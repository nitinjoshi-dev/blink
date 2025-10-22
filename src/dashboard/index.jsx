/**
 * Dashboard Entry Point
 * Main entry for the full-screen dashboard interface
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import Dashboard from '../components/Dashboard/Dashboard';
import '../styles/global.css';

console.log('Dashboard index.jsx loaded');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Dashboard />
  </React.StrictMode>
);
