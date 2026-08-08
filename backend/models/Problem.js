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

module.exports = mongoose.model('Problem', problemSchema);
