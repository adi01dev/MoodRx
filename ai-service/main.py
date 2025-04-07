import os
import tempfile
import json
import torch
import numpy as np
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Request, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from pydub import AudioSegment
import librosa
import soundfile as sf
from transformers import pipeline, AutoModelForSequenceClassification, AutoTokenizer
from typing import List, Dict, Any, Optional
import requests
from dotenv import load_dotenv
import jwt
from datetime import datetime, timedelta
import pytz
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from fpdf import FPDF
import logging
from io import BytesIO

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

app = FastAPI(title="Mental Health Mirror AI Service")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# JWT Authentication settings
JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key")
JWT_ALGORITHM = "HS256"

# Initialize sentiment analysis pipeline
sentiment_model = "distilbert-base-uncased-finetuned-sst-2-english"
sentiment_pipeline = pipeline("sentiment-analysis", model=sentiment_model)

# Initialize emotion detection pipeline
emotion_model = "j-hartmann/emotion-english-distilroberta-base"
emotion_pipeline = pipeline("text-classification", model=emotion_model, top_k=3)

# Initialize speech recognition pipeline
speech_model = "openai/whisper-small"
speech_pipeline = pipeline("automatic-speech-recognition", model=speech_model)

# Load recommendation data
RECOMMENDATION_DATA = {
    "happy": {
        "music": [
            {"title": "Happy Upbeat Playlist", "description": "Energetic songs to match your positive mood", "link": "https://open.spotify.com/playlist/37i9dQZF1DX3rxVfibe1L0"},
            {"title": "Feel-Good Classics", "description": "Timeless songs that will keep your good mood going", "link": "https://open.spotify.com/playlist/37i9dQZF1DX9XIFQuFvzM4"}
        ],
        "video": [
            {"title": "Funny Animal Compilations", "description": "Cute and funny animal videos to keep you smiling", "link": "https://www.youtube.com/results?search_query=funny+animal+compilation"},
            {"title": "Comedy Specials", "description": "Laugh out loud with these stand-up comedy shows", "link": "https://www.youtube.com/results?search_query=best+comedy+specials"}
        ],
        "activity": [
            {"title": "Creative Expression", "description": "Channel your positive energy into a creative project like painting or crafting"},
            {"title": "Social Connection", "description": "Share your good mood with friends or family - plan a get-together"}
        ],
        "journal": [
            {"title": "Gratitude Reflection", "description": "Write down three things you're grateful for today"},
            {"title": "Positive Moments", "description": "Document what made you happy today so you can revisit these moments later"}
        ]
    },
    "sad": {
        "music": [
            {"title": "Calm & Comforting Playlist", "description": "Soothing music to help process your emotions", "link": "https://open.spotify.com/playlist/37i9dQZF1DX3Ogo9pFvBkY"},
            {"title": "Uplifting Melodies", "description": "Gently uplifting songs to improve your mood", "link": "https://open.spotify.com/playlist/37i9dQZF1DX9tPFwDMOaN1"}
        ],
        "video": [
            {"title": "Heartwarming Stories", "description": "Videos that restore faith in humanity", "link": "https://www.youtube.com/results?search_query=heartwarming+stories+that+restore+faith+in+humanity"},
            {"title": "Relaxing Nature Documentaries", "description": "Immerse yourself in the beauty of nature", "link": "https://www.youtube.com/results?search_query=beautiful+nature+documentary"}
        ],
        "activity": [
            {"title": "Gentle Movement", "description": "A short, gentle walk outdoors to get fresh air and shift your perspective"},
            {"title": "Self-Care Ritual", "description": "Take a warm bath or shower, make some tea, and wrap yourself in a cozy blanket"}
        ],
        "journal": [
            {"title": "Emotional Release", "description": "Write freely about what you're feeling without judgment"},
            {"title": "Self-Compassion Letter", "description": "Write to yourself with the same kindness you'd offer a good friend"}
        ]
    },
    "anxious": {
        "music": [
            {"title": "Calm Meditation Music", "description": "Peaceful sounds to help reduce anxiety", "link": "https://open.spotify.com/playlist/37i9dQZF1DX3Ogo9pFvBkY"},
            {"title": "Ambient Soundscapes", "description": "Ambient music to help you focus and calm your mind", "link": "https://open.spotify.com/playlist/37i9dQZF1DX3Ogo9pFvBkY"}
        ],
        "video": [
            {"title": "Guided Breathing Exercises", "description": "Follow along with these calming breathing techniques", "link": "https://www.youtube.com/results?search_query=guided+breathing+exercises+for+anxiety"},
            {"title": "Gentle Yoga for Anxiety", "description": "Simple yoga poses to release tension", "link": "https://www.youtube.com/results?search_query=gentle+yoga+for+anxiety+relief"}
        ],
        "activity": [
            {"title": "5-4-3-2-1 Grounding Exercise", "description": "Name 5 things you can see, 4 things you can touch, 3 things you can hear, 2 things you can smell, and 1 thing you can taste"},
            {"title": "Progressive Muscle Relaxation", "description": "Tense and then release each muscle group in your body to release physical tension"}
        ],
        "journal": [
            {"title": "Worry Dump", "description": "Write down all your worries to get them out of your head"},
            {"title": "Evidence Challenging", "description": "List your anxious thoughts and then write evidence for and against them"}
        ]
    },
    "angry": {
        "music": [
            {"title": "Calming Classical", "description": "Soothing classical pieces to help you cool down", "link": "https://open.spotify.com/playlist/37i9dQZF1DWWEJlAGA9gs0"},
            {"title": "Release Playlist", "description": "Music to help process and release anger", "link": "https://open.spotify.com/playlist/37i9dQZF1DX3YSRoSdA634"}
        ],
        "video": [
            {"title": "Guided Anger Meditation", "description": "Meditation specifically designed to help with anger", "link": "https://www.youtube.com/results?search_query=guided+meditation+for+anger"},
            {"title": "Nature Time-lapses", "description": "Beautiful, slow-moving nature videos to shift your focus", "link": "https://www.youtube.com/results?search_query=beautiful+nature+time+lapse"}
        ],
        "activity": [
            {"title": "Physical Release", "description": "Go for a run, hit a pillow, or do jumping jacks to release the physical energy of anger"},
            {"title": "Cool Down Strategy", "description": "Place a cool washcloth on your face or neck, or hold an ice cube - the cold sensation can help reset your nervous system"}
        ],
        "journal": [
            {"title": "Anger Letter (Don't Send)", "description": "Write an uncensored letter expressing your feelings, but don't send it"},
            {"title": "Needs Identification", "description": "What need isn't being met? Write about what you really need in this situation"}
        ]
    },
    "neutral": {
        "music": [
            {"title": "Discover Weekly", "description": "Explore new music tailored to your taste", "link": "https://open.spotify.com/playlist/37i9dQZEVXcQ9Aow7qH0GW"},
            {"title": "Focus Playlist", "description": "Background music to help you focus on tasks", "link": "https://open.spotify.com/playlist/37i9dQZF1DX8NTLI2TtZa6"}
        ],
        "video": [
            {"title": "Fascinating Documentaries", "description": "Learn something new and interesting", "link": "https://www.youtube.com/results?search_query=best+short+documentaries"},
            {"title": "TED Talks", "description": "Inspiring talks on various topics", "link": "https://www.youtube.com/c/TED/videos"}
        ],
        "activity": [
            {"title": "Skill Building", "description": "Use this neutral state to learn something new or practice a skill"},
            {"title": "Mindful Activity", "description": "Do a routine activity (like washing dishes) but with complete focus and attention to the sensory experience"}
        ],
        "journal": [
            {"title": "Goal Setting", "description": "Use this balanced state to think about your goals and what steps you can take toward them"},
            {"title": "Reflection Questions", "description": "What's been on your mind lately? What are you looking forward to?"}
        ]
    },
    "tired": {
        "music": [
            {"title": "Gentle Wake-Up Playlist", "description": "Soft, gradually energizing music", "link": "https://open.spotify.com/playlist/37i9dQZF1DX1n9whBbBKoL"},
            {"title": "Low-Fi Beats", "description": "Relaxing background music that won't overstimulate", "link": "https://open.spotify.com/playlist/37i9dQZF1DWWQRwui0ExPn"}
        ],
        "video": [
            {"title": "Gentle Morning Yoga", "description": "Easy stretches to wake up your body", "link": "https://www.youtube.com/results?search_query=gentle+morning+yoga"},
            {"title": "Motivational Short Videos", "description": "Brief inspiration to get you going", "link": "https://www.youtube.com/results?search_query=short+motivational+videos"}
        ],
        "activity": [
            {"title": "Nature Reset", "description": "Spend 10 minutes outside in natural light to help reset your circadian rhythm"},
            {"title": "Micro-Exercise", "description": "Do just 5 minutes of movement - often that's enough to boost your energy"}
        ],
        "journal": [
            {"title": "Energy Audit", "description": "What's draining your energy lately? What gives you energy?"},
            {"title": "Rest Reflection", "description": "Are you getting enough quality rest? What could help improve your sleep?"}
        ]
    },
    "energetic": {
        "music": [
            {"title": "Workout Beats", "description": "High-energy music for maximum motivation", "link": "https://open.spotify.com/playlist/37i9dQZF1DX76Wlfdnj7AP"},
            {"title": "Dance Party Mix", "description": "Upbeat songs to match your energy", "link": "https://open.spotify.com/playlist/37i9dQZF1DX0BcQWzuB7ZO"}
        ],
        "video": [
            {"title": "Dance Workouts", "description": "Fun dance routines to channel your energy", "link": "https://www.youtube.com/results?search_query=fun+dance+workout"},
            {"title": "DIY Project Tutorials", "description": "Productive ways to use your high energy", "link": "https://www.youtube.com/results?search_query=quick+DIY+projects"}
        ],
        "activity": [
            {"title": "Creative Project", "description": "Start that project you've been thinking about - your energy will help you make progress"},
            {"title": "High Intensity Exercise", "description": "Channel your energy into a workout that will leave you feeling accomplished"}
        ],
        "journal": [
            {"title": "Inspiration Capture", "description": "Write down all the ideas coming to you while your energy is high"},
            {"title": "Achievement Planning", "description": "What could you accomplish today with this energy? Make an action plan"}
        ]
    }
}

