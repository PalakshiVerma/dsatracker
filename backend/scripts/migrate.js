require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Topic = require('../models/Topic');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dsa_tracker';

async function migrate() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB.');

  const db = mongoose.connection.db;
  const problemsCollection = db.collection('problems');

  const problems = await problemsCollection.find({}).toArray();
  console.log(`Found ${problems.length} problems to inspect/migrate.`);

  if (problems.length === 0) {
    console.log('No problems found. Creating a default "General" topic.');
    await Topic.findOneAndUpdate({ name: 'General' }, { name: 'General', description: 'General DSA Topic' }, { upsert: true });
    console.log('Migration completed.');
    process.exit(0);
  }

  // 1. Collect distinct legacy `type` string values
  const typeMap = new Map();

  for (const prob of problems) {
    const rawType = prob.type || 'General';
    const trimmedType = typeof rawType === 'string' ? rawType.trim() : 'General';
    if (!typeMap.has(trimmedType)) {
      const topicDoc = await Topic.findOneAndUpdate(
        { name: trimmedType },
        { name: trimmedType, description: `${trimmedType} DSA Topic` },
        { upsert: true, returnDocument: 'after' }
      );
      typeMap.set(trimmedType, topicDoc._id);
      console.log(`Ensured Topic "${trimmedType}" with ID: ${topicDoc._id}`);
    }
  }

  // Ensure default "General" topic exists
  if (!typeMap.has('General')) {
    const generalTopic = await Topic.findOneAndUpdate(
      { name: 'General' },
      { name: 'General', description: 'General DSA Topic' },
      { upsert: true, returnDocument: 'after' }
    );
    typeMap.set('General', generalTopic._id);
  }

  // 2. Migrate each problem document
  let migratedCount = 0;
  for (const prob of problems) {
    const updateOps = {};
    const unsetOps = {};

    // Handle topic reference
    if (!prob.topic || !mongoose.Types.ObjectId.isValid(prob.topic)) {
      const rawType = prob.type || 'General';
      const trimmedType = typeof rawType === 'string' ? rawType.trim() : 'General';
      const targetTopicId = typeMap.get(trimmedType) || typeMap.get('General');
      updateOps.topic = targetTopicId;
      unsetOps.type = "";
    }

    // Handle embedded notes array
    if (typeof prob.notes === 'string') {
      if (prob.notes.trim()) {
        updateOps.notes = [{
          content: prob.notes.trim(),
          confidence: 'Medium',
          createdAt: prob.createdAt || new Date()
        }];
      } else {
        updateOps.notes = [];
      }
    } else if (!Array.isArray(prob.notes)) {
      updateOps.notes = [];
    }

    const modifier = {};
    if (Object.keys(updateOps).length > 0) {
      modifier.$set = updateOps;
    }
    if (Object.keys(unsetOps).length > 0) {
      modifier.$unset = unsetOps;
    }

    if (Object.keys(modifier).length > 0) {
      await problemsCollection.updateOne({ _id: prob._id }, modifier);
      migratedCount++;
    }
  }

  console.log(`Migration successful. Migrated ${migratedCount} problem documents.`);
  process.exit(0);
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
