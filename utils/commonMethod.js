/* eslint-disable consistent-return */
/* eslint-disable no-underscore-dangle */
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
require('dotenv').config();
const User = require('../models/User.model');
const { USER_STATUS, TOKEN_CONFIG } = require('../config/token&CommonVar');

const hashPassword = (password) => bcryptjs.hashSync(password, 10);

const createNewUser = async (userInfo) => {
  const newUser = new User(userInfo);
  await newUser.save();
  return newUser;
};

const sendResponse = (res, status, message, data = null) => res.status(status).json({
  status,
  message,
  data,
});

const handleUserStatusblock = async (userId) => {
  try {
    const foundUser = await User.findById(userId);
    if (!foundUser) {
      throw new Error('User not found');
    }

    await User.findByIdAndUpdate(userId, { status: USER_STATUS.Blocked });
  } catch (err) {
    throw new Error(err);
  }
};
const handleUserStatusUnblock = async (userId) => {
  try {
    const foundUser = await User.findById(userId);
    if (!foundUser) {
      throw new Error('User not found');
    }

    await User.findByIdAndUpdate(userId, { status: USER_STATUS.Active });
  } catch (err) {
    throw new Error(err);
  }
};

const verifyAccessToken = (token, secret) => new Promise((resolve, reject) => {
  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      reject(err);
    } else {
      resolve(decoded);
    }
  });
});

const verifyRefreshToken = (refreshToken, user, res, callback) => {
  jwt.verify(refreshToken, TOKEN_CONFIG.REFRESH_TOKEN_SECRET, async (err, decoded) => {
    if (err) {
      user.refreshToken = [];
      await user.save();
    }
    if (err || user._id !== decoded.id) return res.sendStatus(403);

    callback(user);
  });
};

const clearRefreshToken = (res, tokenConfig) => {
  res.clearCookie(tokenConfig.COOKIE_SECRET, {
    httpOnly: true,
    sameSite: 'None',
    secure: true,
  });
};

const clearPreviousRefreshTokens = async (cookies, foundUser, res) => {
  try {
    if (!cookies?.[TOKEN_CONFIG.COOKIE_SECRET]) return;

    const refreshToken = cookies[TOKEN_CONFIG.COOKIE_SECRET];
    const foundToken = await User.findOne({ refreshToken }).exec();

    if (!foundToken) {
      foundUser.refreshToken = [];
      clearRefreshToken(res, TOKEN_CONFIG);
    }
  } catch (error) {
    throw new Error('Error occurred during clearing previous refresh tokens.');
  }
};

const setCookie = (res, newRefreshToken) => {
  res.cookie(TOKEN_CONFIG.COOKIE_SECRET, newRefreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'None',
    maxAge: TOKEN_CONFIG.COOKIE_MAX_AGE,
  });
};

module.exports = {
  hashPassword,
  createNewUser,
  sendResponse,
  handleUserStatusUnblock,
  handleUserStatusblock,
  verifyRefreshToken,
  clearRefreshToken,
  setCookie,
  clearPreviousRefreshTokens,
  verifyAccessToken,
};