def extract_audio_features(file_path):
    """Extract audio features from a sound file."""
    # Load the audio file
    y, sr = librosa.load(file_path, sr=None)
    
    # Extract features
    # 1. Mel-frequency cepstral coefficients (MFCCs)
    mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
    mfcc_mean = np.mean(mfccs, axis=1)
    
    # 2. Spectral centroid
    centroid = librosa.feature.spectral_centroid(y=y, sr=sr)
    centroid_mean = np.mean(centroid)
    
    # 3. Spectral contrast
    contrast = librosa.feature.spectral_contrast(y=y, sr=sr)
    contrast_mean = np.mean(contrast, axis=1)
    
    # 4. Zero crossing rate
    zcr = librosa.feature.zero_crossing_rate(y)
    zcr_mean = np.mean(zcr)
    
    # 5. RMS energy
    rms = librosa.feature.rms(y=y)
    rms_mean = np.mean(rms)
    
    # 6. Tempo
    onset_env = librosa.onset.onset_strength(y=y, sr=sr)
    tempo = librosa.beat.tempo(onset_envelope=onset_env, sr=sr)
    
    # Create features dictionary
    features = {
        "mfcc_mean": mfcc_mean.tolist(),
        "centroid_mean": float(centroid_mean),
        "contrast_mean": contrast_mean.tolist(),
        "zcr_mean": float(zcr_mean),
        "rms_mean": float(rms_mean),
        "tempo": float(tempo[0])
    }
    
    return features

