
# Mental Health Mirror

A comprehensive mental health platform that helps users track their emotional well-being through voice analysis, personalized recommendations, and community support.

## Project Structure

The project consists of two main components:

1. **Frontend**: React.js application with Tailwind CSS
2. **Backend**: Node.js Express API with MongoDB database and a Python-based AI service

## Features

- **Voice-based Mood Check-ins**: Speak about your mood and let AI analyze your emotions
- **Text-based Mood Check-ins**: Alternative option for journaling your feelings
- **Plant Growth Tracker**: Gamified streak system where your plant grows with consistent check-ins
- **Personalized Recommendations**: Get tailored music, videos, activities, and journal prompts
- **Weekly Summaries**: Downloadable PDF reports of your mood patterns and insights
- **Journal System**: Keep track of your thoughts and feelings over time
- **Community Support**: Connect with others who have similar emotional experiences

## Technical Stack

### Frontend
- React.js
- Tailwind CSS
- Axios for API requests
- Recharts for data visualization
- Audio recording and playback capabilities

### Backend
- Node.js with Express
- MongoDB database with Mongoose
- JWT authentication
- PDF generation with PDFKit

### AI Services
- Python FastAPI
- Transformers for NLP and sentiment analysis
- Librosa for audio feature extraction
- Whisper for speech-to-text conversion

## Setup Instructions

### Frontend Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Start the development server:
```bash
npm run dev
```

### Backend Setup

1. Install dependencies:
```bash
cd backend
npm install
```

2. Create a `.env` file in the backend directory with the following variables:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/mental_health_mirror
JWT_SECRET=your_jwt_secret_key_change_this_in_production
AI_SERVICE_URL=http://localhost:8000
```

3. Start the backend server:
```bash
npm run dev
```

### AI Service Setup

1. Install Python dependencies:
```bash
cd ai-service
pip install -r requirements.txt
```

2. Start the AI service:
```bash
uvicorn main:app --reload
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token

### User Profile
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Mood Check-ins
- `POST /api/mood/analyze-voice` - Analyze voice recording
- `POST /api/mood/analyze-text` - Analyze text sentiment
- `POST /api/mood/check-in` - Save mood check-in
- `GET /api/mood/history` - Get user's mood history

### Recommendations
- `GET /api/recommendations` - Get user's recommendations
- `POST /api/recommendations/feedback` - Submit feedback for a recommendation
- `PUT /api/recommendations/:id/complete` - Mark recommendation as completed

### Weekly Summaries
- `GET /api/summaries` - Get user's summaries
- `POST /api/summaries/generate` - Generate a new summary
- `GET /api/summaries/download/:filename` - Download a summary PDF

### Journal
- `GET /api/journal` - Get user's journal entries
- `POST /api/journal` - Create a new journal entry
- `GET /api/journal/:id` - Get a journal entry by ID
- `PUT /api/journal/:id` - Update a journal entry
- `DELETE /api/journal/:id` - Delete a journal entry

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

### Community
- `GET /api/community` - Get all community groups
- `POST /api/community` - Create a new community group
- `POST /api/community/:id/join` - Join a community group
- `POST /api/community/:id/leave` - Leave a community group
- `POST /api/community/:id/message` - Post a message to a community group
- `GET /api/community/:id/messages` - Get messages from a community group

## AI Service Endpoints

- `POST /analyze-voice` - Analyze voice recording to detect mood and emotions
- `POST /analyze-text` - Analyze text to detect mood and emotions
- `POST /generate-recommendations` - Generate personalized recommendations
- `POST /generate-summary` - Generate weekly summary insights

## License

This project is licensed under the MIT License
