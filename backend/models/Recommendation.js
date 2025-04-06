
const mongoose = require('mongoose');

const RecommendationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['music', 'video', 'activity', 'journal'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  link: {
    type: String
  },
  source: {
    type: String
  },
  mood: {
    type: String
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  feedback: {
    helpful: {
      type: Boolean,
      default: null
    },
    timestamp: {
      type: Date
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Recommendation', RecommendationSchema);