def analyze_voice_features(features):
    """Analyze voice features to determine emotional state."""
    # This is a simplified rule-based approach
    # In a real system, you would use a trained ML model
    
    zcr = features["zcr_mean"]
    rms = features["rms_mean"]
    tempo = features["tempo"]
    centroid = features["centroid_mean"]
    
    # Energy level (1-10 scale)
    energy = min(10, max(1, int(rms * 50)))
    
    # Determine emotional characteristics
    emotional_state = "neutral"
    
    if rms > 0.1 and tempo > 120:
        emotional_state = "excited" if zcr < 0.1 else "anxious"
    elif rms < 0.05:
        emotional_state = "calm" if centroid < 2000 else "sad"
    elif tempo < 100:
        emotional_state = "tired" if rms < 0.08 else "relaxed"
    
    # Map emotional state to mood
    mood_map = {
        "excited": "happy",
        "anxious": "anxious",
        "calm": "neutral",
        "sad": "sad",
        "tired": "tired",
        "relaxed": "neutral"
    }
    
    mood = mood_map.get(emotional_state, "neutral")
    
    return {
        "emotional_state": emotional_state,
        "energy": energy,
        "mood": mood
    }

def analyze_text_sentiment(text):
    """Analyze text to determine sentiment and emotions."""
    # Get sentiment
    sentiment_result = sentiment_pipeline(text)[0]
    sentiment_label = sentiment_result["label"]
    sentiment_score = sentiment_result["score"]
    
    # Normalize sentiment score to -1 to 1 scale
    normalized_score = sentiment_score if sentiment_label == "POSITIVE" else -sentiment_score
    
    # Map to 1-10 scale for the app
    mood_score = int((normalized_score + 1) * 5)
    
    # Get emotions
    emotions_result = emotion_pipeline(text)
    detected_emotions = [item["label"] for item in emotions_result]
    
    # Map sentiment to mood
    if normalized_score > 0.6:
        mood = "happy"
    elif normalized_score > 0.2:
        mood = "neutral"
    elif normalized_score > -0.2:
        mood = "neutral"
    elif normalized_score > -0.6:
        mood = "sad"
    else:
        mood = "sad"
    
    # Adjust mood based on detected emotions
    if "anger" in detected_emotions:
        mood = "angry"
    elif "fear" in detected_emotions:
        mood = "anxious"
    
    # Get energy level based on emotion intensity
    energy_map = {
        "joy": 8,
        "optimism": 7,
        "neutral": 5,
        "sadness": 3,
        "anger": 6,
        "fear": 4,
        "surprise": 7
    }
    
    energy_values = [energy_map.get(emotion, 5) for emotion in detected_emotions]
    energy_level = int(sum(energy_values) / len(energy_values)) if energy_values else 5
    
    return {
        "mood": mood,
        "score": mood_score,
        "energy": energy_level,
        "sentimentScore": normalized_score,
        "emotional_state": detected_emotions[0] if detected_emotions else "neutral",
        "detected_emotions": detected_emotions
    }

