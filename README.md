# 🌱 Mental Health Mirror

A comprehensive **mental health platform** that helps users track their emotional well-being through **voice analysis**, **personalized recommendations**, and **community support**. 💙  

---

## 📂 Project Structure
The project consists of two main components:  

- 🎨 **Frontend** → React.js + Tailwind CSS  
- ⚙️ **Backend** → Node.js + Express + MongoDB  
- 🤖 **AI Service** → Python FastAPI with NLP + Audio Analysis  

---

## ✨ Features
- 🎤 **Voice-based Mood Check-ins** → Speak about your mood & let AI analyze emotions  
- 📝 **Text-based Mood Check-ins** → Journal your feelings in text form  
- 🌿 **Plant Growth Tracker** → Gamified streak system where your plant grows with consistency  
- 🎶 **Personalized Recommendations** → Tailored music, videos, activities & journal prompts  
- 📊 **Weekly Summaries** → Downloadable **PDF reports** of mood patterns & insights  
- 📓 **Journal System** → Keep track of your thoughts & feelings  
- 🤝 **Community Support** → Connect with people who share similar experiences  

---

## 🛠️ Tech Stack

### 🎨 Frontend
- ⚛️ React.js  
- 🎨 Tailwind CSS  
- 🔗 Axios (API requests)  
- 📊 Recharts (data visualization)  
- 🎙️ Audio recording & playback  

### ⚙️ Backend
- 🟢 Node.js with Express  
- 🗄️ MongoDB + Mongoose  
- 🔐 JWT Authentication  
- 📄 PDFKit (PDF generation)  

### 🤖 AI Services
- ⚡ Python FastAPI  
- 🧠 Transformers (NLP & Sentiment Analysis)  
- 🎵 Librosa (Audio feature extraction)  
- 🗣️ Whisper (Speech-to-Text)  

---

## 🚀 Setup Instructions

### 🎨 Frontend Setup

cd frontend
npm install
npm run dev

### 🎨 Frontend Setup

cd backend
npm install

### 🤖 AI Service Setup

cd ai-service
pip install -r requirements.txt
uvicorn main:app --reload

---

### 🔗 API Endpoints

## 🔑 Authentication

- POST /api/auth/register → Register new user
- POST /api/auth/login → Login & get JWT

## 👤 User Profile

- GET /api/users/profile → Get profile
- PUT /api/users/profile → Update profile

## 😊 Mood Check-ins

- POST /api/mood/analyze-voice → Analyze voice 🎤
- POST /api/mood/analyze-text → Analyze text 📝
- POST /api/mood/check-in → Save mood check-in
- GET /api/mood/history → Get mood history

## 🎶 Recommendations

- GET /api/recommendations → Get recommendations
- POST /api/recommendations/feedback → Submit feedback
- PUT /api/recommendations/:id/complete → Mark completed

## 📊 Weekly Summaries

- GET /api/summaries → Get summaries
- POST /api/summaries/generate → Generate new summary
- GET /api/summaries/download/:filename → Download PDF

## 📓 Journal

- GET /api/journal → Get journal entries
- POST /api/journal → Create journal entry
- GET /api/journal/:id → Get entry by ID
- PUT /api/journal/:id → Update entry
- DELETE /api/journal/:id → Delete entry

## 📊 Dashboard

- GET /api/dashboard/stats → Dashboard statistics

## 🤝 Community

- GET /api/community → Get all groups
- POST /api/community → Create group
- POST /api/community/:id/join → Join group
- POST /api/community/:id/leave → Leave group
- POST /api/community/:id/message → Post message
- GET /api/community/:id/messages → Get messages

## 🤖 AI Service Endpoints

- POST /analyze-voice → Analyze emotions from voice 🎤
- POST /analyze-text → Analyze emotions from text 📝
- POST /generate-recommendations → Get personalized recommendations 🎶
- POST /generate-summary → Generate weekly insights 📊

---

### 📜 License

This project is licensed under the MIT License. ✅
