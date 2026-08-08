# High-Level Design (HLD) — DSA Problem Tracker

## 1. System Architecture Diagram

```mermaid
graph TD
    Client["Client Web Browser (React 18 + Vite)"]
    
    subgraph Frontend ["Frontend Layer (Port 5173 / Render)"]
        UI["App.jsx (Root Controller & Tab Switcher)"]
        PF["ProblemForm.jsx (Modal Form)"]
        PL["ProblemList.jsx & ProblemCard.jsx"]
        SD["StatsDashboard.jsx (Analytics)"]
    end
    
    subgraph Backend ["Backend Layer (Express 5 / Port 5000)"]
        Server["server.js (REST API Endpoints)"]
        Multer["Multer Storage Engine (/uploads)"]
        TopicModel["Topic Model"]
        ProblemModel["Problem Model"]
    end
    
    subgraph Database ["Persistence Layer (MongoDB / Atlas)"]
        TopicsColl[("topics Collection")]
        ProblemsColl[("problems Collection")]
    end
    
    Client --> UI
    UI --> PF
    UI --> PL
    UI --> SD
    
    PF -->|POST /problems, PUT /problems/:id, GET /topics| Server
    PL -->|GET /problems, DELETE /problems/:id| Server
    SD -->|GET /stats/summary, /stats/topic-progress, /stats/timeline| Server
    
    Server --> Multer
    Server --> TopicModel
    Server --> ProblemModel
    
    TopicModel --> TopicsColl
    ProblemModel --> ProblemsColl
```

---

## 2. Technology Stack & Layer Responsibilities

| Layer | Technology | Primary Responsibilities |
|---|---|---|
| **Presentation (Frontend)** | React 18 (Vite), Lucide Icons, Vanilla CSS | Single Page Application (SPA), state management, tab routing, interactive modal forms, progress bar rendering, metric card visualization. |
| **HTTP Client** | Axios | Asynchronous REST API requests, multipart/form-data payload transmission for screenshots. |
| **Application (Backend)** | Node.js, Express 5 | REST API routing, CORS handling, file upload processing via Multer, query parameter extraction, business logic execution. |
| **Object Data Modeling (ODM)** | Mongoose 9 | Schema validation, default values, ObjectId referencing, sub-document embedding, B-Tree index declarations, aggregation pipeline building. |
| **Database** | MongoDB / MongoDB Atlas | JSON document storage, primary key (`_id`) indexing, multi-field B-tree indexing, text indexing, native C++ aggregation framework execution. |

---

## 3. Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    TOPIC {
        ObjectId _id PK
        String name UK "Unique Topic Name"
        String description
        Date createdAt
        Date updatedAt
    }

    PROBLEM {
        ObjectId _id PK
        String title
        ObjectId topic FK "References TOPIC._id"
        String difficulty "Easy | Medium | Hard"
        String platform
        String problemUrl
        Date dateSolved
        Array notes "Embedded noteEntrySchema"
        String screenshot "File Path"
        String status "Solved | Revise Later | Important"
        Date createdAt
        Date updatedAt
    }

    NOTE_ENTRY {
        String content
        String confidence "Low | Medium | High"
        Date createdAt
    }

    TOPIC ||--o{ PROBLEM : "1-to-Many Referenced"
    PROBLEM ||--|{ NOTE_ENTRY : "1-to-Few Embedded"
```

---

## 4. End-to-End Data Flow Diagrams

### 4.1. Problem Creation & Topic Resolution Flow
```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Form as ProblemForm.jsx
    participant API as Express Server (server.js)
    participant Model as Problem & Topic Models
    participant DB as MongoDB

    User->>Form: Submits Problem details (Title, Topic, Notes, Image)
    Form->>API: POST /problems (Multipart FormData)
    API->>Model: resolveTopicId(topicInput)
    alt Topic exists
        Model-->>API: Returns existing Topic ObjectId
    else Topic does not exist
        Model->>DB: Upserts new Topic document
        DB-->>Model: Returns new Topic ObjectId
    end
    API->>API: formatNotes(notesInput, confidenceInput)
    API->>Model: new Problem(problemData).save()
    Model->>DB: Inserts Problem document
    DB-->>Model: Success
    Model->>DB: .populate('topic', 'name')
    DB-->>API: Returns populated Problem JSON
    API-->>Form: 201 Created Response
    Form-->>User: Refreshes list & closes modal
```

### 4.2. Analytics Aggregation Dashboard Flow
```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Dash as StatsDashboard.jsx
    participant API as Express Server (server.js)
    participant DB as MongoDB Aggregation Engine

    User->>Dash: Clicks "Analytics Dashboard" Tab
    Dash->>API: Promise.all([GET /stats/summary, /stats/topic-progress, /stats/timeline])
    
    par Aggregation 1: Summary
        API->>DB: Problem.aggregate([ $group by difficulty, $group by status ])
        DB-->>API: Returns difficulty & status counts
    and Aggregation 2: Topic Progress
        API->>DB: Problem.aggregate([ $group with $cond, $lookup topics, $unwind, $project ])
        DB-->>API: Returns topic mastery array
    and Aggregation 3: Timeline
        API->>DB: Problem.aggregate([ $group with $dateToString format %Y-%m ])
        DB-->>API: Returns monthly trend array
    end

    API-->>Dash: Returns JSON analytics payload
    Dash-->>User: Renders Metric Cards, Mastery Progress Bars & Timeline Cards
```

---

## 5. Security, CORS, & Deployment Architecture
- **Environment Configuration**: Key configurations (`PORT`, `MONGODB_URI`) are isolated in `backend/.env` managed via `dotenv`.
- **CORS Management**: Backend enables `cors()` middleware allowing requests from local Vite frontend (`http://localhost:5173`) and live hosting environments.
- **Static Assets**: Screenshots uploaded via `multer` are stored securely under `backend/uploads/` and exposed read-only over `/uploads/*`.
