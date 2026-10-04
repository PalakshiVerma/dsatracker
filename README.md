# DSA Problem Tracker

A full-stack application designed to help students and developers track and analyze their Data Structures and Algorithms (DSA) practice.

## 🚀 Live Demo

- **Frontend App:** [https://dsatracker-pct6.onrender.com](https://dsatracker-pct6.onrender.com)
- **Backend API:** [https://dsa-tracker-2ttg.onrender.com](https://dsa-tracker-2ttg.onrender.com)
- **Database:** MongoDB Atlas

## The Problem

When practicing DSA questions, it's easy to lose track of what has been solved, which topic it belonged to, the difficulty level, and most importantly, the key insights or tricks learned. This app provides a centralized dashboard to log every problem, store notes, and even save screenshots for quick visual recall.

## Features

- **Store Detailed Records**: Title, Topic, Difficulty, Platform, URL, and Date Solved.
- **Rich Notes**: Save tricks, time complexity, and learning points.
- **Screenshot Support**: Upload images to visually remember specific problem statements or diagrams.
- **Status Tracking**: Mark problems as "Solved", "Revise Later", or "Important".
- **Dashboard View**: View all problems in a clean, card-based interface.
- **Search & Filter**: Find problems by title, topic, or difficulty.

## Tech Stack

- **Frontend**: React (Vite)
- **Backend**: Node.js + Express
- **Database**: MongoDB (via Mongoose)
- **Image Handling**: Multer
- **Icons**: Lucide-React
- **Styling**: Vanilla CSS (Custom Design System)

## Prerequisites

- [Node.js](https://nodejs.org/) installed.
- [MongoDB](https://www.mongodb.com/try/download/community) installed and running locally.

## Setup Instructions

### 1. Backend Setup
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file (see `.env.example`):
   ```bash
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/dsa_tracker
   ```
4. Run the backend:
   ```bash
   npm start
   ```
   *(Note: Ensure MongoDB is running on your machine)*

### 2. Frontend Setup
1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Exclusions & Future Work
- **Authentication**: This is a personal local tool; auth was excluded for simplicity.
- **Cloud Storage**: Screenshots are stored locally in the `backend/uploads` folder.
- **Complex Analytics**: Focused on core CRUD operations first.
