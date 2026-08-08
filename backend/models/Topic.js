/**
 * ============================================================================
 * FILE PURPOSE: Topic Mongoose Model Definition
 * LOCATION: backend/models/Topic.js
 * 
 * MONGODB CONCEPT IMPLEMENTATION MATRIX:
 * ----------------------------------------------------------------------------
 * 1. CRUD Operations:
 *    - Model consumed by server routes (GET /topics, POST /topics) for Topic management.
 * 
 * 2. Schema Modeling:
 *    - Standalone Topic schema with strict validation rules (required, unique name, trim).
 *    - Configured with automatic timestamps ({ timestamps: true }).
 * 
 * 3. Embedding vs Referencing Relationships:
 *    - Implements the REFERENCED entity in the 1-to-Many (Topic -> Problems) relationship.
 *    - Referenced via ObjectId by Problem.topic to normalize topic data and avoid duplication.
 * 
 * 4. Indexing for Query Performance:
 *    - Unique constraint index on `name` ({ unique: true }) enforcing data integrity at the database engine level.
 * 
 * 5. Aggregation Pipelines:
 *    - Joined in the `/stats/topic-progress` pipeline via $lookup stage from `topics` collection.
 * ============================================================================
 */

const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true, // e.g. "Dynamic Programming", "Graphs", "Two Pointers"
  },
  description: {
    type: String,
    trim: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Topic', topicSchema);