def get_recommendations(mood, energy_level, detected_emotions=[]):
    """Generate personalized recommendations based on mood and energy level."""
    # Normalize mood to one of our categories
    mood_categories = ["happy", "sad", "anxious", "angry", "neutral", "tired", "energetic"]
    
    if mood not in mood_categories:
        # Map to the closest category
        if mood in ["excited", "joyful"]:
            mood = "happy"
        elif mood in ["depressed", "melancholy"]:
            mood = "sad"
        elif mood in ["stressed", "worried", "fearful"]:
            mood = "anxious"
        elif mood in ["irritated", "frustrated"]:
            mood = "angry"
        elif mood in ["fatigued", "exhausted"]:
            mood = "tired"
        elif energy_level >= 7:
            mood = "energetic"
        else:
            mood = "neutral"
    
    # Get recommendations for the mood
    recommendations = []
    
    if mood in RECOMMENDATION_DATA:
        mood_recs = RECOMMENDATION_DATA[mood]
        
        # Add 1 music recommendation
        if "music" in mood_recs and mood_recs["music"]:
            music_rec = mood_recs["music"][0]
            recommendations.append({
                "type": "music",
                "title": music_rec["title"],
                "description": music_rec["description"],
                "link": music_rec["link"],
                "mood": mood
            })
        
        # Add 1 video recommendation
        if "video" in mood_recs and mood_recs["video"]:
            video_rec = mood_recs["video"][0]
            recommendations.append({
                "type": "video",
                "title": video_rec["title"],
                "description": video_rec["description"],
                "link": video_rec["link"],
                "mood": mood
            })
        
        # Add 1 activity recommendation
        if "activity" in mood_recs and mood_recs["activity"]:
            activity_rec = mood_recs["activity"][0]
            recommendations.append({
                "type": "activity",
                "title": activity_rec["title"],
                "description": activity_rec["description"],
                "mood": mood
            })
        
        # Add 1 journal recommendation
        if "journal" in mood_recs and mood_recs["journal"]:
            journal_rec = mood_recs["journal"][0]
            recommendations.append({
                "type": "journal",
                "title": journal_rec["title"],
                "description": journal_rec["description"],
                "mood": mood
            })
    
    return recommendations

