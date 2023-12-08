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
      type: Object,
      enum: { admin: 1000, user: 2000, editor: 3000 },
      default: {
        admin: 1000,
      },
    },
    refreshToken: {
      type: String,
      default: '',
    },
  },
);

const User = mongoose.model('User', userSchema);
module.exports = User;
