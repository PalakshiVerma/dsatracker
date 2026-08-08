# Product Requirement Document (PRD) — DSA Problem Tracker

## 1. Executive Summary
The **DSA Problem Tracker** is a specialized web application designed for software engineers and computer science students preparing for technical coding interviews. It allows users to track solved Data Structures & Algorithms (DSA) problems, categorize them by standardized topics, record revision notes with self-assessed confidence levels, upload solution screenshots, and visualize learning progress via an automated analytics dashboard.

> **Scope Note**: This document strictly covers features that are fully implemented and verified in the application repository.

---

## 2. Product Goals & Objectives
- **Centralized Tracking**: Provide a single repository for all solved DSA questions across platforms (LeetCode, GeeksforGeeks, CodeStudio, etc.).
- **Structured Revision**: Support spaced repetition by embedding revision note histories with confidence ratings (`Low`, `Medium`, `High`).
- **Standardized Categorization**: Eliminate duplicate topic entries using a normalized topic reference system.
- **Server-Driven Performance**: Offload searching, filtering, pagination, and analytics calculations directly to MongoDB using indexes and aggregation pipelines.

---

## 3. User Personas
- **Interview Candidate**: Needs to organize 100+ solved problems, search by topic or keyword, and quickly identify weak topics requiring revision.
- **Student / Learner**: Needs a visual analytics dashboard showing practice consistency and topic mastery breakdown over time.

---

## 4. Implemented Feature Specifications

### 4.1. Navigation & View Modes
- **Header Tab Switcher**: Top-level tab toggle allowing instant navigation between **Problems List** and **Analytics Dashboard**.
- **Responsive Layout**: Dark-themed, glassmorphic container layout adapting seamlessly across desktop and mobile viewports.

### 4.2. Problem Management (CRUD Operations)
- **Create Problem**: Form supporting Problem Title, Topic Selection (dropdown from database + inline creation of new topics), Difficulty (`Easy`, `Medium`, `Hard`), Platform (LeetCode, GFG, etc.), Problem URL, Date Solved, Status (`Solved`, `Revise Later`, `Important`), Initial Note with Confidence Level (`Low`, `Medium`, `High`), and optional Screenshot Upload.
- **Read / List Problems**: Displays paginated problem cards sorted by `dateSolved` descending.
- **Read Single Problem**: Fetches specific problem by ID via `GET /problems/:id` with populated topic details.
- **Update Problem**: Modal form allowing modification of problem attributes, replacing or keeping screenshots, and appending new revision notes with confidence ratings. Enforces Mongoose schema validation (`runValidators: true`).
- **Delete Problem**: Removes problem document from MongoDB and automatically unlinks the associated uploaded screenshot image file from backend disk storage.

### 4.3. Search, Filter & Server-Side Pagination
- **Free-Text Search**: Search bar querying problem titles and revision notes using backend text index matching or regex search.
- **Difficulty Filter**: Dropdown filtering list by `Easy`, `Medium`, or `Hard`.
- **Topic Filter**: Dropdown populated from `GET /topics` filtering list by normalized topic ID.
- **Server-Side Pagination**: API queries return paginated payloads `{ data, total, page, pages }` using `.skip()` and `.limit()`.

### 4.4. Topic Management
- **Normalized Topic List**: Endpoint `GET /topics` listing all topics sorted alphabetically.
- **Dynamic Topic Creation**: Endpoint `POST /topics` enabling on-the-fly creation of unique topic entities.

### 4.5. Analytics & Progress Dashboard
- **Overview Metric Cards**:
  - Total Problems Solved counter.
  - Difficulty distribution split (`Easy` / `Medium` / `Hard`).
  - Flagged question totals (`Revise Later`, `Important`).
- **Topic Mastery Breakdown**:
  - Visual stacked progress bars showing problem counts per topic broken down by difficulty segments.
- **Monthly Practice Momentum**:
  - Grid cards showing practice trends grouped by month (`YYYY-MM`).

### 4.6. Data Utilities
- **Automated Migration Script (`backend/scripts/migrate.js`)**: Converts legacy flat schema string fields into normalized `Topic` references and embedded note arrays.
- **Data Seeding Script (`backend/scripts/seed.js`)**: Populates 8 standard topics and 15 realistic DSA problem records with revision histories and dates.

---

## 5. Non-Functional Requirements (NFRs)

| Requirement | Implementation Detail |
|---|---|
| **Data Integrity** | Enforced at database engine level via Mongoose Schema rules, required fields, enum validation, and unique indexes. |
| **Performance** | $O(\log N)$ query lookups enabled by B-Tree single-field, compound, and text indexes on MongoDB. |
| **Security & CORS** | Express `cors` middleware enabled for cross-origin requests. API environment variables configured via `dotenv`. |
| **Media Handling** | Disk storage uploads managed via `multer`, served as static assets over `/uploads`. |
