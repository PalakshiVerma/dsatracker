require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Problem = require('./models/Problem');

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

// Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend is running' });
});

// Create problem
app.post('/problems', upload.single('screenshot'), async (req, res) => {
  try {
    const problemData = {
      ...req.body,
      screenshot: req.file ? `/uploads/${req.file.filename}` : null,
    };
    const problem = new Problem(problemData);
    await problem.save();
    res.status(201).json(problem);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Read single problem
app.get('/problems/:id', async (req, res) => {
  try {
    let query = Problem.findById(req.params.id);
    if (Problem.schema.path('topic')) {
      query = query.populate('topic');
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
    if (topic) filter.topic = topic;
    if (type) filter.type = type;
    if (search) {
      const hasTextIndex = Problem.schema.indexes().some(idx => idx[0] && Object.values(idx[0]).includes('text'));
      if (hasTextIndex) {
        filter.$text = { $search: search };
      } else {
        filter.$or = [
          { title: { $regex: search, $options: 'i' } },
          { type: { $regex: search, $options: 'i' } }
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
      
      // Optionally delete old screenshot
      const oldProblem = await Problem.findById(id);
      if (oldProblem && oldProblem.screenshot) {
        const oldPath = path.join(__dirname, oldProblem.screenshot);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
    }

    const problem = await Problem.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
