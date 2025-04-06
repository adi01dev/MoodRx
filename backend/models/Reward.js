
const mongoose = require('mongoose');

const RewardSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String
  },
  tokenCost: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    enum: ['therapy', 'content', 'plant', 'other'],
    default: 'other'
  },
  available: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Reward', RewardSchema);
