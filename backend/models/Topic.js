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

// Constraint-enforcing index — unique topic name
topicSchema.index({ name: 1 }, { unique: true });

module.exports = mongoose.model('Topic', topicSchema);
