const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// @route   GET api/plants/growth
// @desc    Get user's plant growth status
// @access  Private
router.get('/growth', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('streak');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Return the plant level and streak details
        res.json({
            plantLevel: user.streak.plantLevel || 'sprout',
            streakCount: user.streak.count || 0,
            lastCheckIn: user.streak.lastCheckIn
        });
    } catch (err) {
        console.error('Error fetching plant growth:', err);
        res.status(500).json({ message: 'Error fetching plant growth data' });
    }
});

module.exports = router;
