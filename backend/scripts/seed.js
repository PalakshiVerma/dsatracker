/**
 * ============================================================================
 * FILE PURPOSE: Database Seeding Script for Initial Sample / Dummy Data
 * LOCATION: backend/scripts/seed.js
 * 
 * MONGODB CONCEPT IMPLEMENTATION MATRIX:
 * ----------------------------------------------------------------------------
 * 1. CRUD Operations:
 *    - Batch creates & upserts sample Problem and Topic documents using `findOneAndUpdate`.
 * 
 * 2. Schema Modeling:
 *    - Validates data against `Topic` and `Problem` schemas (enums for difficulty/status, timestamps).
 * 
 * 3. Embedding vs Referencing Relationships:
 *    - Seeds 8 standardized `Topic` documents and links them via ObjectId references (`Problem.topic`).
 *    - Seeds embedded `notes` array entries with varying confidence levels (`High`, `Medium`, `Low`).
 * 
 * 4. Indexing for Query Performance:
 *    - Populates diverse problem dates (`dateSolved`), status, difficulty, and titles to test index performance (`IXSCAN`).
 * 
 * 5. Aggregation Pipelines:
 *    - Populates multi-topic, multi-difficulty dataset required to demonstrate `/stats/summary`, `/stats/topic-progress`, and `/stats/timeline`.
 * ============================================================================
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Topic = require('../models/Topic');
const Problem = require('../models/Problem');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dsa_tracker';

const topicsData = [
  { name: 'Arrays & Hashing', description: 'Array manipulation, hash maps, hash sets, and frequency counters' },
  { name: 'Two Pointers', description: 'Opposite ends, fast & slow pointer techniques' },
  { name: 'Sliding Window', description: 'Dynamic and fixed size sliding window problems' },
  { name: 'Stack & Queue', description: 'LIFO and FIFO data structure patterns' },
  { name: 'Binary Search', description: 'Divide and conquer searching in sorted spaces' },
  { name: 'Linked List', description: 'Singly, doubly, and circular linked list operations' },
  { name: 'Trees & Graphs', description: 'Binary trees, BST, BFS, DFS, and graph traversals' },
  { name: 'Dynamic Programming', description: 'Memoization, tabulation, and state optimization' },
];

async function seed() {
  console.log('Connecting to MongoDB for seeding...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB.');

  // Create or update Topics
  const topicMap = new Map();
  for (const t of topicsData) {
    const doc = await Topic.findOneAndUpdate(
      { name: t.name },
      { name: t.name, description: t.description },
      { upsert: true, returnDocument: 'after' }
    );
    topicMap.set(t.name, doc._id);
    console.log(`Seeded Topic: "${t.name}" (${doc._id})`);
  }

  const problemsData = [
    {
      title: 'Two Sum',
      topicName: 'Arrays & Hashing',
      difficulty: 'Easy',
      platform: 'LeetCode',
      problemUrl: 'https://leetcode.com/problems/two-sum/',
      dateSolved: new Date('2026-05-10'),
      status: 'Solved',
      notes: [{ content: 'Used HashMap to store complement values. Achieved O(N) time complexity.', confidence: 'High', createdAt: new Date('2026-05-10') }],
    },
    {
      title: 'Group Anagrams',
      topicName: 'Arrays & Hashing',
      difficulty: 'Medium',
      platform: 'LeetCode',
      problemUrl: 'https://leetcode.com/problems/group-anagrams/',
      dateSolved: new Date('2026-05-15'),
      status: 'Solved',
      notes: [{ content: 'Sorted character strings as keys in hash map. O(N * K log K) runtime.', confidence: 'High', createdAt: new Date('2026-05-15') }],
    },
    {
      title: 'Container With Most Water',
      topicName: 'Two Pointers',
      difficulty: 'Medium',
      platform: 'LeetCode',
      problemUrl: 'https://leetcode.com/problems/container-with-most-water/',
      dateSolved: new Date('2026-06-01'),
      status: 'Solved',
      notes: [{ content: 'Two pointers at array boundaries. Move pointer pointing to shorter line.', confidence: 'High', createdAt: new Date('2026-06-01') }],
    },
    {
      title: 'Trapping Rain Water',
      topicName: 'Two Pointers',
      difficulty: 'Hard',
      platform: 'LeetCode',
      problemUrl: 'https://leetcode.com/problems/trapping-rain-water/',
      dateSolved: new Date('2026-06-12'),
      status: 'Important',
      notes: [{ content: 'Maintained maxLeft and maxRight pointers. Reduced space complexity to O(1).', confidence: 'Medium', createdAt: new Date('2026-06-12') }],
    },
    {
      title: 'Longest Substring Without Repeating Characters',
      topicName: 'Sliding Window',
      difficulty: 'Medium',
      platform: 'LeetCode',
      problemUrl: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/',
      dateSolved: new Date('2026-06-20'),
      status: 'Solved',
      notes: [{ content: 'Dynamic window using hash set storing last seen char indices.', confidence: 'High', createdAt: new Date('2026-06-20') }],
    },
    {
      title: 'Valid Parentheses',
      topicName: 'Stack & Queue',
      difficulty: 'Easy',
      platform: 'LeetCode',
      problemUrl: 'https://leetcode.com/problems/valid-parentheses/',
      dateSolved: new Date('2026-07-02'),
      status: 'Solved',
      notes: [{ content: 'Pushed matching closing brackets onto stack. Verified stack is empty at end.', confidence: 'High', createdAt: new Date('2026-07-02') }],
    },
    {
      title: 'Search in Rotated Sorted Array',
      topicName: 'Binary Search',
      difficulty: 'Medium',
      platform: 'LeetCode',
      problemUrl: 'https://leetcode.com/problems/search-in-rotated-sorted-array/',
      dateSolved: new Date('2026-07-10'),
      status: 'Revise Later',
      notes: [
        { content: 'Determined which half is sorted first, then checked target boundaries.', confidence: 'Medium', createdAt: new Date('2026-07-10') },
        { content: 'Re-visited edge cases when mid equals left pointer.', confidence: 'High', createdAt: new Date('2026-08-01') }
      ],
    },
    {
      title: 'Reverse Linked List',
      topicName: 'Linked List',
      difficulty: 'Easy',
      platform: 'LeetCode',
      problemUrl: 'https://leetcode.com/problems/reverse-linked-list/',
      dateSolved: new Date('2026-07-15'),
      status: 'Solved',
      notes: [{ content: 'Iterative 3-pointer method (prev, curr, next). O(1) space complexity.', confidence: 'High', createdAt: new Date('2026-07-15') }],
    },
    {
      title: 'Merge K Sorted Lists',
      topicName: 'Linked List',
      difficulty: 'Hard',
      platform: 'LeetCode',
      problemUrl: 'https://leetcode.com/problems/merge-k-sorted-lists/',
      dateSolved: new Date('2026-07-22'),
      status: 'Important',
      notes: [{ content: 'Used Min-Heap priority queue of size K. O(N log K) time complexity.', confidence: 'Medium', createdAt: new Date('2026-07-22') }],
    },
    {
      title: 'Lowest Common Ancestor of a Binary Tree',
      topicName: 'Trees & Graphs',
      difficulty: 'Medium',
      platform: 'LeetCode',
      problemUrl: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/',
      dateSolved: new Date('2026-07-28'),
      status: 'Solved',
      notes: [{ content: 'Post-order DFS traversal. Returns node if matches p or q.', confidence: 'High', createdAt: new Date('2026-07-28') }],
    },
    {
      title: 'Number of Islands',
      topicName: 'Trees & Graphs',
      difficulty: 'Medium',
      platform: 'GeeksforGeeks',
      problemUrl: 'https://leetcode.com/problems/number-of-islands/',
      dateSolved: new Date('2026-08-02'),
      status: 'Solved',
      notes: [{ content: 'Grid DFS traversal. Sunk visited land cells by mutating grid to "0".', confidence: 'High', createdAt: new Date('2026-08-02') }],
    },
    {
      title: 'Climbing Stairs',
      topicName: 'Dynamic Programming',
      difficulty: 'Easy',
      platform: 'LeetCode',
      problemUrl: 'https://leetcode.com/problems/climbing-stairs/',
      dateSolved: new Date('2026-08-04'),
      status: 'Solved',
      notes: [{ content: 'Fibonacci DP pattern: dp[i] = dp[i-1] + dp[i-2]. Optimized to O(1) space.', confidence: 'High', createdAt: new Date('2026-08-04') }],
    },
    {
      title: 'Coin Change',
      topicName: 'Dynamic Programming',
      difficulty: 'Medium',
      platform: 'LeetCode',
      problemUrl: 'https://leetcode.com/problems/coin-change/',
      dateSolved: new Date('2026-08-05'),
      status: 'Revise Later',
      notes: [{ content: 'Unbounded knapsack DP pattern initialized to amount + 1.', confidence: 'Medium', createdAt: new Date('2026-08-05') }],
    },
    {
      title: 'Longest Increasing Subsequence',
      topicName: 'Dynamic Programming',
      difficulty: 'Medium',
      platform: 'LeetCode',
      problemUrl: 'https://leetcode.com/problems/longest-increasing-subsequence/',
      dateSolved: new Date('2026-08-06'),
      status: 'Important',
      notes: [{ content: 'O(N^2) DP or O(N log N) using binary search (patience sorting).', confidence: 'Medium', createdAt: new Date('2026-08-06') }],
    },
    {
      title: 'Edit Distance',
      topicName: 'Dynamic Programming',
      difficulty: 'Hard',
      platform: 'LeetCode',
      problemUrl: 'https://leetcode.com/problems/edit-distance/',
      dateSolved: new Date('2026-08-07'),
      status: 'Important',
      notes: [{ content: '2D DP table measuring insert, delete, replace operations.', confidence: 'Low', createdAt: new Date('2026-08-07') }],
    },
  ];

  let seededCount = 0;
  for (const prob of problemsData) {
    const topicId = topicMap.get(prob.topicName);
    if (!topicId) continue;

    await Problem.findOneAndUpdate(
      { title: prob.title },
      {
        title: prob.title,
        topic: topicId,
        difficulty: prob.difficulty,
        platform: prob.platform,
        problemUrl: prob.problemUrl,
        dateSolved: prob.dateSolved,
        status: prob.status,
        notes: prob.notes,
      },
      { upsert: true, returnDocument: 'after' }
    );
    seededCount++;
  }

  console.log(`Seeding complete. Upserted ${seededCount} realistic problem documents.`);
  process.exit(0);
}

seed().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