def get_game_recommendations(mood, energy_level):
    """Generate game recommendations based on mood and energy level."""
    games = [
        {
            "id": "breathing",
            "name": "Breathing Exercise",
            "description": "A guided breathing exercise to help reduce stress and anxiety.",
            "suitable_for": ["anxious", "stressed", "sad", "angry"],
            "energy_required": "low"
        },
        {
            "id": "memory",
            "name": "Memory Match",
            "description": "A fun memory matching game to help focus your mind on a pleasant task.",
            "suitable_for": ["neutral", "sad", "bored", "tired"],
            "energy_required": "medium"
        },
        {
            "id": "color-relax",
            "name": "Color Relaxation",
            "description": "A color-based relaxation exercise to calm your mind.",
            "suitable_for": ["anxious", "angry", "stressed", "energetic"],
            "energy_required": "low"
        }
    ]
    
    # Map mood to suitable games
    mood_map = {
        "happy": ["memory", "color-relax"],
        "sad": ["breathing", "memory"],
        "anxious": ["breathing", "color-relax"],
        "angry": ["breathing", "color-relax"],
        "neutral": ["memory", "color-relax"],
        "tired": ["breathing"],
        "energetic": ["memory", "color-relax"]
    }
    
    # Get suitable games based on mood
    recommended_games = []
    
    if mood in mood_map:
        recommended_game_ids = mood_map[mood]
        for game in games:
            if game["id"] in recommended_game_ids:
                recommended_games.append(game)
    else:
        # Default recommendation if mood not found
        recommended_games = [games[0], games[2]]  # Breathing and Color Relaxation
    
    # Sort games based on energy level
    if energy_level < 4:  # Low energy
        recommended_games.sort(key=lambda x: 0 if x["energy_required"] == "low" else 1)
    else:  # Higher energy
        recommended_games.sort(key=lambda x: 0 if x["energy_required"] == "medium" else 1)
    
    return recommended_games

