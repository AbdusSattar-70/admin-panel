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
      default: null,
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
    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user',
    },
  },
);

const User = mongoose.model('User', userSchema);
module.exports = User;
