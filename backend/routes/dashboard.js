
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const CheckIn = require('../models/CheckIn');
const Journal = require('../models/Journal');
const User = require('../models/User');
const Token = require('../models/Token');

// @route   GET api/dashboard/stats
// @desc    Get dashboard statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    // Get user data for streak info
    const user = await User.findById(req.user.id);
    
    // Get total check-ins count
    const totalCheckIns = await CheckIn.countDocuments({ user: req.user.id });
    
    // Get most recent check-in
    const lastCheckIn = await CheckIn.findOne({ user: req.user.id })
      .sort({ createdAt: -1 });
    
    // Get completed journals count
    const completedJournals = await Journal.countDocuments({ user: req.user.id });
    
    // Get token balance
    const tokenBalance = user.tokens ? user.tokens.balance : 0;
    
    // Prepare response object
    const stats = {
      streakCount: user.streak.count,
      totalCheckIns,
      lastCheckIn: lastCheckIn ? lastCheckIn.createdAt : null,
      currentMood: lastCheckIn ? lastCheckIn.mood : null,
      completedJournals,
      tokenBalance
    };
    
    res.json(stats);
  } catch (err) {
    console.error('Error fetching dashboard stats:', err);
    res.status(500).json({ message: 'Error fetching dashboard stats' });
  }
});

module.exports = router;
