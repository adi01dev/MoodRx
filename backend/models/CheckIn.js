
const mongoose = require('mongoose');

const CheckInSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mood: {
    type: String,
    required: true
  },
  moodScore: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  energyLevel: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  emotionalState: {
    type: String,
    required: true
  },
  detectedEmotions: [{
    type: String
  }],
  sentimentScore: {
    type: Number,
    required: true
  },
  method: {
    type: String,
    enum: ['voice', 'text'],
    required: true
  },
  text: {
    type: String
  },
  audioPath: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('CheckIn', CheckInSchema);