def generate_mood_summary_pdf(check_ins, user_id):
    """Generate a PDF report of mood check-ins."""
    try:
        # Create a DataFrame from check-ins
        df = pd.DataFrame(check_ins)
        df['date'] = pd.to_datetime(df['createdAt'])
        
        # Create temporary directory for files
        temp_dir = tempfile.mkdtemp()
        
        # Create plots
        plt.figure(figsize=(10, 6))
        
        # Mood score over time
        plt.subplot(2, 1, 1)
        plt.plot(df['date'], df['moodScore'], marker='o', linestyle='-', color='#4B9CD3')
        plt.title('Mood Score Over Time')
        plt.ylabel('Mood Score')
        plt.ylim(0, 10)
        plt.grid(True, linestyle='--', alpha=0.7)
        
        # Energy level over time
        plt.subplot(2, 1, 2)
        plt.plot(df['date'], df['energyLevel'], marker='o', linestyle='-', color='#F26522')
        plt.title('Energy Level Over Time')
        plt.xlabel('Date')
        plt.ylabel('Energy Level')
        plt.ylim(0, 10)
        plt.grid(True, linestyle='--', alpha=0.7)
        
        plt.tight_layout()
        
        # Save plot to file
        plot_path = os.path.join(temp_dir, f"mood_chart_{user_id}.png")
        plt.savefig(plot_path)
        plt.close()
        
        # Create a PDF
        pdf = FPDF()
        pdf.add_page()
        
        # Title
        pdf.set_font('Arial', 'B', 16)
        pdf.cell(0, 10, 'Mood Summary Report', 0, 1, 'C')
        pdf.ln(5)
        
        # Date range
        pdf.set_font('Arial', '', 12)
        date_range = f"Report period: {df['date'].min().strftime('%Y-%m-%d')} to {df['date'].max().strftime('%Y-%m-%d')}"
        pdf.cell(0, 10, date_range, 0, 1)
        pdf.ln(5)
        
        # Statistics
        pdf.set_font('Arial', 'B', 14)
        pdf.cell(0, 10, 'Summary Statistics:', 0, 1)
        pdf.set_font('Arial', '', 12)
        pdf.cell(0, 10, f"Average Mood Score: {df['moodScore'].mean():.1f}/10", 0, 1)
        pdf.cell(0, 10, f"Average Energy Level: {df['energyLevel'].mean():.1f}/10", 0, 1)
        
        # Most frequent mood
        mood_counts = df['mood'].value_counts()
        most_common = mood_counts.index[0] if not mood_counts.empty else "N/A"
        pdf.cell(0, 10, f"Most Common Mood: {most_common}", 0, 1)
        pdf.ln(10)
        
        # Add chart
        pdf.set_font('Arial', 'B', 14)
        pdf.cell(0, 10, 'Mood and Energy Trends:', 0, 1)
        pdf.image(plot_path, x=10, y=None, w=190)
        pdf.ln(130)  # Space for the chart
        
        # Recommendations
        pdf.set_font('Arial', 'B', 14)
        pdf.cell(0, 10, 'Recommendations:', 0, 1)
        pdf.set_font('Arial', '', 12)
        
        if df['moodScore'].mean() < 4:
            pdf.multi_cell(0, 10, '• Consider speaking with a mental health professional\n• Prioritize self-care and rest\n• Try daily mood-boosting activities')
        elif df['moodScore'].mean() < 7:
            pdf.multi_cell(0, 10, '• Maintain healthy habits\n• Incorporate mindfulness practices\n• Stay connected with supportive people')
        else:
            pdf.multi_cell(0, 10, '• Great job maintaining positive mental health\n• Continue your current wellness practices\n• Share your strategies with others who might benefit')
        
        # Save the PDF to a temporary file
        pdf_path = os.path.join(temp_dir, f"mood_summary_{user_id}.pdf")
        pdf.output(pdf_path)
        
        return pdf_path
        
    except Exception as e:
        logger.error(f"Error generating PDF: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating PDF: {str(e)}")

@app.get("/")
async def root():
    """Root endpoint to check if the service is running."""
    return {"message": "Mental Health Mirror AI Service is running"}

