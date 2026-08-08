/**
 * ============================================================================
 * FILE PURPOSE: Problem Mongoose Model & Schema Definition
 * LOCATION: backend/models/Problem.js
 * 
 * MONGODB CONCEPT IMPLEMENTATION MATRIX:
 * ----------------------------------------------------------------------------
 * 1. CRUD Operations:
 *    - Central document model consumed by POST /problems, GET /problems, GET /problems/:id, PUT /problems/:id, DELETE /problems/:id.
 * 
 * 2. Schema Modeling:
 *    - Core Problem schema defining field types, enum constraints ('Easy'/'Medium'/'Hard', 'Solved'/'Revise Later'/'Important'), defaults, and timestamps.
 * 
 * 3. Embedding vs Referencing Relationships:
 *    - REFERENCING: `topic` references `Topic` model via mongoose.Schema.Types.ObjectId (1-to-Many normalized relationship).
 *    - EMBEDDING: `notes` embeds `noteEntrySchema` array (1-to-Few bounded sub-document history containing content, confidence, createdAt).
 * 
 * 4. Indexing for Query Performance:
 *    - Single-field indexes: `difficulty: 1`, `status: 1`, `topic: 1`, `dateSolved: -1`.
 *    - Compound index: `{ status: 1, difficulty: 1 }` for multi-attribute filter queries.
 *    - Full-text search index: `{ title: 'text', 'notes.content': 'text' }` for $text search queries.
 * 
 * 5. Aggregation Pipelines:
 *    - Primary source collection for MongoDB aggregation pipelines ($group, $lookup, $unwind, $project, $cond, $dateToString).
 * ============================================================================
 */

const mongoose = require('mongoose');

// Embedded sub-schema: revision/attempt history.
// Embedded because it's small, bounded, and always read together with its parent problem.
const noteEntrySchema = new mongoose.Schema({
  content: { 
    type: String, 
    required: true 
  },
  confidence: { 
    type: String, 
    enum: ['Low', 'Medium', 'High'], 
    default: 'Medium' 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
}, { _id: false });

const problemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  topic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic',
    required: true,
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true,
  },
  platform: {
    type: String,
    trim: true,
  },
  problemUrl: {
    type: String,
    trim: true,
  },
  dateSolved: {
    type: Date,
    default: Date.now,
  },
  notes: [noteEntrySchema],
  screenshot: {
    type: String,
  },
  status: {
    type: String,
    enum: ['Solved', 'Revise Later', 'Important'],
    default: 'Solved',
  },
}, { timestamps: true });

// Single-field indexes — support direct filters used in GET /problems
problemSchema.index({ difficulty: 1 });
problemSchema.index({ status: 1 });
problemSchema.index({ topic: 1 });

// Supports the default sort in GET /problems (sort by dateSolved desc)
problemSchema.index({ dateSolved: -1 });

// Compound index — supports the common combined filter: same status + difficulty together
problemSchema.index({ status: 1, difficulty: 1 });

// Text index — supports free-text search across title and notes ($text queries)
problemSchema.index({ title: 'text', 'notes.content': 'text' });

module.exports = mongoose.model('Problem', problemSchema);
