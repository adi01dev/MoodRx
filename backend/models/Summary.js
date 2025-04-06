
const mongoose = require('mongoose');

const SummarySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  available: {
    type: Boolean,
    default: true
  },
  url: {
    type: String
  },
  pdfPath: {
    type: String
  },
  checkIns: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CheckIn'
  }],
  insights: {
    type: String
  },
  recommendations: {
    type: String
  }
});

module.exports = mongoose.model('Summary', SummarySchema);
