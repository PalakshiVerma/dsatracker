# Low-Level Design (LLD) — DSA Problem Tracker

## 1. Module-by-Module Technical Specification

### 1.1. Backend Module Architecture

#### A. `backend/models/Topic.js`
- **Purpose**: Mongoose Schema & Model for normalized topics.
- **Fields**:
  - `name`: `{ type: String, required: true, unique: true, trim: true }`
  - `description`: `{ type: String, trim: true }`
  - `timestamps`: `true` (`createdAt`, `updatedAt`)
- **Export**: `mongoose.model('Topic', topicSchema)`

#### B. `backend/models/Problem.js`
- **Purpose**: Main Mongoose Schema & Model for DSA problems.
- **Sub-Schema (`noteEntrySchema`)**:
  - `content`: `{ type: String, required: true }`
  - `confidence`: `{ type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' }`
  - `createdAt`: `{ type: Date, default: Date.now }`
  - Options: `{ _id: false }`
- **Fields**:
  - `title`: `{ type: String, required: true, trim: true }`
  - `topic`: `{ type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true }`
  - `difficulty`: `{ type: String, enum: ['Easy', 'Medium', 'Hard'], required: true }`
  - `platform`: `{ type: String, trim: true }`
  - `problemUrl`: `{ type: String, trim: true }`
  - `dateSolved`: `{ type: Date, default: Date.now }`
  - `notes`: `[noteEntrySchema]`
  - `screenshot`: `{ type: String }`
  - `status`: `{ type: String, enum: ['Solved', 'Revise Later', 'Important'], default: 'Solved' }`
  - `timestamps`: `true`
- **Declared Indexes**:
  - `problemSchema.index({ difficulty: 1 })`
  - `problemSchema.index({ status: 1 })`
  - `problemSchema.index({ topic: 1 })`
  - `problemSchema.index({ dateSolved: -1 })`
  - `problemSchema.index({ status: 1, difficulty: 1 })`
  - `problemSchema.index({ title: 'text', 'notes.content': 'text' })`

#### C. `backend/server.js`
- **Purpose**: Express server, Middleware, File Uploads, REST Controllers, Aggregation Pipelines.
- **Helper Functions**:
  - `resolveTopicId(topicInput)`: Resolves topic string or ObjectId to a valid `Topic._id`. Creates topic if non-existent.
  - `formatNotes(notesInput, confidenceInput)`: Formats incoming string or JSON note payloads into `noteEntrySchema` array objects.

#### D. Utility Scripts
- **`backend/scripts/migrate.js`**: Connects via Mongoose connection driver, queries raw `problems` collection, extracts distinct `type` string values, upserts corresponding `Topic` records, converts `Problem.type` to `Topic._id`, and converts string `notes` to embedded note array objects.
- **`backend/scripts/seed.js`**: Seeds 8 standard topics and 15 complete problem records spanning multiple difficulty levels, statuses, solved dates, and revision notes.

---

### 1.2. Frontend Module Architecture

#### A. `frontend/src/App.jsx`
- **State**:
  - `activeTab`: `'problems' | 'stats'`
  - `problems`: `Array<Problem>`
  - `topics`: `Array<Topic>`
  - `loading`: `Boolean`
  - `error`: `String | null`
  - `searchTerm`: `String`
  - `filterDifficulty`: `String`
  - `filterTopic`: `String`

#### B. `frontend/src/components/ProblemForm.jsx`
- **Props**: `{ onClose, onSuccess, editingProblem, apiUrl }`
- **State**: `topics`, `selectedTopic`, `customTopic`, `isCustomTopic`, `formData`, `screenshot`, `loading`.
- **Behavior**: Renders topic selection `<select>` populated from `GET /topics`, includes `+ Add New Topic...` toggle, and captures note text + confidence level.

#### C. `frontend/src/components/ProblemCard.jsx`
- **Props**: `{ problem, onEdit, onDelete, apiUrl }`
- **Behavior**: Renders problem card containing title, difficulty badge, status indicator, populated topic name, platform link, screenshot thumbnail, and revision history list showing confidence badges (`High 🟢`, `Medium 🟡`, `Low 🔴`) and timestamps.

#### D. `frontend/src/components/StatsDashboard.jsx`
- **Props**: `{ apiUrl }`
- **State**: `summary`, `topicProgress`, `timeline`, `loading`, `error`.
- **Behavior**: Calls `GET /stats/summary`, `GET /stats/topic-progress`, `GET /stats/timeline` in parallel via `Promise.all` and renders Overview Metric Cards, Topic Mastery Progress Bars, and Monthly Solving Momentum cards.

---

## 2. API Endpoint Route Specifications

### 2.1. `POST /problems`
- **Description**: Create a new problem.
- **Request Format**: `multipart/form-data`
- **Payload Fields**: `title`, `topic`, `difficulty`, `platform`, `problemUrl`, `dateSolved`, `status`, `notes`, `confidence`, `screenshot` (file).
- **Response**: `201 Created` — Populated Problem object:
  ```json
  {
    "_id": "66b4f100a123...",
    "title": "Two Sum",
    "topic": { "_id": "66b4f000b456...", "name": "Arrays & Hashing" },
    "difficulty": "Easy",
    "status": "Solved",
    "notes": [{ "content": "Used HashMap", "confidence": "High", "createdAt": "2026-08-08T17:00:00.000Z" }],
    "createdAt": "2026-08-08T17:00:00.000Z"
  }
  ```

### 2.2. `GET /problems`
- **Description**: Read paginated list of problems with filtering and search.
- **Query Parameters**: `difficulty`, `status`, `topic`, `search`, `page` (default 1), `limit` (default 20).
- **Response**: `200 OK`
  ```json
  {
    "data": [ /* Array of populated Problem objects */ ],
    "total": 15,
    "page": 1,
    "pages": 1
  }
  ```

### 2.3. `GET /problems/:id`
- **Description**: Read single problem by ID.
- **Response**: `200 OK` or `404 Not Found`.

### 2.4. `PUT /problems/:id`
- **Description**: Update existing problem with `runValidators: true` and `returnDocument: 'after'`.
- **Request Format**: `multipart/form-data`
- **Response**: `200 OK` — Updated populated Problem object.

### 2.5. `DELETE /problems/:id`
- **Description**: Delete problem and remove associated screenshot file.
- **Response**: `200 OK` — `{ "message": "Problem deleted successfully" }`.

### 2.6. `GET /topics` & `POST /topics`
- **GET /topics**: Returns array of all Topic documents sorted alphabetically by `name`.
- **POST /topics**: Creates a new Topic document `{ "name": "DP", "description": "..." }`.

---

## 3. Aggregation Pipeline Technical Specifications

### 3.1. `/stats/summary`
```js
// Pipeline 1: Difficulty Breakdown
[
  { $group: { _id: '$difficulty', count: { $sum: 1 } } },
  { $sort: { count: -1 } }
]

// Pipeline 2: Status Breakdown
[
  { $group: { _id: '$status', count: { $sum: 1 } } }
]
```

### 3.2. `/stats/topic-progress`
```js
[
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
  { $sort: { totalSolved: -1 } }
]
```

### 3.3. `/stats/timeline`
```js
[
  { $group: {
      _id: { $dateToString: { format: '%Y-%m', date: '$dateSolved' } },
      count: { $sum: 1 },
  }},
  { $sort: { _id: 1 } }
]
```