def verify_token(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")
    
    try:
        token = authorization.replace("Bearer ", "")
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("user", {}).get("id")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token payload")
        return user_id
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


@app.post("/analyze-voice")
async def analyze_voice(audio: UploadFile = File(...), user_id: str = Depends(verify_token)):
    """Analyze voice recording to detect mood and emotions."""
    try:
        logger.info(f"Analyzing voice for user {user_id}")
        # Save the uploaded file temporarily
        temp_dir = tempfile.mkdtemp()
        temp_audio_path = os.path.join(temp_dir, "audio_file")
        
        with open(temp_audio_path, "wb") as buffer:
            while chunk := await audio.read(1024 * 1024):  # 1 MB chunks
                buffer.write(chunk)

        
        # Convert WebM to WAV for processing if needed
        file_extension = os.path.splitext(audio.filename)[1].lower()
        processed_audio_path = temp_audio_path
        
        if file_extension not in [".webm", ".wav", ".mp3"]:
            raise HTTPException(status_code=400, detail="Unsupported file format")


        if file_extension == ".webm":
            wav_path = os.path.join(temp_dir, "audio_file.wav")
            audio_segment = AudioSegment.from_file(temp_audio_path, format="webm")
            audio_segment.export(wav_path, format="wav")
            processed_audio_path = wav_path
        
        # Transcribe audio to text
        transcription = speech_pipeline(processed_audio_path)
        transcribed_text = transcription["text"]
        
        # Extract audio features
        audio_features = extract_audio_features(processed_audio_path)
        
        # Analyze voice features
        voice_analysis = analyze_voice_features(audio_features)
        
        # Analyze text sentiment
        text_analysis = analyze_text_sentiment(transcribed_text)
        
        # Combine analyses
        combined_analysis = {
            "mood": text_analysis["mood"],
            "score": text_analysis["score"],
            "energy": (text_analysis["energy"] + voice_analysis["energy"]) // 2,
            "sentimentScore": text_analysis["sentimentScore"],
            "emotional_state": text_analysis["emotional_state"],
            "detected_emotions": text_analysis["detected_emotions"],
            "transcribed_text": transcribed_text,
            "user_id": user_id
        }
        
        # Generate game recommendations based on emotional state
        game_recommendations = get_game_recommendations(combined_analysis["mood"], combined_analysis["energy"])
        combined_analysis["game_recommendations"] = game_recommendations
        
        return combined_analysis
    
    except Exception as e:
        logger.error(f"Error analyzing voice: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error analyzing voice: {str(e)}")

@app.post("/analyze-text")
async def analyze_text(request: Request, user_id: str = Depends(verify_token)):
    """Analyze text to detect mood and emotions."""
    try:
        data = await request.json()
        text = data.get("text")
        
        if not text:
            raise HTTPException(status_code=400, detail="Text is required")
        
        analysis = analyze_text_sentiment(text)
        analysis["user_id"] = user_id
        return analysis
    
    except Exception as e:
        logger.error(f"Error analyzing text: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error analyzing text: {str(e)}")

@app.post("/generate-recommendations")
async def generate_recommendations(request: Request, user_id: str = Depends(verify_token)):
    """Generate personalized recommendations based on mood analysis."""
    try:
        data = await request.json()
        
        mood = data.get("mood")
        energy_level = data.get("energyLevel")
        detected_emotions = data.get("detectedEmotions", [])
        
        if not mood or not energy_level:
            raise HTTPException(status_code=400, detail="Missing required fields")
        
        recommendations = get_recommendations(mood, energy_level, detected_emotions)
        
        return {"recommendations": recommendations, "user_id": user_id}
    
    except Exception as e:
        logger.error(f"Error generating recommendations: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating recommendations: {str(e)}")

@app.post("/generate-summary")
async def generate_summary(request: Request, user_id: str = Depends(verify_token)):
    """Generate weekly summary insights based on check-in data."""
    try:
        data = await request.json()
        check_ins = data.get("checkIns", [])
        
        if not check_ins:
            raise HTTPException(status_code=400, detail="No check-in data provided")
        
        # Analyze mood patterns
        moods = [check_in.get("mood") for check_in in check_ins]
        scores = [check_in.get("moodScore") for check_in in check_ins]
        energy_levels = [check_in.get("energyLevel") for check_in in check_ins]
        
        # Calculate average mood score and energy level
        avg_score = sum(scores) / len(scores) if scores else 0
        avg_energy = sum(energy_levels) / len(energy_levels) if energy_levels else 0
        
        # Count mood frequencies
        mood_counts = {}
        for mood in moods:
            if mood:
                mood_counts[mood] = mood_counts.get(mood, 0) + 1
        
        # Get most common mood
        most_common_mood = max(mood_counts.items(), key=lambda x: x[1])[0] if mood_counts else "neutral"
        
        # Generate insights
        insights = f"This week, your average mood score was {avg_score:.1f}/10 and your average energy level was {avg_energy:.1f}/10. "
        insights += f"You most frequently reported feeling {most_common_mood}. "
        
        # Add trend analysis
        if len(scores) >= 3:
            if scores[-1] > scores[0]:
                insights += "Your mood has been improving over the week. "
            elif scores[-1] < scores[0]:
                insights += "Your mood has slightly declined over the week. "
            else:
                insights += "Your mood has remained relatively stable. "
        
        # Add recommendations based on mood patterns
        recommendations = "Based on your mood patterns this week, consider the following:\n\n"
        
        if avg_score < 4:
            recommendations += "• Your mood has been on the lower side. Consider scheduling time with a trusted friend or mental health professional.\n"
            recommendations += "• Set aside time each day for self-care activities that have helped you feel better in the past.\n"
            recommendations += "• Ensure you're getting adequate sleep, nutrition, and some light physical activity.\n"
        elif avg_score < 7:
            recommendations += "• Your mood has been moderate. Pay attention to what activities boost your mood and try to incorporate more of them.\n"
            recommendations += "• Practice mindfulness or meditation to help maintain emotional balance.\n"
            recommendations += "• Consider setting small, achievable goals to build momentum and confidence.\n"
        else:
            recommendations += "• Your mood has been positive! Reflect on what's working well and continue these practices.\n"
            recommendations += "• Share your positive energy with others through acts of kindness or connection.\n"
            recommendations += "• Document what's going well to reference during more challenging times.\n"
        
        if avg_energy < 4:
            recommendations += "• Your energy has been low. Check your sleep quality and quantity.\n"
            recommendations += "• Consider gentle exercise like walking or stretching to naturally boost energy.\n"
        elif avg_energy > 7:
            recommendations += "• You've had high energy. Channel this productively into activities that matter to you.\n"
            recommendations += "• Ensure you're also building in adequate rest periods to sustain your energy.\n"
        
        return {
            "insights": insights,
            "recommendations": recommendations,
            "user_id": user_id
        }
    
    except Exception as e:
        logger.error(f"Error generating summary: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating summary: {str(e)}")

@app.post("/generate-pdf-report")
async def generate_pdf_report(request: Request, user_id: str = Depends(verify_token)):
    """Generate and return a PDF report of mood check-ins."""
    try:
        data = await request.json()
        check_ins = data.get("checkIns", [])
        
        if not check_ins:
            raise HTTPException(status_code=400, detail="No check-in data provided")
        
        # Generate PDF
        pdf_path = generate_mood_summary_pdf(check_ins, user_id)
        
        # Return the PDF file
        return FileResponse(
            path=pdf_path, 
            filename="mood_summary.pdf", 
            media_type="application/pdf"
        )
    
    except Exception as e:
        logger.error(f"Error generating PDF report: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating PDF report: {str(e)}")

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.get("/stats")
async def get_stats(user_id: str = Depends(verify_token)):
    """Get AI service statistics for a specific user."""
    # This would typically connect to a database to fetch real stats
    # For this example, we'll return mock data
    return {
        "total_analyses": 24,
        "voice_analyses": 10,
        "text_analyses": 14,
        "most_common_mood": "neutral",
        "average_mood_score": 6.7,
        "user_id": user_id
    }

def verify_token(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")
    
    try:
        token = authorization.replace("Bearer ", "")
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("user", {}).get("id")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token payload")
        return user_id
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)