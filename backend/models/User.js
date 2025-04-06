
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['student', 'professional', 'other'],
    default: 'student'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  profilePicture: {
    type: String,
    default: ''
  },
  streak: {
    count: {
      type: Number,
      default: 0
    },
    lastCheckIn: {
      type: Date,
      default: null
    },
    plantLevel: {
      type: String,
      enum: ['none', 'sprout', 'leaf', 'flower', 'tree'],
      default: 'none'
    }
  },
  wallet: {
    address: {
      type: String,
      default: ''
    },
    connected: {
      type: Boolean,
      default: false
    }
  },
  tokens: {
    balance: {
      type: Number,
      default: 0
    },
    lifetime: {
      type: Number,
      default: 0
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  }
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', UserSchema);
