
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Community = require('../models/Community');
const User = require('../models/User');

// Load environment variables
dotenv.config();

// Initialize data
const initializeData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    // Check if there are any community groups
    const groupCount = await Community.countDocuments();
    
    if (groupCount === 0) {
      console.log('No community groups found. Creating initial groups...');
      
      // Find an admin user to set as creator
      const adminUser = await User.findOne({ role: 'admin' });
      
      if (!adminUser) {
        console.log('No admin user found. Creating a default community group with no members.');
      }
      
      // Initial community groups
      const sampleGroups = [
        {
          name: 'Anxiety Support',
          description: 'A safe space to share experiences and coping strategies for anxiety.',
          category: 'support',
          members: adminUser ? [adminUser._id] : []
        },
        {
          name: 'Mindfulness Practice',
          description: 'Group dedicated to sharing mindfulness techniques and daily practices.',
          category: 'wellness',
          members: adminUser ? [adminUser._id] : []
        },
        {
          name: 'Student Mental Health',
          description: 'Support group for students dealing with academic stress and pressure.',
          category: 'students',
          members: adminUser ? [adminUser._id] : []
        },
        {
          name: 'Mood Boosters',
          description: 'Share positive experiences, achievements, and things that lift your mood.',
          category: 'positivity',
          members: adminUser ? [adminUser._id] : []
        },
        {
          name: 'Sleep Better',
          description: 'Discussion group for improving sleep quality and addressing sleep issues.',
          category: 'wellness',
          members: adminUser ? [adminUser._id] : []
        }
      ];
      
      // Insert community groups
      await Community.insertMany(sampleGroups);
      console.log(`Successfully created ${sampleGroups.length} community groups.`);
    } else {
      console.log(`Found ${groupCount} existing community groups. Skipping initialization.`);
    }
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    
    process.exit(0);
  } catch (error) {
    console.error('Error initializing data:', error);
    process.exit(1);
  }
};

// Run the initialization
initializeData();
