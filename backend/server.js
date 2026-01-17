
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');


// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/mood', require('./routes/mood'));
app.use('/api/recommendations', require('./routes/recommendations'));
app.use('/api/summaries', require('./routes/summaries'));
app.use('/api/journal', require('./routes/journal'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/community', require('./routes/community'));
app.use('/api/tokens', require('./routes/tokens'));
const groupRoutes = require("./routes/group.js");
app.use("/api", groupRoutes);



// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');

    // Optional: Run seed script if specified
    if (process.env.SEED_DATA === 'true') {
      require('./scripts/seedData');
    }
  })
  .catch(err => console.error('MongoDB connection error:', err));



// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
