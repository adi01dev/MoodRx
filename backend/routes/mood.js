
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const CheckIn = require('../models/CheckIn');
const User = require('../models/User');
const Token = require('../models/Token');
const { storage } = require('../config/cloudinary');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data'); // Ensure FormData is required in this scope if not already globally available or use 'form-data' package

// Configure multer for audio uploads using Cloudinary
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const fileTypes = /webm|mp3|wav|ogg/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Error: Audio files only!');
    }
  }
});

// @route   POST api/mood/analyze-voice
// @desc    Analyze voice recording
// @access  Private
router.post('/analyze-voice', auth, upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No audio file uploaded' });
    }

    const audioUrl = req.file.path;
    console.log('Audio uploaded to Cloudinary:', audioUrl);

    // Call Python AI service to analyze audio
    // Fetch the audio file from Cloudinary as a buffer
    const audioResponse = await axios.get(audioUrl, { responseType: 'arraybuffer' });
    const audioBuffer = Buffer.from(audioResponse.data);

    console.log('Downloaded audio from Cloudinary, size:', audioBuffer.length);

    const formData = new FormData();
    formData.append('audio', audioBuffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
      knownLength: audioBuffer.length
    });

    const response = await axios.post(`${process.env.AI_SERVICE_URL}/analyze-voice`, formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': req.header('Authorization'),
        'Content-Length': formData.getLengthSync()
      },
      maxBodyLength: Infinity,
      maxContentLength: Infinity
    });

    res.json(response.data);
  } catch (err) {
    console.error('Error analyzing voice:', err.message);
    if (err.response) {
      console.error('AI Service Error Response:', err.response.data);
      console.error('AI Service Error Status:', err.response.status);
    }
    res.status(500).json({ message: 'Error analyzing voice recording', details: err.response?.data || err.message });
  }
});

// @route   POST api/mood/analyze-text
// @desc    Analyze text sentiment
// @access  Private
router.post('/analyze-text', auth, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: 'Text is required' });
    }

    // Call Python AI service to analyze text
    const response = await axios.post(`${process.env.AI_SERVICE_URL}/analyze-text`,
      { text },
      { headers: { 'Authorization': req.header('Authorization') } }
    );

    res.json(response.data);
  } catch (err) {
    console.error('Error analyzing text:', err.message);
    if (err.response) {
      console.error('AI Service Error Response:', err.response.data);
      console.error('AI Service Error Status:', err.response.status);
    }
    res.status(500).json({ message: 'Error analyzing text', details: err.response?.data || err.message });
  }
});

// @route   POST api/mood/check-in
// @desc    Save mood check-in
// @access  Private
router.post('/check-in', auth, async (req, res) => {
  try {
    const {
      mood,
      moodScore,
      energyLevel,
      emotionalState,
      detectedEmotions,
      sentimentScore,
      method,
      text
    } = req.body;

    // Create new check-in
    const newCheckIn = new CheckIn({
      user: req.user.id,
      mood,
      moodScore,
      energyLevel,
      emotionalState,
      detectedEmotions,
      sentimentScore,
      method,
      text: text || null
    });

    // Save check-in
    const checkIn = await newCheckIn.save();

    // Update user streak
    const user = await User.findById(req.user.id);

    let tokensToAward = 0;
    let tokenDescription = '';

    // Check if this is the first check-in ever
    if (!user.streak.lastCheckIn) {
      user.streak.count = 1;
      user.streak.lastCheckIn = new Date();
      user.streak.plantLevel = 'sprout';

      // Award tokens for first check-in
      tokensToAward = 10;
      tokenDescription = 'First check-in';
    } else {
      const lastCheckIn = new Date(user.streak.lastCheckIn);
      const today = new Date();

      // Reset date time parts to compare just the dates
      lastCheckIn.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);

      // Calculate days between check-ins
      const diffTime = Math.abs(today - lastCheckIn);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        // Already checked in today, don't increment streak
      } else if (diffDays === 1) {
        // Consecutive day, increment streak
        const oldStreak = user.streak.count;
        user.streak.count += 1;
        user.streak.lastCheckIn = new Date();

        // Update plant level based on streak count
        if (user.streak.count >= 14) {
          user.streak.plantLevel = 'tree';
        } else if (user.streak.count >= 7) {
          user.streak.plantLevel = 'flower';
        } else if (user.streak.count >= 3) {
          user.streak.plantLevel = 'leaf';
        } else {
          user.streak.plantLevel = 'sprout';
        }

        // Award tokens based on streak milestones
        if (user.streak.count === 3) {
          tokensToAward = 15;
          tokenDescription = '3-day streak milestone';
        } else if (user.streak.count === 7) {
          tokensToAward = 25;
          tokenDescription = '7-day streak milestone';
        } else if (user.streak.count === 14) {
          tokensToAward = 50;
          tokenDescription = '14-day streak milestone';
        } else if (user.streak.count === 30) {
          tokensToAward = 100;
          tokenDescription = '30-day streak milestone';
        } else {
          // Regular streak day
          tokensToAward = 5;
          tokenDescription = `Day ${user.streak.count} streak`;
        }
      } else {
        // Streak broken, reset to 1
        user.streak.count = 1;
        user.streak.lastCheckIn = new Date();
        user.streak.plantLevel = 'sprout';

        // Small consolation award for coming back
        tokensToAward = 2;
        tokenDescription = 'Returned for check-in';
      }
    }

    // Update token balance if tokens were awarded
    if (tokensToAward > 0) {
      // Initialize tokens object if it doesn't exist
      if (!user.tokens) {
        user.tokens = {
          balance: 0,
          lifetime: 0,
          lastUpdated: new Date()
        };
      }

      user.tokens.balance += tokensToAward;
      user.tokens.lifetime += tokensToAward;
      user.tokens.lastUpdated = new Date();

      // Create token transaction record
      const newToken = new Token({
        user: req.user.id,
        amount: tokensToAward,
        type: 'earned',
        source: 'streak',
        description: tokenDescription
      });

      await newToken.save();
    }

    await user.save();

    // Request personalized recommendations based on mood analysis
    axios.post(`${process.env.AI_SERVICE_URL}/generate-recommendations`, {
      userId: req.user.id,
      mood,
      moodScore,
      energyLevel,
      emotionalState,
      detectedEmotions
    }, {
      headers: { 'Authorization': req.header('Authorization') }
    }).catch(err => console.error('Error generating recommendations:', err));

    res.json({
      checkIn,
      streak: user.streak,
      tokensAwarded: tokensToAward > 0 ? {
        amount: tokensToAward,
        reason: tokenDescription,
        newBalance: user.tokens.balance
      } : null
    });
  } catch (err) {
    console.error('Error saving check-in:', err);
    res.status(500).json({
      message: 'Error saving check-in',
      details: err.message, // Return the exact error message (e.g., validation failed)
      validation: err.errors // Return validation structure if it's a Mongoose error
    });
  }
});

// @route   GET api/mood/history
// @desc    Get user's mood history
// @access  Private
router.get('/history', auth, async (req, res) => {
  try {
    const checkIns = await CheckIn.find({ user: req.user.id })
      .sort({ createdAt: -1 });

    res.json(checkIns);
  } catch (err) {
    console.error('Error fetching mood history:', err);
    res.status(500).json({ message: 'Error fetching mood history' });
  }
});

module.exports = router;
