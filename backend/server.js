/**
 * ============================================================================
 * FILE PURPOSE: Express API Server & Database Controller Entry Point
 * LOCATION: backend/server.js
 * 
 * MONGODB CONCEPT IMPLEMENTATION MATRIX:
 * ----------------------------------------------------------------------------
 * 1. CRUD Operations:
 *    - POST /problems (Create problem)
 *    - GET /problems (Read all problems with server-side filtering & pagination)
 *    - GET /problems/:id (Read single problem by ID)
 *    - PUT /problems/:id (Update problem with `runValidators: true` & `returnDocument: 'after'`)
 *    - DELETE /problems/:id (Delete problem by ID)
 *    - GET /topics & POST /topics (Topic CRUD operations)
 * 
 * 2. Schema Modeling:
 *    - Enforces Problem and Topic schema constraints across all API endpoints.
 * 
 * 3. Embedding vs Referencing Relationships:
 *    - Executes `.populate('topic', 'name')` to hydrate referenced Topic ObjectIds on Problem queries.
 *    - Manages creation and appending of embedded `notes` array entries with confidence levels.
 * 
 * 4. Indexing for Query Performance:
 *    - Executes `.find(filter)` queries utilizing single-field, compound, and text indexes.
 *    - Uses `$text: { $search: search }` for indexed full-text searching.
 * 
 * 5. Aggregation Pipelines:
 *    - GET /stats/summary: Uses $group and $sort for difficulty & status breakdown.
 *    - GET /stats/topic-progress: Uses $group, $cond, $lookup, $unwind, $project, $sort to calculate topic progress.
 *    - GET /stats/timeline: Uses $dateToString, $group, $sort to calculate monthly activity trends.
 * ============================================================================
 */

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Problem = require('./models/Problem');
const Topic = require('./models/Topic');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dsa_tracker')
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Multer Storage for Screenshots
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage });

// Helper function to resolve topic ObjectId or topic name string
async function resolveTopicId(topicInput) {
  if (!topicInput) {
    let defaultTopic = await Topic.findOne({ name: 'General' });
    if (!defaultTopic) {
      defaultTopic = await Topic.create({ name: 'General', description: 'General DSA Topic' });
    }
    return defaultTopic._id;
  }

  if (mongoose.Types.ObjectId.isValid(topicInput)) {
    const existing = await Topic.findById(topicInput);
    if (existing) return existing._id;
  }

  const topicName = String(topicInput).trim();
  const topicDoc = await Topic.findOneAndUpdate(
    { name: topicName },
    { name: topicName, description: `${topicName} Topic` },
    { upsert: true, returnDocument: 'after' }
  );
  return topicDoc._id;
}

// Helper to format notes into array entries
function formatNotes(notesInput, confidenceInput) {
  if (!notesInput) return [];
  if (Array.isArray(notesInput)) return notesInput;
  if (typeof notesInput === 'string') {
    try {
      const parsed = JSON.parse(notesInput);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {
      // String note
    }
    if (notesInput.trim()) {
      return [{
        content: notesInput.trim(),
        confidence: confidenceInput || 'Medium',
        createdAt: new Date(),
      }];
    }
  }
  return [];
}

// Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend is running' });
});

