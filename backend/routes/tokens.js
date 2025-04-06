
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Token = require('../models/Token');

// @route   GET api/tokens
// @desc    Get user's token history
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const tokens = await Token.find({ user: req.user.id })
      .sort({ createdAt: -1 });
    
    res.json(tokens);
  } catch (err) {
    console.error('Error fetching token history:', err);
    res.status(500).json({ message: 'Error fetching token history' });
  }
});

// @route   POST api/tokens
// @desc    Add tokens to user (for activities like games)
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { amount, type, source, description } = req.body;
    
    if (!amount || !type || !source || !description) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    if (type !== 'earned' && type !== 'spent') {
      return res.status(400).json({ message: 'Type must be either earned or spent' });
    }
    
    // Find user and update token balance
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Initialize tokens object if it doesn't exist
    if (!user.tokens) {
      user.tokens = {
        balance: 0,
        lifetime: 0,
        lastUpdated: new Date()
      };
    }
    
    // Update token balance
    if (type === 'earned') {
      user.tokens.balance += amount;
      user.tokens.lifetime += amount;
    } else {
      // Don't allow negative balance
      if (user.tokens.balance < amount) {
        return res.status(400).json({ message: 'Insufficient token balance' });
      }
      user.tokens.balance -= amount;
    }
    
    user.tokens.lastUpdated = new Date();
    await user.save();
    
    // Create token transaction record
    const newToken = new Token({
      user: req.user.id,
      amount,
      type,
      source,
      description
    });
    
    const token = await newToken.save();
    
    res.json({
      token,
      newBalance: user.tokens.balance
    });
  } catch (err) {
    console.error('Error updating tokens:', err);
    res.status(500).json({ message: 'Error updating tokens' });
  }
});

module.exports = router;
