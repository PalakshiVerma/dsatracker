/**
 * ============================================================================
 * FILE PURPOSE: React Application DOM Mounting Entry Point
 * LOCATION: frontend/src/main.jsx
 * 
 * MONGODB CONCEPT CONSUMPTION MATRIX:
 * ----------------------------------------------------------------------------
 * 1. CRUD Operations:
 *    - Bootstraps the root App component that initiates API requests for CRUD operations.
 * 
 * 2. Schema Modeling:
 *    - Renders the global React application frame that displays Mongoose schema entities.
 * 
 * 3. Embedding vs Referencing Relationships:
 *    - Provides the application root context for rendering referenced topics & embedded revision notes.
 * 
 * 4. Indexing for Query Performance:
 *    - Mounts the client application that consumes fast indexed query responses from the backend.
 * 
 * 5. Aggregation Pipelines:
 *    - Initializes the application hosting the Analytics Dashboard view powered by aggregation statistics.
 * ============================================================================
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