// Topic Routes
app.get('/topics', async (req, res) => {
  try {
    const topics = await Topic.find().sort({ name: 1 });
    res.json(topics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/topics', async (req, res) => {
  try {
    const topic = await Topic.create(req.body);
    res.status(201).json(topic);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Create problem
app.post('/problems', upload.single('screenshot'), async (req, res) => {
  try {
    const rawTopic = req.body.topic || req.body.type;
    const topicId = await resolveTopicId(rawTopic);
    const notesArray = formatNotes(req.body.notes, req.body.confidence);

    const problemData = {
      ...req.body,
      topic: topicId,
      notes: notesArray,
      screenshot: req.file ? `/uploads/${req.file.filename}` : null,
    };
    delete problemData.type;

    const problem = new Problem(problemData);
    await problem.save();
    const populated = await problem.populate('topic', 'name');
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Read single problem
app.get('/problems/:id', async (req, res) => {
  try {
    let query = Problem.findById(req.params.id);
    if (Problem.schema.path('topic')) {
      query = query.populate('topic', 'name');
    }
    const problem = await query;
    if (!problem) return res.status(404).json({ error: 'Problem not found' });
    res.json(problem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Read all problems (supports server-side filtering, search, and pagination)
app.get('/problems', async (req, res) => {
  try {
    const { difficulty, status, topic, type, search, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (difficulty) filter.difficulty = difficulty;
    if (status) filter.status = status;
    
    if (topic) {
      if (mongoose.Types.ObjectId.isValid(topic)) {
        filter.topic = topic;
      } else {
        const foundTopic = await Topic.findOne({ name: new RegExp(`^${topic}$`, 'i') });
        if (foundTopic) filter.topic = foundTopic._id;
      }
    }

    if (search) {
      const hasTextIndex = Problem.schema.indexes().some(idx => idx[0] && Object.values(idx[0]).includes('text'));
      if (hasTextIndex) {
        filter.$text = { $search: search };
      } else {
        filter.$or = [
          { title: { $regex: search, $options: 'i' } }
        ];
      }
    }

    let query = Problem.find(filter);
    if (Problem.schema.path('topic')) {
      query = query.populate('topic', 'name');
    }

    const pageNum = Number(page);
    const limitNum = Number(limit);

    const problems = await query
      .sort({ dateSolved: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    const total = await Problem.countDocuments(filter);
    res.json({
      data: problems,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update problem
app.put('/problems/:id', upload.single('screenshot'), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    
    if (req.file) {
      updateData.screenshot = `/uploads/${req.file.filename}`;
      
      const oldProblem = await Problem.findById(id);
      if (oldProblem && oldProblem.screenshot) {
        const oldPath = path.join(__dirname, oldProblem.screenshot);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
    }

    if (updateData.topic || updateData.type) {
      updateData.topic = await resolveTopicId(updateData.topic || updateData.type);
      delete updateData.type;
    }

    // If new note content is provided in update, append to notes array
    if (updateData.newNoteContent) {
      const existingProblem = await Problem.findById(id);
      const existingNotes = existingProblem ? existingProblem.notes : [];
      updateData.notes = [
        ...existingNotes,
        {
          content: updateData.newNoteContent.trim(),
          confidence: updateData.confidence || 'Medium',
          createdAt: new Date(),
        }
      ];
      delete updateData.newNoteContent;
    } else if (typeof updateData.notes === 'string') {
      updateData.notes = formatNotes(updateData.notes, updateData.confidence);
    }

    const problem = await Problem.findByIdAndUpdate(
      id,
      updateData,
      { returnDocument: 'after', runValidators: true }
    ).populate('topic', 'name');

    if (!problem) return res.status(404).json({ error: 'Problem not found' });
    res.json(problem);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete problem
app.delete('/problems/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const problem = await Problem.findById(id);
    
    if (problem && problem.screenshot) {
      const filePath = path.join(__dirname, problem.screenshot);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await Problem.findByIdAndDelete(id);
    res.json({ message: 'Problem deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Aggregation Routes for Analytics Dashboard

// 1. Counts grouped by difficulty and status
app.get('/stats/summary', async (req, res) => {
  try {
    const byDifficulty = await Problem.aggregate([
      { $group: { _id: '$difficulty', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const byStatus = await Problem.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    res.json({ byDifficulty, byStatus });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Progress per topic joined with Topic collection
app.get('/stats/topic-progress', async (req, res) => {
  try {
    const progress = await Problem.aggregate([
      { $group: {
          _id: '$topic',
          totalSolved: { $sum: 1 },
          easy: { $sum: { $cond: [{ $eq: ['$difficulty', 'Easy'] }, 1, 0] } },
          medium: { $sum: { $cond: [{ $eq: ['$difficulty', 'Medium'] }, 1, 0] } },
          hard: { $sum: { $cond: [{ $eq: ['$difficulty', 'Hard'] }, 1, 0] } },
      }},
      { $lookup: {
          from: 'topics',
          localField: '_id',
          foreignField: '_id',
          as: 'topicInfo',
      }},
      { $unwind: '$topicInfo' },
      { $project: {
          _id: 0,
          topic: '$topicInfo.name',
          totalSolved: 1,
          easy: 1,
          medium: 1,
          hard: 1,
      }},
      { $sort: { totalSolved: -1 } },
    ]);
    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Practice trend over time
app.get('/stats/timeline', async (req, res) => {
  try {
    const timeline = await Problem.aggregate([
      { $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$dateSolved' } },
          count: { $sum: 1 },
      }},
      { $sort: { _id: 1 } },
    ]);
    res.json(timeline);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
