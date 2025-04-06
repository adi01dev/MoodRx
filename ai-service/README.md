
# Mental Health Mirror AI Service

This is the Python-based AI service for the Mental Health Mirror application. It provides endpoints for voice analysis, text sentiment analysis, and recommendation generation.

## Features

- Voice-based mood analysis
- Text sentiment analysis
- Personalized recommendations based on mood
- Weekly summary generation

## Setup

### Requirements

- Python 3.8+
- pip

### Installation

1. Install dependencies:

```bash
pip install -r requirements.txt
```

2. Start the server:

```bash
uvicorn main:app --reload
```

The API will be available at http://localhost:8000

### Docker

Alternatively, you can run the service using Docker:

```bash
docker build -t mental-health-ai-service .
docker run -p 8000:8000 mental-health-ai-service
```

## API Endpoints

### `POST /analyze-voice`

Analyzes a voice recording to detect mood and emotions.

**Request:**
- Form data with an `audio` file (supports .webm, .mp3, .wav, .ogg)

**Response:**
```json
{
  "mood": "happy",
  "score": 8,
  "energy": 7,
  "sentimentScore": 0.85,
  "emotional_state": "joy",
  "detected_emotions": ["joy", "optimism"],
  "transcribed_text": "I'm feeling great today and looking forward to getting some work done."
}
```

### `POST /analyze-text`

Analyzes text to detect mood and emotions.

**Request:**
```json
{
  "text": "I'm feeling great today and looking forward to getting some work done."
}
```

**Response:**
```json
{
  "mood": "happy",
  "score": 8,
  "energy": 7,
  "sentimentScore": 0.85,
  "emotional_state": "joy",
  "detected_emotions": ["joy", "optimism"]
}
```

### `POST /generate-recommendations`

Generates personalized recommendations based on mood analysis.

**Request:**
```json
{
  "userId": "user123",
  "mood": "happy",
  "energyLevel": 7,
  "detectedEmotions": ["joy", "optimism"]
}
```

**Response:**
```json
{
  "recommendations": [
    {
      "type": "music",
      "title": "Happy Upbeat Playlist",
      "description": "Energetic songs to match your positive mood",
      "link": "https://open.spotify.com/playlist/37i9dQZF1DX3rxVfibe1L0",
      "mood": "happy"
    },
    {
      "type": "video",
      "title": "Funny Animal Compilations",
      "description": "Cute and funny animal videos to keep you smiling",
      "link": "https://www.youtube.com/results?search_query=funny+animal+compilation",
      "mood": "happy"
    }
  ]
}
```

### `POST /generate-summary`

Generates weekly summary insights based on check-in data.

**Request:**
```json
{
  "checkIns": [
    {
      "mood": "happy",
      "moodScore": 8,
      "energyLevel": 7,
      "emotionalState": "joy",
      "detectedEmotions": ["joy", "optimism"],
      "sentimentScore": 0.85,
      "createdAt": "2023-04-01T12:00:00Z"
    },
    {
      "mood": "neutral",
      "moodScore": 5,
      "energyLevel": 6,
      "emotionalState": "neutral",
      "detectedEmotions": ["neutral"],
      "sentimentScore": 0.2,
      "createdAt": "2023-04-02T12:00:00Z"
    }
  ]
}
```

**Response:**
```json
{
  "insights": "This week, your average mood score was 6.5/10 and your average energy level was 6.5/10. You most frequently reported feeling happy. Your mood has declined over the week.",
  "recommendations": "Based on your mood patterns this week, consider the following:\n\n• Your mood has been moderate. Pay attention to what activities boost your mood and try to incorporate more of them.\n• Practice mindfulness or meditation to help maintain emotional balance.\n• Consider setting small, achievable goals to build momentum and confidence.\n• You've had high energy. Channel this productively into activities that matter to you.\n• Ensure you're also building in adequate rest periods to sustain your energy."
}
```
