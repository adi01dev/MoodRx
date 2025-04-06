
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Recommendation = require('../models/Recommendation');
const User = require('../models/User');
const Token = require('../models/Token');

// @route   GET api/recommendations
// @desc    Get user's recommendations
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const recommendations = await Recommendation.find({ 
      user: req.user.id,
      // Only show recent recommendations (last 7 days)
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    }).sort({ createdAt: -1 });
    
    res.json(recommendations);
  } catch (err) {
    console.error('Error fetching recommendations:', err);
    res.status(500).json({ message: 'Error fetching recommendations' });
  }
});

// @route   POST api/recommendations/feedback
// @desc    Submit feedback for a recommendation
// @access  Private
router.post('/feedback', auth, async (req, res) => {
  try {
    const { recommendationId, helpful } = req.body;
    
    // Update recommendation with feedback
    const recommendation = await Recommendation.findOneAndUpdate(
      { _id: recommendationId, user: req.user.id },
      { 
        'feedback.helpful': helpful,
        'feedback.timestamp': new Date()
      },
      { new: true }
    );
    
    if (!recommendation) {
      return res.status(404).json({ message: 'Recommendation not found' });
    }
    
    // If the feedback was positive, award tokens
    if (helpful) {
      // Get user
      const user = await User.findById(req.user.id);
      
      // Award tokens
      const tokensToAward = 2;
      user.tokens.balance += tokensToAward;
      user.tokens.lifetime += tokensToAward;
      user.tokens.lastUpdated = new Date();
      
      await user.save();
      
      // Create token transaction record
      const newToken = new Token({
        user: req.user.id,
        amount: tokensToAward,
        type: 'earned',
        source: 'recommendation',
        description: 'Provided feedback on recommendation'
      });
      
      await newToken.save();
    }
    
    res.json(recommendation);
  } catch (err) {
    console.error('Error submitting feedback:', err);
    res.status(500).json({ message: 'Error submitting feedback' });
  }
});

// @route   PUT api/recommendations/:id/complete
// @desc    Mark recommendation as completed
// @access  Private
router.put('/:id/complete', auth, async (req, res) => {
  try {
    const recommendation = await Recommendation.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { isCompleted: true },
      { new: true }
    );
    
    if (!recommendation) {
      return res.status(404).json({ message: 'Recommendation not found' });
    }
    
    // Award tokens for completing recommendation
    const user = await User.findById(req.user.id);
    
    // Award tokens
    const tokensToAward = 5;
    user.tokens.balance += tokensToAward;
    user.tokens.lifetime += tokensToAward;
    user.tokens.lastUpdated = new Date();
    
    await user.save();
    
    // Create token transaction record
    const newToken = new Token({
      user: req.user.id,
      amount: tokensToAward,
      type: 'earned',
      source: 'recommendation',
      description: `Completed recommendation: ${recommendation.title || 'Wellness recommendation'}`
    });
    
    await newToken.save();
    
    res.json({
      recommendation,
      tokensAwarded: tokensToAward,
      newBalance: user.tokens.balance
    });
  } catch (err) {
    console.error('Error marking recommendation as completed:', err);
    res.status(500).json({ message: 'Error marking recommendation as completed' });
  }
});

module.exports = router;
