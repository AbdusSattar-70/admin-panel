const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    lastLoginTime: {
      type: Date,
      default: '',
    },
    registrationTime: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['active', 'blocked'],
      default: 'active',
    },
    roles: {
      Admin: {
        type: Number,
        default: 1000,
      },
      Editor: Number,
      User: Number,
    },
    refreshToken: [String],
  },
);

const User = mongoose.model('User', userSchema);
module.exports = User;
