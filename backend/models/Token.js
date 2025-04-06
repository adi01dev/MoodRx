
const mongoose = require('mongoose');

const TokenSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['earned', 'spent'],
    required: true
  },
  source: {
    type: String,
    enum: ['streak', 'recommendation', 'community', 'redemption', 'admin'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Token', TokenSchema);
