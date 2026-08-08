/**
 * ============================================================================
 * FILE PURPOSE: Responsive Grid List Container Component for Problem Cards
 * LOCATION: frontend/src/components/ProblemList.jsx
 * 
 * MONGODB CONCEPT CONSUMPTION MATRIX:
 * ----------------------------------------------------------------------------
 * 1. CRUD Operations:
 *    - Renders array of problem documents fetched via GET /problems. Passes down onEdit and onDelete handlers.
 * 
 * 2. Schema Modeling:
 *    - Iterates over array of Problem schema documents.
 * 
 * 3. Embedding vs Referencing Relationships:
 *    - Passes problem objects containing populated `topic` refs and embedded `notes` array to `<ProblemCard />`.
 * 
 * 4. Indexing for Query Performance:
 *    - Displays pre-sorted, indexed problem lists efficiently.
 * 
 * 5. Aggregation Pipelines:
 *    - Displays individual problem records complementary to the aggregated summary metrics.
 * ============================================================================
 */

import React from 'react';
import ProblemCard from './ProblemCard';

const ProblemList = ({ problems, onEdit, onDelete, apiUrl }) => {
  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
      gap: '2rem' 
    }}>
      {problems.map(problem => (
        <ProblemCard 
          key={problem._id} 
          problem={problem} 
          onEdit={onEdit} 
          onDelete={onDelete} 
          apiUrl={apiUrl}
        />
      ))}
    </div>
  );
};

export default ProblemList;
